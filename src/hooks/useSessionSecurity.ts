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
  heartbeatInterval = 10000, // 10 seconds
  onSessionBlocked,
}: UseSessionSecurityOptions) {
  const [state, setState] = useState<SessionSecurityState>({
    sessionId: "",
    status: "checking",
  });

  const sessionIdRef = useRef<string>("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isClaimingRef = useRef<boolean>(false);

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
          // Another tab is claiming this session
          console.log("[SessionSecurity L1] Another tab claimed session:", incomingSessionId);

          // Respond that we already have it
          channel.postMessage({
            type: "SESSION_CONFLICT",
            sessionId: sessionIdRef.current,
            timestamp: Date.now(),
          });
        }

        if (type === "SESSION_CONFLICT" && incomingSessionId !== sessionIdRef.current) {
          // Conflict detected - this tab loses if it's newer
          const ourTimestamp = parseInt(
            localStorage.getItem(`session_ts_${responseToken}`) || "0"
          );

          if (timestamp < ourTimestamp) {
            // Other tab was first - we're blocked
            console.log("[SessionSecurity L1] Session conflict - this tab is blocked");
            setState((prev) => ({
              ...prev,
              status: "blocked",
              blockedReason: "Interview is open in another tab",
            }));
            onSessionBlocked?.("Interview is open in another tab");
          }
        }

        if (type === "SESSION_PING") {
          // Respond to ping to confirm we're active
          channel.postMessage({
            type: "SESSION_PONG",
            sessionId: sessionIdRef.current,
            timestamp: Date.now(),
          });
        }

        if (type === "SESSION_PONG" && incomingSessionId !== sessionIdRef.current) {
          // Another tab is active - block this one
          console.log("[SessionSecurity L1] Another active tab detected via pong");
          setState((prev) => ({
            ...prev,
            status: "blocked",
            blockedReason: "Interview is already open in another tab",
          }));
          onSessionBlocked?.("Interview is already open in another tab");
        }
      };

      // Check for existing sessions by pinging
      channel.postMessage({
        type: "SESSION_PING",
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
      });

      // After a short delay, if no conflict, claim the session
      const claimTimeout = setTimeout(() => {
        if (state.status !== "blocked") {
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
      // BroadcastChannel not supported
      console.warn("[SessionSecurity L1] BroadcastChannel not supported:", error);
    }
  }, [enabled, responseToken, onSessionBlocked, state.status]);

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
          // Session already claimed by another client
          setState((prev) => ({
            ...prev,
            status: "blocked",
            blockedReason: data.message || "Session active on another device/browser",
          }));
          onSessionBlocked?.(data.message || "Session active on another device/browser");
          return false;
        }
        if (response.status === 410) {
          // Interview ended
          setState((prev) => ({
            ...prev,
            status: "expired",
            blockedReason: data.message || "Interview has ended",
          }));
          onSessionBlocked?.(data.message || "Interview has ended");
          return false;
        }
        throw new Error(data.error || "Failed to claim session");
      }

      setState((prev) => ({ ...prev, status: "active" }));
      console.log("[SessionSecurity L2] Session claimed via API");
      return true;
    } catch (error) {
      console.error("[SessionSecurity L2] Failed to claim session:", error);
      // Don't block on network errors - allow offline usage
      setState((prev) => ({ ...prev, status: "active" }));
      return true;
    } finally {
      isClaimingRef.current = false;
    }
  }, [enabled, responseToken, onSessionBlocked]);

  const sendHeartbeat = useCallback(async () => {
    if (!enabled || !responseToken || !sessionIdRef.current || state.status !== "active") {
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
          // Session was taken over or expired
          setState((prev) => ({
            ...prev,
            status: "blocked",
            blockedReason: data.message || "Session invalidated",
          }));
          onSessionBlocked?.(data.message || "Session invalidated");
        }
      }
    } catch (error) {
      // Network error - don't block, just log
      console.warn("[SessionSecurity L2] Heartbeat failed (network):", error);
    }
  }, [enabled, responseToken, state.status, onSessionBlocked]);

  // Claim session on mount
  useEffect(() => {
    if (!enabled || !responseToken || !sessionIdRef.current) return;

    // Small delay to let Layer 1 check first
    const claimTimeout = setTimeout(() => {
      if (state.status !== "blocked") {
        claimSession();
      }
    }, 400);

    return () => clearTimeout(claimTimeout);
  }, [enabled, responseToken, claimSession, state.status]);

  // Start heartbeat interval
  useEffect(() => {
    if (!enabled || state.status !== "active") return;

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [enabled, state.status, heartbeatInterval, sendHeartbeat]);

  // ==========================================
  // LAYER 4: Supabase Realtime
  // ==========================================
  useEffect(() => {
    if (!enabled || !responseToken || !sessionIdRef.current || state.status === "blocked") {
      return;
    }

    // Subscribe to changes on the response row
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

          // Check if session was taken over
          if (
            newData.active_session_id &&
            newData.active_session_id !== sessionIdRef.current
          ) {
            console.log("[SessionSecurity L4] Realtime: Session taken over by:", newData.active_session_id);
            setState((prev) => ({
              ...prev,
              status: "blocked",
              blockedReason: "Session was taken over by another device",
            }));
            onSessionBlocked?.("Session was taken over by another device");
          }

          // Check if interview ended
          if (newData.is_ended === true) {
            console.log("[SessionSecurity L4] Realtime: Interview ended");
            setState((prev) => ({
              ...prev,
              status: "expired",
              blockedReason: "Interview has ended",
            }));
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
  }, [enabled, responseToken, state.status, onSessionBlocked]);

  // ==========================================
  // CLEANUP: Release session on unmount
  // ==========================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Release session when page is closing
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

      // Also release on component unmount
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
    // @ts-ignore - deviceMemory is not in all browsers
    navigator.deviceMemory || "unknown",
  ];

  const fingerprint = components.join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

export default useSessionSecurity;
