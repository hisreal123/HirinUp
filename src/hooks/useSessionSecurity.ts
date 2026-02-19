"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

type SessionStatus = "active" | "blocked" | "expired" | "checking";

interface SessionSecurityState {
  sessionId: string;
  status: SessionStatus;
  blockedReason?: string;
}

interface UseSessionSecurityOptions {
  responseToken: string;
  enabled?: boolean;
  heartbeatInterval?: number; // ms
  onSessionBlocked?: (reason: string) => void;
}

// Create Supabase client for realtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Multi-layer session security hook
 *
 * Layer 1: BroadcastChannel - Same browser, different tabs (instant)
 * Layer 2: API heartbeat - Cross-browser/device session validation
 * Layer 3: Database session tracking (via API)
 * Layer 4: Supabase Realtime - Instant cross-device notifications
 */
export function useSessionSecurity({
  responseToken,
  enabled = true,
  heartbeatInterval = 20000, // 20 seconds (was 10s — reduces DB writes by 50%)
  onSessionBlocked,
}: UseSessionSecurityOptions) {
  const [state, setState] = useState<SessionSecurityState>({
    sessionId: "",
    status: "checking",
  });

  const sessionIdRef = useRef<string>("");
  const statusRef = useRef<SessionStatus>("checking"); // Ref so callbacks don't recreate on status change
  const channelRef = useRef<BroadcastChannel | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isClaimingRef = useRef<boolean>(false);
  const onSessionBlockedRef = useRef(onSessionBlocked);

  // Keep callback ref up to date without causing re-renders
  useEffect(() => {
    onSessionBlockedRef.current = onSessionBlocked;
  }, [onSessionBlocked]);

  const setStatus = useCallback((status: SessionStatus, blockedReason?: string) => {
    statusRef.current = status;
    setState((prev) => ({ ...prev, status, blockedReason }));
  }, []);

  // Generate unique session ID on mount
  useEffect(() => {
    if (!enabled || !responseToken) return;

    const newSessionId = nanoid();
    sessionIdRef.current = newSessionId;
    setState((prev) => ({ ...prev, sessionId: newSessionId }));

    return () => {
      sessionIdRef.current = "";
    };
  }, [enabled, responseToken]);

  // ==========================================
  // LAYER 1: BroadcastChannel (Same Browser)
  // Runs once — uses statusRef instead of state.status
  // ==========================================
  useEffect(() => {
    if (!enabled || !responseToken || !sessionIdRef.current) return;

    const channelName = `foloup_session_${responseToken}`;

    try {
      const channel = new BroadcastChannel(channelName);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, sessionId: incomingSessionId, timestamp } = event.data;

        if (type === "SESSION_CLAIM" && incomingSessionId !== sessionIdRef.current) {
          channel.postMessage({
            type: "SESSION_CONFLICT",
            sessionId: sessionIdRef.current,
            timestamp: Date.now(),
          });
        }

        if (type === "SESSION_CONFLICT" && incomingSessionId !== sessionIdRef.current) {
          const ourTimestamp = parseInt(
            localStorage.getItem(`session_ts_${responseToken}`) || "0"
          );

          if (timestamp < ourTimestamp) {
            console.log("[SessionSecurity L1] Session conflict - this tab is blocked");
            setStatus("blocked", "Interview is open in another tab");
            onSessionBlockedRef.current?.("Interview is open in another tab");
          }
        }

        if (type === "SESSION_PING") {
          channel.postMessage({
            type: "SESSION_PONG",
            sessionId: sessionIdRef.current,
            timestamp: Date.now(),
          });
        }

        if (type === "SESSION_PONG" && incomingSessionId !== sessionIdRef.current) {
          console.log("[SessionSecurity L1] Another active tab detected via pong");
          setStatus("blocked", "Interview is already open in another tab");
          onSessionBlockedRef.current?.("Interview is already open in another tab");
        }
      };

      channel.postMessage({
        type: "SESSION_PING",
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
      });

      const claimTimeout = setTimeout(() => {
        if (statusRef.current !== "blocked") {
          localStorage.setItem(`session_ts_${responseToken}`, Date.now().toString());
          channel.postMessage({
            type: "SESSION_CLAIM",
            sessionId: sessionIdRef.current,
            timestamp: Date.now(),
          });
          console.log("[SessionSecurity L1] Session claimed via BroadcastChannel");
        }
      }, 300);

      return () => {
        clearTimeout(claimTimeout);
        channel.close();
        channelRef.current = null;
      };
    } catch (error) {
      console.warn("[SessionSecurity L1] BroadcastChannel not supported:", error);
    }
  }, [enabled, responseToken, setStatus]); // No state.status — uses statusRef

  // ==========================================
  // LAYER 2 & 3: API Session Claim & Heartbeat
  // ==========================================
  const claimSession = useCallback(async () => {
    if (!enabled || !responseToken || !sessionIdRef.current || isClaimingRef.current) {

      return false;
    }

    isClaimingRef.current = true;

    try {
      const response = await fetch("/api/session/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: responseToken,
          session_id: sessionIdRef.current,
          fingerprint: await getBrowserFingerprint(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setStatus("blocked", data.message || "Session active on another device/browser");
          onSessionBlockedRef.current?.(data.message || "Session active on another device/browser");

          return false;
        }
        if (response.status === 410) {
          setStatus("expired", data.message || "Interview has ended");
          onSessionBlockedRef.current?.(data.message || "Interview has ended");

          return false;
        }
        throw new Error(data.error || "Failed to claim session");
      }

      setStatus("active");
      console.log("[SessionSecurity L2] Session claimed via API");

      return true;
    } catch (error) {
      console.error("[SessionSecurity L2] Failed to claim session:", error);
      // Don't block on network errors
      setStatus("active");

      return true;
    } finally {
      isClaimingRef.current = false;
    }
  }, [enabled, responseToken, setStatus]); // No state.status — uses statusRef

  const sendHeartbeat = useCallback(async () => {
    if (!enabled || !responseToken || !sessionIdRef.current || statusRef.current !== "active") {
      return;
    }

    try {
      const response = await fetch("/api/session/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: responseToken,
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        if (response.status === 409 || response.status === 401) {
          setStatus("blocked", data.message || "Session invalidated");
          onSessionBlockedRef.current?.(data.message || "Session invalidated");
        }
      }
    } catch (error) {
      console.warn("[SessionSecurity L2] Heartbeat failed (network):", error);
    }
  }, [enabled, responseToken, setStatus]); // No state.status — uses statusRef

  // Claim session once on mount — not re-triggered by status changes
  useEffect(() => {
    if (!enabled || !responseToken || !sessionIdRef.current) return;

    const claimTimeout = setTimeout(() => {
      if (statusRef.current !== "blocked") {
        claimSession();
      }
    }, 400);

    return () => clearTimeout(claimTimeout);
  }, [enabled, responseToken, claimSession]); // No state.status

  // Start heartbeat — only restarts if interval value changes, not on status changes
  useEffect(() => {
    if (!enabled) return;

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [enabled, heartbeatInterval, sendHeartbeat]); // No state.status

  // ==========================================
  // LAYER 4: Supabase Realtime
  // Subscribes once — not re-triggered by status changes
  // ==========================================
  useEffect(() => {
    if (!enabled || !responseToken || !sessionIdRef.current) return;

    const channel = supabaseClient
      .channel(`session:${responseToken}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "response",
          filter: `token=eq.${responseToken}`,
        },
        (payload) => {
          const newData = payload.new as any;

          if (
            newData.active_session_id &&
            newData.active_session_id !== sessionIdRef.current
          ) {
            console.log("[SessionSecurity L4] Realtime: Session taken over");
            setStatus("blocked", "Session was taken over by another device");
            onSessionBlockedRef.current?.("Session was taken over by another device");
          }

          if (newData.is_ended === true) {
            console.log("[SessionSecurity L4] Realtime: Interview ended");
            setStatus("expired", "Interview has ended");
          }
        }
      )
      .subscribe((status) => {
        console.log("[SessionSecurity L4] Realtime subscription status:", status);
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabaseClient.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [enabled, responseToken, setStatus]); // No state.status — subscribes once

  // ==========================================
  // CLEANUP: Release session on unmount
  // ==========================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (responseToken && sessionIdRef.current) {
        navigator.sendBeacon(
          "/api/session/release",
          JSON.stringify({
            token: responseToken,
            session_id: sessionIdRef.current,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (responseToken && sessionIdRef.current) {
        fetch("/api/session/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: responseToken,
            session_id: sessionIdRef.current,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [responseToken]);

  return {
    sessionId: state.sessionId,
    status: state.status,
    blockedReason: state.blockedReason,
    isBlocked: state.status === "blocked",
    isActive: state.status === "active",
    isChecking: state.status === "checking",
    isExpired: state.status === "expired",
  };
}

/**
 * Generate a simple browser fingerprint for device identification
 */
async function getBrowserFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    // @ts-ignore
    navigator.deviceMemory || "unknown",
  ];

  const fingerprint = components.join("|");

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

export default useSessionSecurity;
