'use client';

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  CheckCircleIcon,
  AlertTriangle,
} from 'lucide-react';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { useResponses } from '@/contexts/responses.context';
import { RetellWebClient } from 'retell-client-js-sdk';
// import { useGetAllEmails } from "@/hooks/useGetAllEmails"; // replaced with encrypted API call
import { encryptedApiCall } from '@/lib/encrypted-api';
import { useCreateOrUpdateCandidate } from '@/hooks/useCreateOrUpdateCandidate';
// import { useRegisterCall } from "@/hooks/useRegisterCall";
import { useUpdateResponseByToken } from '@/hooks/useUpdateResponseByToken';
// import { useCreateResponse } from "@/hooks/useCreateResponse";
import { useSaveResponse } from '@/hooks/useSaveResponse';
import { useEncryptedCreateResponse } from '@/hooks/useEncryptedCreateResponse';
import { useEncryptedRegisterCall } from '@/hooks/useEncryptedRegisterCall';
import { useAnalyzeCall } from '@/hooks/useAnalyzeCall';
import { toast } from 'sonner';
import { Interview } from '@/types/interview';
import { FeedbackData } from '@/types/response';
import { FeedbackService } from '@/services/feedback.service';
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from './tabSwitchPrevention';
import { useSessionSecurity } from '@/hooks/useSessionSecurity';
import { SessionBlocked } from './SessionBlocked';
import { ResponseService } from '@/services/responses.service';
import { CandidateService } from '@/services/candidates.service';
import { setWebClientInstance } from '@/hooks/useAudioDetection';
import { useCandidateForm } from '@/hooks/useCandidateForm';
import { WelcomeSlide } from './WelcomeSlide';
import { CandidateForm } from './CandidateForm';
import { InterviewStage } from './InterviewStage';
import { EndScreen } from './EndScreen';
import { verifyTurnstile } from '@/actions/verify-turnstile';

const webClient = new RetellWebClient();
setWebClientInstance(webClient);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatPostedAgo(createdAt: Date | string | undefined): string {
  if (!createdAt) {
    return '';
  }

  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);

  if (mins < 60) {
    return mins <= 1 ? 'just now' : `${mins} minutes ago`;
  }

  const hours = Math.floor(mins / 60);

  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(days / 365);

  return years === 1 ? '1 year ago' : `${years} years ago`;
}

// First call duration (in milliseconds) - auto-ends after this time
const FIRST_CALL_DURATION =
  (Number(process.env.NEXT_PUBLIC_FIRST_CALL_DURATION) || 10) * 1000;

// Silence detection timing for second call (in milliseconds)
const SILENCE_WAIT_TIME =
  (Number(process.env.NEXT_PUBLIC_SILENCE_WAIT_TIME) || 40) * 1000;
const SILENCE_MESSAGE_TIME =
  (Number(process.env.NEXT_PUBLIC_SILENCE_MESSAGE_TIME) || 5) * 1000;

type CallPhase = 'first_call' | 'verification_modal' | 'second_call';

type InterviewProps = {
  interview: Interview;
  responseToken?: string;
  initialCallPhase?: CallPhase;
  isTwoFlow?: boolean;
  organizationName?: string;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

// localStorage helpers for call flow state
function getLocalFlowState(token?: string): Record<string, string> {
  if (!token) {
    return {};
  }
  try {
    const stored = localStorage.getItem(`call_flow_state_${token}`);

    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

function setLocalFlowState(
  token: string | undefined,
  updates: Record<string, string>
) {
  if (!token) {
    return;
  }
  try {
    const current = getLocalFlowState(token);
    localStorage.setItem(
      `call_flow_state_${token}`,
      JSON.stringify({ ...current, ...updates })
    );
  } catch (e) {
    // ignore localStorage errors
  }
}

function Call({
  interview,
  responseToken,
  initialCallPhase = 'first_call',
  isTwoFlow = false,
  organizationName = '',
}: InterviewProps) {
  const { createResponse } = useResponses();
  const createResponseMutation = useEncryptedCreateResponse();
  const [emailsData, setEmailsData] = useState<Array<{ email: string }>>([]);

  // Fetch previous candidate emails via encrypted API (replaces direct Supabase call)
  useEffect(() => {
    if (!interview?.id) {
      return;
    }
    encryptedApiCall<Array<{ email: string }>>('/api/get-emails', {
      interview_id: interview.id,
    })
      .then((data) => setEmailsData(data || []))
      .catch((err) => console.error('[Call] Failed to fetch emails:', err));
  }, [interview?.id]);
  const createOrUpdateCandidateMutation = useCreateOrUpdateCandidate();
  const registerCallMutation = useEncryptedRegisterCall();
  const updateResponseByTokenMutation = useUpdateResponseByToken();
  const saveResponseMutation = useSaveResponse();
  const analyzeCallMutation = useAnalyzeCall();
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>('');
  const [lastUserResponse, setLastUserResponse] = useState<string>('');
  const [activeTurn, setActiveTurn] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<'welcome' | 'candidateForm'>(
    'welcome'
  );
  const [guidelinesOpen, setGuidelinesOpen] = useState(true);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>('');
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const { tabSwitchCount } = useTabSwitchPrevention();

  // Session security: Multi-tab/device prevention (4 layers)
  const {
    sessionId,
    isBlocked: isSessionBlocked,
    blockedReason: sessionBlockedReason,
    isChecking: isSessionChecking,
  } = useSessionSecurity({
    responseToken: responseToken || '',
    enabled: !!responseToken && !isEnded,
    onSessionBlocked: (reason) => {},
  });

  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState('');
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>('30');
  const [time, setTime] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [totalModalTime, setTotalModalTime] = useState<number>(0);
  // Use a ref instead of state so handleTimerPausedChange has no state dependency
  const modalStartTimeRef = useRef<number | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] =
    useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isPreparingCall, setIsPreparingCall] = useState<boolean>(false);

  // Two-call system: tracks which phase we're in.
  // Single-call flow (isTwoFlow=false) starts directly in second_call phase
  // so the first-call timer and verification modal are never triggered.
  const effectiveInitialPhase: CallPhase = isTwoFlow
    ? initialCallPhase
    : 'second_call';
  const [callPhase, setCallPhase] = useState<CallPhase>(effectiveInitialPhase);
  const callPhaseRef = useRef<CallPhase>(effectiveInitialPhase);

  // Refs to track pause states for the timer interval
  const isTimerPausedRef = useRef<boolean>(false);
  const audioNotDetectedRef = useRef<boolean>(false);
  const hasSavedEndedRef = useRef<boolean>(false);

  // Refs for silence detection after agent stops talking (second call only)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const agentStoppedTalkingTimeRef = useRef<number | null>(null);
  const lastUserResponseLengthRef = useRef<number>(0);

  // Timer for auto-ending first call
  const firstCallTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Guard to prevent multiple auto-starts on resume
  const hasAutoStartedRef = useRef<boolean>(false);

  // Detect page unload (refresh/close) to prevent call_ended from writing completion state
  const isPageUnloadingRef = useRef<boolean>(false);

  // Signals that the verification modal should fire as soon as InterviewStage mounts.
  // Used when resuming from verification_modal phase — InterviewStage may not be mounted
  // yet when the resume useEffect fires (e.g. session check spinner is still showing).
  const pendingModalTriggerRef = useRef<boolean>(false);

  // Mirrors the `time` state so beforeunload can read the latest value synchronously.
  const timeRef = useRef<number>(0);

  // Refs to track values without causing re-registration of listeners
  const lastUserResponseRef2 = useRef<string>('');
  const audioNotDetectedStateRef = useRef<boolean>(false);

  // Ref to track responseToken for use in event handlers (avoids stale closure)
  const responseTokenRef = useRef<string | undefined>(responseToken);

  // Keep responseTokenRef updated when prop changes
  useEffect(() => {
    responseTokenRef.current = responseToken;
  }, [responseToken]);

  const candidateForm = useCandidateForm();

  // Audio detection state - managed by InterviewStage when mounted
  const [audioNotDetected, setAudioNotDetected] = useState(false);

  // Refs to store audio detection functions from InterviewStage
  const performAudioChecksRef = useRef<(() => Promise<void>) | null>(null);
  const stopAudioLevelDetectionRef = useRef<(() => void) | null>(null);
  const triggerSilenceDetectionRef = useRef<
    ((skipMessage?: boolean) => void) | null
  >(null);

  const lastUserResponseRef = useRef<HTMLDivElement>(null!);
  const hasRequestedPermission = useRef<boolean>(false);

  // Callbacks for InterviewStage to set the refs
  const handlePerformAudioChecks = useCallback((fn: () => Promise<void>) => {
    performAudioChecksRef.current = fn;
  }, []);

  const handleStopAudioLevelDetection = useCallback((fn: () => void) => {
    stopAudioLevelDetectionRef.current = fn;
  }, []);

  const handleTriggerSilenceDetection = useCallback(
    (fn: (skipMessage?: boolean) => void) => {
      triggerSilenceDetectionRef.current = fn;
      if (pendingModalTriggerRef.current) {
        pendingModalTriggerRef.current = false;
        fn(true);
      }
    },
    []
  );

  const handleAudioNotDetectedChange = useCallback((detected: boolean) => {
    setAudioNotDetected(detected);
    audioNotDetectedRef.current = detected;
    audioNotDetectedStateRef.current = detected;
  }, []);

  const handleTimerPausedChange = useCallback(
    (paused: boolean) => {
      setIsTimerPaused(paused);
      isTimerPausedRef.current = paused;

      // Track modal time via ref — no state dep so this callback stays stable
      if (paused && !modalStartTimeRef.current) {
        modalStartTimeRef.current = Date.now();
      } else if (!paused && modalStartTimeRef.current) {
        const modalDuration = (Date.now() - modalStartTimeRef.current) / 1000;
        setTotalModalTime((prev) => prev + modalDuration);
        modalStartTimeRef.current = null;
      }

      // Also reset audioNotDetected when resuming
      if (!paused) {
        setAudioNotDetected(false);
        audioNotDetectedRef.current = false;

        // If resuming from verification modal, start the second call
        if (callPhaseRef.current === 'verification_modal') {
          setCallPhase('second_call');
          callPhaseRef.current = 'second_call';
          startSecondCall();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Clear silence timer when user actually responds (transcript changes)
  // Also keep ref in sync for use in event listeners
  useEffect(() => {
    const currentResponseLength = lastUserResponse?.length || 0;
    lastUserResponseRef2.current = lastUserResponse || '';

    if (
      currentResponseLength > lastUserResponseLengthRef.current &&
      silenceTimerRef.current
    ) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
      agentStoppedTalkingTimeRef.current = null;
    }

    lastUserResponseLengthRef.current = currentResponseLength;
  }, [lastUserResponse]);

  const handleFeedbackSubmit = async (
    formData: Omit<FeedbackData, 'interview_id'>
  ) => {
    try {
      await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      toast.success('Thank you for your feedback!');
      setIsFeedbackSubmitted(true);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  // Timer interval - increment only when not paused
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isCalling && !isEnded) {
      intervalId = setInterval(() => {
        // Only increment when timer is NOT paused
        if (!isTimerPausedRef.current && !audioNotDetectedRef.current) {
          setTime((prevTime) => prevTime + 10); // Increment by 10 (100ms worth)
        }
      }, 100); // Run every 100ms
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCalling, isEnded]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // Memoized derived timer values — avoids recalculation on unrelated rerenders
  const timeUsedSeconds = useMemo(() => Math.floor(time / 100), [time]);
  const totalTimeSeconds = useMemo(
    () => Number(interviewTimeDuration) * 60,
    [interviewTimeDuration]
  );
  const timeLeftSeconds = useMemo(
    () => Math.max(0, totalTimeSeconds - timeUsedSeconds),
    [totalTimeSeconds, timeUsedSeconds]
  );

  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  // Check timer end condition — display values are now derived via useMemo, no state update needed here
  useEffect(() => {
    const currentDuration = Math.floor(time / 100);

    const rawTimeLimit = Number(interviewTimeDuration) * 60;
    const timeLimit = rawTimeLimit > 0 ? rawTimeLimit : 1800;

    // Check if time is up
    if (currentDuration >= timeLimit && !isTimeUp) {
      setIsTimeUp(true);
    }

    // FORCE END CALL when time limit is reached
    // BUT don't end if modal is open (timer is paused) - give user time to respond
    if (currentDuration >= timeLimit && !isEnded && isCalling) {
      // Safety check: don't end while timer is paused (modal is open)
      if (isTimerPausedRef.current) {
        return;
      }

      console.error('[Timer] *** FORCE ENDING CALL NOW ***', {
        currentDuration,
        timeLimit,
        interviewTimeDuration,
        actualMinutesElapsed: currentDuration / 60,
        expectedMinutes: Number(interviewTimeDuration),
        reason: 'Timer enforcement - exact timing',
        timestamp: new Date().toISOString(),
        isTimerPaused,
      });
      webClient.stopCall();
      setIsEnded(true);
      setIsTimeUp(true);
    }
  }, [
    time,
    interviewTimeDuration,
    isEnded,
    isCalling,
    isTimeUp,
    isTimerPaused,
    audioNotDetected,
  ]);

  // Handle resuming from a saved call phase (page refresh)
  useEffect(() => {
    if (initialCallPhase === 'verification_modal') {
      // User refreshed during verification modal — show modal immediately
      setIsStarted(true);
      setIsTimerPaused(true);
      isTimerPausedRef.current = true;
      // Restore timer to reflect the first call duration that already elapsed.
      // time unit = 10 per 100ms, so ms → units = ms / 10.
      setTime(FIRST_CALL_DURATION / 10);
      // InterviewStage may not be mounted yet (session check spinner could still be
      // showing). Set the pending flag so handleTriggerSilenceDetection fires the
      // modal the instant InterviewStage registers its function.
      if (triggerSilenceDetectionRef.current) {
        // Already mounted (fast path — no session check delay)
        triggerSilenceDetectionRef.current(true);
      } else {
        // Slow path — InterviewStage not mounted yet; will fire via pendingModalTriggerRef
        pendingModalTriggerRef.current = true;
      }
    } else if (initialCallPhase === 'second_call') {
      // User refreshed during second call — skip first call and modal, start second call
      setIsStarted(true);
      setCallPhase('second_call');
      callPhaseRef.current = 'second_call';
      // Restore the elapsed timer that was saved on beforeunload
      if (responseToken) {
        try {
          const saved = localStorage.getItem(`elapsed_timer_${responseToken}`);
          if (saved) {
            const savedTime = Number(saved);
            setTime(savedTime);
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-start second call when resuming from second_call phase (page refresh)
  // Uses hasAutoStartedRef to ensure it only fires ONCE
  useEffect(() => {
    if (
      initialCallPhase === 'second_call' &&
      isStarted &&
      !isCalling &&
      !isEnded &&
      !isPreparingCall &&
      !hasAutoStartedRef.current
    ) {
      hasAutoStartedRef.current = true;
      startSecondCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCallPhase, isStarted, isCalling, isEnded, isPreparingCall]);

  // Detect page unload/refresh to prevent call_ended from writing completion state.
  // Also saves the current timer value so second call can restore it on resume.
  useEffect(() => {
    const handleBeforeUnload = () => {
      isPageUnloadingRef.current = true;
      // Persist elapsed timer so it can be restored if second call is resumed after refresh
      if (callPhaseRef.current === 'second_call' && responseTokenRef.current) {
        try {
          localStorage.setItem(
            `elapsed_timer_${responseTokenRef.current}`,
            String(timeRef.current)
          );
        } catch (e) {
          /* ignore */
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    webClient.on('call_started', () => {
      const startTime = Date.now();
      const phase = callPhaseRef.current;
      setIsCalling(true);
      setCallStartTime(startTime);

      if (phase === 'first_call') {
        // First call: auto-end after FIRST_CALL_DURATION, no audio detection
        firstCallTimerRef.current = setTimeout(() => {
          webClient.stopCall();
        }, FIRST_CALL_DURATION);

        // Still request mic permission for second call, but don't start audio detection
        const requestMicPermission = async () => {
          if (hasRequestedPermission.current) {
            return;
          }
          hasRequestedPermission.current = true;

          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            stream.getTracks().forEach((track) => track.stop());
            setMicPermissionDenied(false);
          } catch (error) {
            console.error('[First Call] Microphone permission denied:', error);
            setMicPermissionDenied(true);
          }
        };

        requestMicPermission();
      } else if (phase === 'second_call') {
      }
    });

    webClient.on('call_ended', () => {
      const phase = callPhaseRef.current;
      const token = responseTokenRef.current; // Use ref to get current value
      setIsCalling(false);

      if (phase === 'first_call') {
        if (firstCallTimerRef.current) {
          clearTimeout(firstCallTimerRef.current);
          firstCallTimerRef.current = null;
        }

        setCallPhase('verification_modal');
        callPhaseRef.current = 'verification_modal';

        // Pause timer and trigger the audio detection modal
        setIsTimerPaused(true);
        isTimerPausedRef.current = true;
        if (triggerSilenceDetectionRef.current) {
          triggerSilenceDetectionRef.current(true);
        }

        // Update localStorage immediately + async DB update
        const firstCallTs = new Date().toISOString();
        if (token) {
          // Write to localStorage immediately
          setLocalFlowState(token, { first_call_started: firstCallTs });
          const localState = getLocalFlowState(token);

          // Also update DB for persistence
          ResponseService.updateResponseByToken(
            { call_flow_state: localState },
            token
          )
            .then(() => {})
            .catch((err) => {
              console.error('[First Call] DB update FAILED:', err);
            });
        } else {
          console.error('[First Call] ERROR: No token available!');
        }
      } else {
        // Second call ended

        // If page is unloading (refresh/close), skip completion logic
        if (isPageUnloadingRef.current) {
          return;
        }

        setIsEnded(true);
        if (stopAudioLevelDetectionRef.current) {
          stopAudioLevelDetectionRef.current();
        }

        // Update localStorage immediately + async DB update
        const completedTs = new Date().toISOString();
        if (token) {
          setLocalFlowState(token, { second_call_completed: completedTs });
          const localState = getLocalFlowState(token);

          ResponseService.updateResponseByToken(
            { call_flow_state: localState },
            token
          )
            .then(() => {})
            .catch((err) => {
              console.error('[Second Call] DB update FAILED:', err);
            });
        }
      }
    });

    webClient.on('agent_start_talking', () => {
      setActiveTurn('agent');

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
      agentStoppedTalkingTimeRef.current = null;
    });

    webClient.on('agent_stop_talking', () => {
      setActiveTurn('user');

      // No silence detection during first call — it auto-ends via timer
      if (callPhaseRef.current === 'first_call') {
        return;
      }

      // Second call: 40-second silence detection (no modal — just show message)

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }

      agentStoppedTalkingTimeRef.current = Date.now();
      const capturedLength = lastUserResponseRef2.current?.length || 0;
      lastUserResponseLengthRef.current = capturedLength;

      silenceTimerRef.current = setTimeout(() => {
        const currentLength = lastUserResponseRef2.current?.length || 0;
        const userResponded = currentLength > capturedLength;

        if (userResponded) {
          return;
        }

        // End the meeting after 40 seconds of silence
        webClient.stopCall();
      }, SILENCE_WAIT_TIME);
    });

    webClient.on('error', (error) => {
      console.error('An error occurred:', error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on('update', (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        // Don't update interviewer response when modal is open (timer paused)
        // This prevents the AI from repeating messages or asking new questions
        if (!isTimerPausedRef.current) {
          setLastInterviewerResponse(roleContents['agent']);
        }
        setLastUserResponse(roleContents['user']);
      }
    });

    return () => {
      webClient.removeAllListeners();
      if (stopAudioLevelDetectionRef.current) {
        stopAudioLevelDetectionRef.current();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
      if (firstCallTimerRef.current) {
        clearTimeout(firstCallTimerRef.current);
        firstCallTimerRef.current = null;
      }
    };
    // IMPORTANT: Empty dependency array - only register listeners ONCE on mount
    // State values are accessed via refs to avoid stale closures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      webClient.stopCall();
      setIsEnded(true);
      setLoading(false);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    setLoading(true);

    // Verify Turnstile token first
    if (candidateForm.turnstileToken) {
      const turnstileResult = await verifyTurnstile(
        candidateForm.turnstileToken
      );
      if (!turnstileResult.success) {
        toast.error(
          turnstileResult.error || 'Verification failed. Please try again.'
        );
        setLoading(false);
        // Reset the turnstile token so user needs to complete again
        candidateForm.setTurnstileToken('');

        return;
      }
    } else {
      toast.error('Please complete the verification challenge.');
      setLoading(false);

      return;
    }

    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions?.map((q) => q?.question).join(', ') || '',
      name: candidateForm.fullName || 'not provided',
    };

    // Check if user is old using cached emails data
    const oldUserEmails: string[] = (emailsData || []).map(
      (item) => item.email
    );
    const hasAllowlist =
      Array.isArray(interview?.respondents) && interview.respondents.length > 0;
    const OldUser =
      oldUserEmails.includes(candidateForm.email) ||
      (hasAllowlist && !interview!.respondents.includes(candidateForm.email));

    if (OldUser) {
      setIsOldUser(true);
      setLoading(false);

      return;
    }

    try {
      const socialMediaLinksObj: Record<string, string> = {};
      if (candidateForm.twitter && candidateForm.twitter.trim()) {
        socialMediaLinksObj.twitter = candidateForm.twitter.trim();
      }
      if (candidateForm.linkedin && candidateForm.linkedin.trim()) {
        socialMediaLinksObj.linkedin = candidateForm.linkedin.trim();
      }
      const parsedSocialMediaLinks =
        Object.keys(socialMediaLinksObj).length > 0
          ? socialMediaLinksObj
          : null;

      const workExperienceObj: Record<string, any> = {};
      if (
        candidateForm.workExperienceYears &&
        candidateForm.workExperienceYears.trim()
      ) {
        workExperienceObj.years = candidateForm.workExperienceYears.trim();
      }
      const parsedWorkExperience =
        Object.keys(workExperienceObj).length > 0 ? workExperienceObj : null;

      const candidateData = {
        email: candidateForm.email || null,
        name: candidateForm.fullName || null,
        full_name: candidateForm.fullName || null,
        phone: candidateForm.phone || null,
        gender: candidateForm.gender || null,
        country: candidateForm.country || null,
        social_media_links: parsedSocialMediaLinks,
        work_experience: parsedWorkExperience,
      };

      // Create or update candidate using TanStack Query
      const newCandidateId = await createOrUpdateCandidateMutation.mutateAsync({
        candidateData,
        email: candidateForm.email,
      });
      setCandidateId(newCandidateId);

      // Register call using TanStack Query
      const registerCallResponse = await registerCallMutation.mutateAsync({
        dynamic_data: data,
        interviewer_id: interview?.interviewer_id
          ? Number(interview.interviewer_id)
          : 0,
        token: responseToken,
        session_id: sessionId,
      });

      const callResponse = registerCallResponse?.registerCallResponse;

      if (!callResponse?.call_id) {
        console.error('[Call] No call_id received from Retell');
        toast.error('Failed to register call. Please try again.');
        setLoading(false);

        return;
      }

      const retellCallId = callResponse.call_id;
      setCallId(retellCallId);

      // IMPORTANT: Save call_id to response IMMEDIATELY after registration
      // This ensures the link is marked as "used" even if the call fails to start
      if (responseToken) {
        // Update response by token using TanStack Query
        try {
          await updateResponseByTokenMutation.mutateAsync({
            payload: {
              call_id: retellCallId,
              email: candidateForm.email,
              name: candidateForm.fullName,
              candidate_id: newCandidateId,
              turnstile_verified: true,
            },
            token: responseToken,
          });
        } catch (error) {
          console.error('[Call] Failed to update response by token:', error);
          // Fallback: create new response if update fails
          await createResponseMutation.mutateAsync({
            interview_id: interview.id,
            call_id: retellCallId,
            email: candidateForm.email,
            name: candidateForm.fullName,
            candidate_id: newCandidateId ?? undefined,
            turnstile_token: candidateForm.turnstileToken,
          });
        }
      } else {
        // Create response using TanStack Query
        await createResponseMutation.mutateAsync({
          interview_id: interview.id,
          call_id: retellCallId,
          email: candidateForm.email,
          name: candidateForm.fullName,
          candidate_id: newCandidateId ?? undefined,
          turnstile_token: candidateForm.turnstileToken,
        });
      }

      // Store candidate name for resume scenarios
      if (responseToken && candidateForm.fullName) {
        try {
          localStorage.setItem(
            `candidate_name_${responseToken}`,
            candidateForm.fullName
          );
        } catch (e) {
          // ignore
        }
      }

      // Now start the call (after call_id is saved)
      if (callResponse?.access_token) {
        await webClient
          .startCall({
            accessToken: callResponse.access_token,
          })
          .catch((err) => {
            console.error('Error starting call:', err);
            // Call_id is already saved, so link is marked as used even if call fails
            toast.error(
              'Failed to start call. The interview link has been marked as used.'
            );
            setLoading(false);
            throw err;
          });
        setIsCalling(true);
        setIsStarted(true);

        // Single-call flow: mark as started so page refresh can resume in second_call phase
        if (!isTwoFlow && responseToken) {
          const startedTs = new Date().toISOString();
          setLocalFlowState(responseToken, { second_call_started: startedTs });
          const localState = getLocalFlowState(responseToken);
          ResponseService.updateResponseByToken(
            { call_flow_state: localState },
            responseToken
          ).catch((err) =>
            console.error('[Single Call] DB update FAILED:', err)
          );
        }
      } else {
        console.error('[Call] No access token received from Retell');
        toast.error(
          'Failed to get call access token. The interview link has been marked as used.'
        );
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start interview. Please try again.');
    }

    setLoading(false);
  };

  const startSecondCall = async () => {
    setIsPreparingCall(true);

    try {
      // Retrieve stored name for resume scenarios
      let candidateName = candidateForm.fullName;
      if (!candidateName && responseToken) {
        try {
          candidateName =
            localStorage.getItem(`candidate_name_${responseToken}`) || '';
        } catch (e) {
          // ignore
        }
      }

      const data = {
        mins: interview?.time_duration,
        objective: interview?.objective,
        questions:
          interview?.questions?.map((q) => q?.question).join(', ') || '',
        name: candidateName || 'not provided',
      };

      // Register a new call with Retell
      const registerCallResponse = await registerCallMutation.mutateAsync({
        dynamic_data: data,
        interviewer_id: interview?.interviewer_id
          ? Number(interview.interviewer_id)
          : 0,
        token: responseToken,
        session_id: sessionId,
      });

      const callResponse = registerCallResponse?.registerCallResponse;

      if (!callResponse?.call_id || !callResponse?.access_token) {
        console.error('[Second Call] Failed to register call');
        toast.error('Failed to start second call. Please try again.');
        setIsPreparingCall(false);

        return;
      }

      const newCallId = callResponse.call_id;
      setCallId(newCallId);

      // Update localStorage immediately + await DB update
      const modalClosedTs = new Date().toISOString();
      if (responseToken) {
        setLocalFlowState(responseToken, { modal_closed: modalClosedTs });
        const localState = getLocalFlowState(responseToken);

        // Await DB update for call_id
        await updateResponseByTokenMutation.mutateAsync({
          payload: {
            call_id: newCallId,
            call_flow_state: localState,
          },
          token: responseToken,
        });
      }

      // Reset saved-end ref for the new call
      hasSavedEndedRef.current = false;
      hasFetchedDetailsRef.current = false;

      // Start the second call
      await webClient
        .startCall({ accessToken: callResponse.access_token })
        .catch((err) => {
          console.error('[Second Call] Error starting call:', err);
          toast.error('Failed to start call.');
          setIsPreparingCall(false);
          throw err;
        });

      // Mark second call as started - prevents refresh from resuming
      // If user refreshes after this point, they'll be redirected to expired page
      const secondCallStartedTs = new Date().toISOString();
      if (responseToken) {
        setLocalFlowState(responseToken, {
          second_call_started: secondCallStartedTs,
        });
        const localState = getLocalFlowState(responseToken);

        // Update DB with second_call_started flag
        ResponseService.updateResponseByToken(
          { call_flow_state: localState },
          responseToken
        )
          .then(() => {})
          .catch((err) => {
            console.error(
              '[Second Call] DB update FAILED (second_call_started):',
              err
            );
          });
      }

      setIsPreparingCall(false);
      setIsCalling(true);
    } catch (error) {
      console.error('[Second Call] Error:', error);
      toast.error('Failed to start second call.');
      setIsPreparingCall(false);
    }
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    if (!interview.interviewer_id) {
      return;
    }
    const fetchInterviewer = async () => {
      const interviewer = await encryptedApiCall('/api/get-interviewer', {
        id: interview.interviewer_id,
      }).catch(() => null);
      setInterviewerImg(interviewer?.image || '/interviewers/default.png');
    };
    fetchInterviewer();
  }, [interview.interviewer_id]);

  // Track if we've already fetched details to prevent duplicate fetches
  const hasFetchedDetailsRef = useRef(false);

  useEffect(() => {
    if (isEnded && callId && !hasSavedEndedRef.current) {
      // Mark as saved to prevent duplicate calls
      hasSavedEndedRef.current = true;

      // Use TanStack Query mutation to save response and invalidate cache
      saveResponseMutation.mutate({
        payload: { is_ended: true, tab_switch_count: tabSwitchCount },
        callId,
      });

      // Also fetch and save call details as a fallback (in case webhook doesn't fire)
      // Wait a bit for Retell to process the call before fetching
      if (!hasFetchedDetailsRef.current) {
        hasFetchedDetailsRef.current = true;

        // Retry logic: try multiple times with increasing delays
        const retryFetchDetails = (
          attempt: number = 1,
          maxAttempts: number = 3
        ) => {
          const delay = attempt * 3000; // 3s, 6s, 9s

          setTimeout(() => {
            analyzeCallMutation.mutate(
              { id: callId },
              {
                onSuccess: () => {},
                onError: (error) => {
                  console.error(
                    `[Call] Failed to fetch call details on attempt ${attempt}:`,
                    error
                  );
                  if (attempt < maxAttempts) {
                    retryFetchDetails(attempt + 1, maxAttempts);
                  } else {
                    console.error('[Call] Max retry attempts reached.');
                    hasFetchedDetailsRef.current = false;
                  }
                },
              }
            );
          }, delay);
        };

        retryFetchDetails();
      }
    }

    // Reset the refs if callId changes (new call started)
    if (!isEnded && callId) {
      hasSavedEndedRef.current = false;
      hasFetchedDetailsRef.current = false;
    }
  }, [
    isEnded,
    callId,
    tabSwitchCount,
    saveResponseMutation,
    analyzeCallMutation,
  ]);

  // Show session blocked screen if multi-tab/device detected
  if (isSessionBlocked) {
    return (
      <SessionBlocked
        reason={sessionBlockedReason}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show loading while checking session
  if (isSessionChecking && responseToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600" />
          <p className="mt-4 text-gray-600 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen h-fit">
      {isStarted && <TabSwitchWarning />}
      <div className={`bg-floralwhite rounded-md mx-auto ${isStarted ? 'w-[70%]' : 'w-[50%]'}`}>
        <Card className="h-fit min-h-[88vh] rounded-lg text-xl font-bold transition-all md:block dark:border-white border-0 shadow-none">
          <div>
            {isStarted && (
              <div className="m-4">
                {/* Timer Info Display */}
                <div className="flex flex-row items-center justify-between mb-2 px-2">
                  <div className="flex flex-col">
                    <div className="text-xs font-semibold text-indigo-500">
                      Time Used
                    </div>
                    <div
                      className={`text-sm font-bold ${isTimerPaused ? 'text-amber-500' : 'text-gray-700'}`}
                    >
                      {formatTime(timeUsedSeconds)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    {isTimeUp && isEnded && (
                      <div className="text-xs font-semibold text-red-600 mb-1">
                        ⏰ TIME UP
                      </div>
                    )}
                    {isTimerPaused && !isTimeUp && (
                      <div className="text-xs font-semibold text-amber-600 mb-1 animate-pulse">
                        ⏸ PAUSED
                      </div>
                    )}
                    {!isTimerPaused && !isEnded && (
                      <div className="text-xs text-gray-500">Running</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs font-semibold text-indigo-500">
                      Time Left
                    </div>
                    <div
                      className={`text-sm font-bold ${isTimeUp ? 'text-red-500' : timeLeftSeconds < 60 ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isTimeUp ? '00:00' : formatTime(timeLeftSeconds)}
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-[10px] rounded-md border-[1px] border-gray-300 relative overflow-hidden">
                  <div
                    className={`h-[10px] rounded-md transition-all ${
                      isTimeUp
                        ? 'bg-red-500'
                        : isTimerPaused
                          ? 'bg-amber-500'
                          : isEnded
                            ? 'bg-secondary'
                            : 'bg-secondary'
                    }`}
                    style={{
                      width: isEnded
                        ? '100%'
                        : `${totalTimeSeconds > 0 ? (timeUsedSeconds / totalTimeSeconds) * 100 : 0}%`,
                    }}
                  />
                  {isTimeUp && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-[8px] font-bold text-white drop-shadow-md">
                        TIME UP
                      </div>
                    </div>
                  )}
                  {isTimerPaused && !isTimeUp && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        width: `${totalTimeSeconds > 0 ? (timeUsedSeconds / totalTimeSeconds) * 100 : 0}%`,
                      }}
                    >
                      <div className="text-[8px] font-bold text-white drop-shadow-md">
                        PAUSED
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <CardHeader className="px-1 py-4 item-center">
              {!isEnded && (
                <div className="flex flex-col mb-2 animate-in fade-in slide-in-from-top-3 duration-500 items-center ">
                  <CardTitle className="text-lg md:text-xl font-bold mb-1">
                    {interview?.name}
                  </CardTitle>
                  {(interview?.logo_url || organizationName) && (
                    <div className="flex items-center gap-2 mt-2">
                      {interview?.logo_url && (
                        <Image
                          src={interview.logo_url}
                          alt="Company logo"
                          className="h-5 w-auto object-contain"
                          width={40}
                          height={10}
                        />
                      )}
                      {organizationName && (
                        <span className="text-xs text-gray-500">
                          {organizationName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!isEnded && (
                <div className="flex flex-row items-center mt-1 animate-in fade-in slide-in-from-top-3 duration-500 delay-100 justify-center">
                  <div className="flex items-center text-gray-500">
                    <AlarmClockIcon className="text-primary h-[.9rem] w-[.9rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 mr-1 font-bold" />
                    <div className="text-xs font-normal space-x-1">
                      Expected duration:
                      <span className="font-bold text-primary mr-1">
                        {interviewTimeDuration} mins
                      </span>
                      or less
                    </div>
                  </div>
                  {isStarted && (
                    <div className="ml-4 text-xs text-gray-500">
                      ({formatTime(timeUsedSeconds)} /
                      {formatTime(totalTimeSeconds)})
                    </div>
                  )}
                </div>
              )}
            </CardHeader>

            {/* Microphone permission warning banner - only show before interview starts */}
            {!isStarted && !isEnded && !isOldUser && micPermissionDenied && (
              <div className="w-[80%] mx-auto mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800 font-normal">
                    Microphone access denied. Please enable it in your browser
                    settings.
                  </p>
                </div>
                <button
                  className="px-3 py-1.5 text-sm font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex-shrink-0"
                  onClick={async () => {
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                      });
                      stream.getTracks().forEach((track) => track.stop());
                      setMicPermissionDenied(false);
                    } catch (error) {
                      console.error('Permission still denied:', error);
                      toast.error(
                        'Microphone access denied. Please check your browser settings.'
                      );
                    }
                  }}
                >
                  Allow Mic
                </button>
              </div>
            )}

            {!isStarted &&
              !isEnded &&
              !isOldUser &&
              currentSlide === 'welcome' && (
                <WelcomeSlide
                  interview={interview}
                  loading={loading}
                  guidelinesOpen={guidelinesOpen}
                  onGuidelinesOpenChange={setGuidelinesOpen}
                  onProceed={() => setCurrentSlide('candidateForm')}
                  onExit={onEndCallClick}
                />
              )}

            {!isStarted &&
              !isEnded &&
              !isOldUser &&
              currentSlide === 'candidateForm' && (
                <CandidateForm
                  interview={interview}
                  loading={loading}
                  email={candidateForm.email}
                  setEmail={candidateForm.setEmail}
                  fullName={candidateForm.fullName}
                  setFullName={candidateForm.setFullName}
                  phone={candidateForm.phone}
                  setPhone={candidateForm.setPhone}
                  gender={candidateForm.gender}
                  setGender={candidateForm.setGender}
                  country={candidateForm.country}
                  setCountry={candidateForm.setCountry}
                  twitter={candidateForm.twitter}
                  setTwitter={candidateForm.setTwitter}
                  linkedin={candidateForm.linkedin}
                  setLinkedin={candidateForm.setLinkedin}
                  workExperienceYears={candidateForm.workExperienceYears}
                  setWorkExperienceYears={candidateForm.setWorkExperienceYears}
                  isValidEmail={candidateForm.isValidEmail}
                  isValidPhone={candidateForm.isValidPhone}
                  isValidTwitter={candidateForm.isValidTwitter}
                  isValidLinkedin={candidateForm.isValidLinkedin}
                  turnstileToken={candidateForm.turnstileToken}
                  setTurnstileToken={candidateForm.setTurnstileToken}
                  onGoBack={() => setCurrentSlide('welcome')}
                  onStartInterview={startConversation}
                  onExit={onEndCallClick}
                />
              )}

            {/* Interview stage - audio detection only runs when this is mounted */}
            {isStarted && !isEnded && !isOldUser && (
              <InterviewStage
                lastInterviewerResponse={lastInterviewerResponse}
                lastUserResponse={lastUserResponse}
                activeTurn={activeTurn}
                interviewerImg={interviewerImg}
                lastUserResponseRef={lastUserResponseRef}
                isEnded={isEnded}
                interviewTitle={interview?.name}
                organizationName={organizationName}
                setLastInterviewerResponse={setLastInterviewerResponse}
                onAudioNotDetectedChange={handleAudioNotDetectedChange}
                onTimerPausedChange={handleTimerPausedChange}
                onPerformAudioChecks={handlePerformAudioChecks}
                onStopAudioLevelDetection={handleStopAudioLevelDetection}
                onTriggerSilenceDetection={handleTriggerSilenceDetection}
              />
            )}

            {isEnded && !isOldUser && (
              <EndScreen
                isStarted={isStarted}
                isFeedbackSubmitted={isFeedbackSubmitted}
                email={candidateForm.email}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            )}

            {isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
                    <p className="text-lg font-semibold text-center">
                      You have already responded in this interview or you are
                      not eligible to respond. Thank you!
                    </p>
                    <p className="text-center">
                      {'\n'}
                      You can close this tab now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

export default Call;
