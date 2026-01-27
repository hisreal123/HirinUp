"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  CheckCircleIcon,
  AlertTriangle,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { useResponses } from "@/contexts/responses.context";
import { RetellWebClient } from "retell-client-js-sdk";
import { useGetAllEmails } from "@/hooks/useGetAllEmails";
import { useCreateOrUpdateCandidate } from "@/hooks/useCreateOrUpdateCandidate";
import { useRegisterCall } from "@/hooks/useRegisterCall";
import { useUpdateResponseByToken } from "@/hooks/useUpdateResponseByToken";
import { useCreateResponse } from "@/hooks/useCreateResponse";
import { useSaveResponse } from "@/hooks/useSaveResponse";
import { useAnalyzeCall } from "@/hooks/useAnalyzeCall";
import { toast } from "sonner";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackService } from "@/services/feedback.service";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
import { InterviewerService } from "@/services/interviewers.service";
import { ResponseService } from "@/services/responses.service";
import { CandidateService } from "@/services/candidates.service";
import { setWebClientInstance } from "@/hooks/useAudioDetection";
import { useCandidateForm } from "@/hooks/useCandidateForm";
import { WelcomeSlide } from "./WelcomeSlide";
import { CandidateForm } from "./CandidateForm";
import { InterviewStage } from "./InterviewStage";
import { EndScreen } from "./EndScreen";

const webClient = new RetellWebClient();
setWebClientInstance(webClient);

type InterviewProps = {
  interview: Interview;
  responseToken?: string;
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

function Call({ interview, responseToken }: InterviewProps) {
  const { createResponse } = useResponses();
  const createResponseMutation = useCreateResponse();
  const { data: emailsData } = useGetAllEmails(interview?.id, !!interview?.id);
  const createOrUpdateCandidateMutation = useCreateOrUpdateCandidate();
  const registerCallMutation = useRegisterCall();
  const updateResponseByTokenMutation = useUpdateResponseByToken();
  const saveResponseMutation = useSaveResponse();
  const analyzeCallMutation = useAnalyzeCall();
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<"welcome" | "candidateForm">(
    "welcome",
  );
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("30");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");
  const [micPermissionDenied, setMicPermissionDenied] =
    useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Refs to track pause states for the timer interval
  const isTimerPausedRef = useRef<boolean>(false);
  const audioNotDetectedRef = useRef<boolean>(false);
  const hasSavedEndedRef = useRef<boolean>(false);

  // Refs for silence detection after agent stops talking
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const agentStoppedTalkingTimeRef = useRef<number | null>(null);
  const lastUserResponseLengthRef = useRef<number>(0);

  const candidateForm = useCandidateForm();
  const audioMessage =
    "I have not received any response from you, let's fix that.";

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
    },
    [],
  );

  const handleAudioNotDetectedChange = useCallback((detected: boolean) => {
    setAudioNotDetected(detected);
    audioNotDetectedRef.current = detected;
  }, []);

  const handleTimerPausedChange = useCallback((paused: boolean) => {
    console.log("[Call] handleTimerPausedChange called with:", paused);
    setIsTimerPaused(paused);
    isTimerPausedRef.current = paused;
    // Also reset audioNotDetected when resuming
    if (!paused) {
      console.log("[Call] Resuming timer, resetting audioNotDetected");
      setAudioNotDetected(false);
      audioNotDetectedRef.current = false;
    }
  }, []);

  // Clear silence timer when user actually responds (transcript changes)
  useEffect(() => {
    const currentResponseLength = lastUserResponse?.length;

    if (
      currentResponseLength > lastUserResponseLengthRef.current &&
      silenceTimerRef.current
    ) {
      console.log(
        "[Call] User responded (transcript changed), clearing silence timer",
      );
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
    formData: Omit<FeedbackData, "interview_id">,
  ) => {
    try {
      const result = await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      if (result) {
        toast.success("Thank you for your feedback!");
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  // Timer interval - uses refs to check pause state synchronously
  // Runs every 100ms instead of 10ms to reduce state updates (increments by 10 to maintain same time scale)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isCalling && !isEnded) {
      intervalId = setInterval(() => {
        // Check pause conditions using refs for immediate response
        if (!isTimerPausedRef.current) {
          setTime((prevTime) => prevTime + 1);
        }
      }, 10);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCalling, isEnded]);

  // Helper function to format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate time used and time left
  const timeUsedSeconds = Number(currentTimeDuration);
  const totalTimeSeconds = Number(interviewTimeDuration) * 60;
  const timeLeftSeconds = Math.max(0, totalTimeSeconds - timeUsedSeconds);

  // Update current duration display and check for end condition
  useEffect(() => {
    const newDuration = Math.floor(time / 100);
    setCurrentTimeDuration(String(newDuration));

    // Add logging to debug timer issues
    const timeLimit = Number(interviewTimeDuration) * 60;
    if (newDuration > 0 && newDuration % 60 === 0) {
      // Log every minute
      console.log("[Timer Debug]", {
        currentDuration: newDuration,
        timeLimit,
        interviewTimeDuration,
        timeRemaining: timeLimit - newDuration,
        willEnd: newDuration >= timeLimit,
      });
    }

    // Only end the call if not paused and time exceeded
    if (
      newDuration >= timeLimit &&
      !isEnded &&
      isCalling &&
      !audioNotDetected &&
      !isTimerPaused
    ) {
      console.log("[Timer] Ending call due to time limit reached", {
        newDuration,
        timeLimit,
        interviewTimeDuration,
      });
      webClient.stopCall();
      setIsEnded(true);
    }
  }, [
    time,
    interviewTimeDuration,
    isEnded,
    isCalling,
    audioNotDetected,
    isTimerPaused,
  ]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);

      const requestMicPermission = async () => {
        if (hasRequestedPermission.current) {
          if (!audioNotDetected && performAudioChecksRef.current) {
            performAudioChecksRef.current();
          }

          return;
        }
        hasRequestedPermission.current = true;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          setMicPermissionDenied(false);
          if (performAudioChecksRef.current) {
            performAudioChecksRef.current();
          }
        } catch (error) {
          console.error("Microphone permission denied or error:", error);
          setMicPermissionDenied(true);
          if (performAudioChecksRef.current) {
            performAudioChecksRef.current();
          }
        }
      };

      requestMicPermission();
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
      if (stopAudioLevelDetectionRef.current) {
        stopAudioLevelDetectionRef.current();
      }
    });

    webClient.on("agent_start_talking", () => {
      console.log("[Call] Agent started talking, clearing silence timers");
      setActiveTurn("agent");

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

    webClient.on("agent_stop_talking", () => {
      console.log(
        "[Call] Agent stopped talking, starting 5-second response timer",
      );
      setActiveTurn("user");

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }

      agentStoppedTalkingTimeRef.current = Date.now();
      lastUserResponseLengthRef.current = lastUserResponse?.length;

      silenceTimerRef.current = setTimeout(() => {
        const userResponded =
          lastUserResponse?.length > lastUserResponseLengthRef?.current;

        if (userResponded) {
          console.log(
            "[Call] User responded during the 5 seconds, canceling silence detection",
          );

          return;
        }

        console.log(
          "[Call] 5 seconds passed without user response, showing message",
        );
        setLastInterviewerResponse(audioMessage);

        messageTimerRef.current = setTimeout(() => {
          console.log("[Call] Showing modal and pausing timer");
          setIsTimerPaused(true);
          isTimerPausedRef.current = true;
          if (triggerSilenceDetectionRef.current) {
            triggerSilenceDetectionRef.current(true);
          }
        }, 2000);
      }, 5000);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);
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
    };
  }, [audioNotDetected, audioMessage, lastUserResponse?.length]);

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
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions?.map((q) => q?.question).join(", ") || "",
      name: candidateForm.fullName || "not provided",
    };
    setLoading(true);

    // Check if user is old using cached emails data
    const oldUserEmails: string[] = (emailsData || []).map(
      (item) => item.email,
    );
    const OldUser =
      oldUserEmails.includes(candidateForm.email) ||
      (interview?.respondents &&
        !interview?.respondents.includes(candidateForm.email));

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
      });

      const callResponse = registerCallResponse?.registerCallResponse;

      // Debug: Log the call response to verify call_id is present
      console.log("[Call] Register call response:", {
        hasCallResponse: !!callResponse,
        call_id: callResponse?.call_id,
        hasAccessToken: !!callResponse?.access_token,
        fullResponse: callResponse,
      });

      if (!callResponse?.call_id) {
        console.error("[Call] No call_id received from Retell");
        toast.error("Failed to register call. Please try again.");
        setLoading(false);
        return;
      }

      const retellCallId = callResponse.call_id;
      setCallId(retellCallId);

      console.log("[Call] Setting call_id:", retellCallId);
      console.log("[Call] Response token:", responseToken);

      // IMPORTANT: Save call_id to response IMMEDIATELY after registration
      // This ensures the link is marked as "used" even if the call fails to start
      if (responseToken) {
        // Update response by token using TanStack Query
        try {
          console.log(
            "[Call] Updating response by token (before call start):",
            {
              token: responseToken,
              call_id: retellCallId,
            },
          );
          await updateResponseByTokenMutation.mutateAsync({
            payload: {
              call_id: retellCallId,
              email: candidateForm.email,
              name: candidateForm.fullName,
              candidate_id: newCandidateId,
            },
            token: responseToken,
          });
          console.log(
            "[Call] Successfully updated response by token (before call start)",
          );
        } catch (error) {
          console.error("[Call] Failed to update response by token:", error);
          console.error("[Call] Error details:", {
            error,
            token: responseToken,
            call_id: retellCallId,
          });
          // Fallback: create new response if update fails
          await createResponseMutation.mutateAsync({
            interview_id: interview.id,
            call_id: retellCallId,
            email: candidateForm.email,
            name: candidateForm.fullName,
            candidate_id: newCandidateId ?? undefined,
          });
        }
      } else {
        // Create response using TanStack Query
        console.log(
          "[Call] Creating new response (no token, before call start):",
          {
            interview_id: interview.id,
            call_id: retellCallId,
          },
        );
        await createResponseMutation.mutateAsync({
          interview_id: interview.id,
          call_id: retellCallId,
          email: candidateForm.email,
          name: candidateForm.fullName,
          candidate_id: newCandidateId ?? undefined,
        });
      }

      // Now start the call (after call_id is saved)
      if (callResponse?.access_token) {
        await webClient
          .startCall({
            accessToken: callResponse.access_token,
          })
          .catch((err) => {
            console.error("Error starting call:", err);
            // Call_id is already saved, so link is marked as used even if call fails
            toast.error(
              "Failed to start call. The interview link has been marked as used.",
            );
            throw err;
          });
        setIsCalling(true);
        setIsStarted(true);
      } else {
        console.error("[Call] No access token received from Retell");
        toast.error(
          "Failed to get call access token. The interview link has been marked as used.",
        );
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start interview. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      console.log(
        "[Timer Setup] Setting interview duration:",
        interview.time_duration,
      );
      setInterviewTimeDuration(interview?.time_duration);
    } else {
      console.log(
        "[Timer Setup] No time_duration found, using default:",
        interviewTimeDuration,
      );
    }
  }, [interview]);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        interview.interviewer_id,
      );
      setInterviewerImg(interviewer.image);
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
          maxAttempts: number = 3,
        ) => {
          const delay = attempt * 3000; // 3s, 6s, 9s

          setTimeout(() => {
            console.log(
              `[Call] Attempting to fetch call details (attempt ${attempt}/${maxAttempts}) for ${callId}`,
            );
            analyzeCallMutation.mutate(
              { id: callId },
              {
                onSuccess: (data) => {
                  console.log(
                    `[Call] Successfully fetched call details on attempt ${attempt}:`,
                    {
                      callId,
                      hasCallResponse: !!data.callResponse,
                      hasAnalytics: !!data.analytics,
                    },
                  );
                },
                onError: (error) => {
                  console.error(
                    `[Call] Failed to fetch call details on attempt ${attempt}:`,
                    error,
                  );

                  // Retry if we haven't exceeded max attempts
                  if (attempt < maxAttempts) {
                    console.log(
                      `[Call] Retrying fetch call details in ${delay + 3000}ms...`,
                    );
                    retryFetchDetails(attempt + 1, maxAttempts);
                  } else {
                    console.error(
                      "[Call] Max retry attempts reached. Details may not be available yet.",
                    );
                    // Reset ref so it can be manually retried later
                    hasFetchedDetailsRef.current = false;
                  }
                },
              },
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

  return (
    <div className="flex justify-center items-center min-h-screen">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-floralwhite rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg text-xl font-bold transition-all md:block dark:border-white">
          <div>
            {isStarted && (
              <div className="m-4">
                {/* Timer Info Display */}
                <div className="flex flex-row items-center justify-between mb-2 px-2">
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-600">Time Used</div>
                    <div
                      className={`text-sm font-bold ${isTimerPaused ? "text-amber-600" : "text-gray-800"}`}
                    >
                      {formatTime(timeUsedSeconds)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    {isTimerPaused && (
                      <div className="text-xs font-semibold text-amber-600 mb-1 animate-pulse">
                        ⏸ PAUSED
                      </div>
                    )}
                    {!isTimerPaused && !isEnded && (
                      <div className="text-xs text-gray-500">Running</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-600">Time Left</div>
                    <div
                      className={`text-sm font-bold ${timeLeftSeconds < 60 ? "text-red-600" : "text-gray-800"}`}
                    >
                      {formatTime(timeLeftSeconds)}
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-[10px] rounded-md border-[1px] border-gray-300 relative overflow-hidden">
                  <div
                    className={`h-[10px] rounded-md transition-all ${
                      isTimerPaused
                        ? "bg-amber-500"
                        : isEnded
                          ? "bg-secondary"
                          : "bg-secondary"
                    }`}
                    style={{
                      width: isEnded
                        ? "100%"
                        : `${
                            (Number(currentTimeDuration) /
                              (Number(interviewTimeDuration) * 60)) *
                            100
                          }%`,
                    }}
                  />
                  {isTimerPaused && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        width: `${(Number(currentTimeDuration) / (Number(interviewTimeDuration) * 60)) * 100}%`,
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
            <CardHeader className="items-center p-1">
              {!isEnded && (
                <CardTitle className="flex flex-row items-center text-lg md:text-xl font-bold mb-2">
                  {interview?.name}
                </CardTitle>
              )}
              {!isEnded && (
                <div className="flex mt-2 flex-row items-center justify-center">
                  <AlarmClockIcon className="text-primary h-[1rem] w-[1rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 mr-2 font-bold" />
                  <div className="text-sm font-normal space-x-1">
                    Expected duration:
                    <span className="font-bold text-primary mr-1">
                      {interviewTimeDuration} mins
                    </span>
                    or less
                  </div>
                  {isStarted && (
                    <div className="ml-4 text-xs text-gray-500">
                      ({formatTime(timeUsedSeconds)} /{" "}
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
                      console.error("Permission still denied:", error);
                      toast.error(
                        "Microphone access denied. Please check your browser settings.",
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
              currentSlide === "welcome" && (
                <WelcomeSlide
                  interview={interview}
                  loading={loading}
                  onProceed={() => setCurrentSlide("candidateForm")}
                  onExit={onEndCallClick}
                />
              )}

            {!isStarted &&
              !isEnded &&
              !isOldUser &&
              currentSlide === "candidateForm" && (
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
                  onGoBack={() => setCurrentSlide("welcome")}
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
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        <a
          className="flex flex-row justify-center align-middle mt-3"
          href="https://hirin-up.vercel.app/"
          target="_blank"
        >
          <div className="text-center text-md font-normal shadow-none mr-2">
            Powered by{" "}
            <span className="font-bold">
              Hirin<span className="text-indigo-600">Up</span>
            </span>
          </div>
          <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
        </a>
      </div>
    </div>
  );
}

export default Call;
