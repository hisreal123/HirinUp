"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  CheckCircleIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { useResponses } from "@/contexts/responses.context";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
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
import { useAudioDetection, setWebClientInstance } from "@/hooks/useAudioDetection";
import { useCandidateForm } from "@/hooks/useCandidateForm";
import { WelcomeSlide } from "./WelcomeSlide";
import { CandidateForm } from "./CandidateForm";
import { InterviewView } from "./InterviewView";
import { AudioDetectionModal } from "./AudioDetectionModal";
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
  const [lastInterviewerResponse, setLastInterviewerResponse] = useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<"welcome" | "candidateForm">("welcome");
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] = useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");

  const candidateForm = useCandidateForm();
  const audioMessage = "I can see you, but I'm not receiving any audio yet. Let's quickly check a few things together.";
  
  const {
    audioNotDetected,
    showAudioModal,
    audioStreamRef,
    audioCheckStatus,
    audioLevel,
    availableDevices,
    selectedDeviceId,
    isTestingMic,
    performAudioChecks,
    stopAudioLevelDetection,
    setShowAudioModal,
    changeDevice,
    testMicrophone,
  } = useAudioDetection(isStarted, (message) => {
    setLastInterviewerResponse(message);
  });

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    let intervalId: any;
    if (isCalling && !audioNotDetected) {
      intervalId = setInterval(() => setTime((prevTime) => prevTime + 1), 10);
    }
    
    const newDuration = Math.floor(time / 100);
    setCurrentTimeDuration(String(newDuration));
    
    if (newDuration >= Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCalling, time, interviewTimeDuration, audioNotDetected]);

  // Start audio detection when candidate form is shown or component mounts
  useEffect(() => {
    if (!isEnded && !isOldUser && (currentSlide === "candidateForm" || currentSlide === "welcome")) {
      if (!audioStreamRef.current) {
        performAudioChecks();
      }
    }
  }, [currentSlide, isEnded, isOldUser, performAudioChecks, audioStreamRef]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
      if (!audioNotDetected) {
        performAudioChecks();
      }
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
      stopAudioLevelDetection();
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      setActiveTurn("user");
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
      stopAudioLevelDetection();
    };
  }, [audioNotDetected, performAudioChecks, stopAudioLevelDetection]);

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
      questions: interview?.questions.map((q) => q.question).join(", "),
      name: candidateForm.fullName || "not provided",
    };
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(candidateForm.email) ||
      (interview?.respondents && !interview?.respondents.includes(candidateForm.email));

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
      const parsedSocialMediaLinks = Object.keys(socialMediaLinksObj).length > 0 ? socialMediaLinksObj : null;

      const workExperienceObj: Record<string, any> = {};
      if (candidateForm.workExperienceYears && candidateForm.workExperienceYears.trim()) {
        workExperienceObj.years = candidateForm.workExperienceYears.trim();
      }
      const parsedWorkExperience = Object.keys(workExperienceObj).length > 0 ? workExperienceObj : null;

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

      const newCandidateId = await CandidateService.createOrUpdateCandidate(
        candidateData,
        candidateForm.email,
      );
      setCandidateId(newCandidateId);

      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id },
      );
      
      if (registerCallResponse.data.registerCallResponse.access_token) {
        await webClient
          .startCall({
            accessToken:
              registerCallResponse.data.registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true);
        setIsStarted(true);

        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);

        if (responseToken) {
          await ResponseService.updateResponseByToken(
            {
              call_id: registerCallResponse.data.registerCallResponse.call_id,
              email: candidateForm.email,
              name: candidateForm.fullName,
              candidate_id: newCandidateId,
            },
            responseToken,
          );
        } else {
          const response = await createResponse({
            interview_id: interview.id,
            call_id: registerCallResponse.data.registerCallResponse.call_id,
            email: candidateForm.email,
            name: candidateForm.fullName,
            candidate_id: newCandidateId,
          });
        }
      } else {
        console.log("Failed to register call");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start interview. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
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

  useEffect(() => {
    if (isEnded) {
      const updateInterview = async () => {
        await ResponseService.saveResponse(
          { is_ended: true, tab_switch_count: tabSwitchCount },
          callId,
        );
      };

      updateInterview();
    }
  }, [isEnded, callId, tabSwitchCount]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-floralwhite rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg text-xl font-bold transition-all md:block dark:border-white">
          <div>
            {isStarted && (
              <div className="m-4 h-[10px] rounded-md border-[1px] border-gray-300">
                <div
                  className="bg-secondary h-[10px] rounded-md"
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
              </div>
            )}
            <CardHeader className="items-center p-1">
              {!isEnded && (
                <CardTitle className="flex flex-row items-center text-lg md:text-xl font-bold mb-2">
                  {interview?.name}
                </CardTitle>
              )}
              {!isEnded && (
                <div className="flex mt-2 flex-row">
                  <AlarmClockIcon className="text-primary h-[1rem] w-[1rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 mr-2 font-bold" />
                  <div className="text-sm font-normal space-x-1">
                    Expected duration:
                    <span className="font-bold text-primary mr-1">
                      {interviewTimeDuration} mins
                    </span>
                    or less
                  </div>
                </div>
              )}
            </CardHeader>

            {!isStarted && !isEnded && !isOldUser && currentSlide === "welcome" && (
              <WelcomeSlide
                interview={interview}
                loading={loading}
                onProceed={() => setCurrentSlide("candidateForm")}
                onExit={onEndCallClick}
              />
            )}

            {!isStarted && !isEnded && !isOldUser && currentSlide === "candidateForm" && (
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

            {!isEnded && !isOldUser && (
              <AudioDetectionModal
                open={showAudioModal}
                audioNotDetected={audioNotDetected}
                message={audioMessage}
                audioCheckStatus={audioCheckStatus}
                audioLevel={audioLevel}
                availableDevices={availableDevices}
                selectedDeviceId={selectedDeviceId}
                isTestingMic={isTestingMic}
                onCheckAgain={performAudioChecks}
                onOpenChange={setShowAudioModal}
                onDeviceChange={changeDevice}
                onTestMicrophone={testMicrophone}
              />
            )}

            {isStarted && !isEnded && !isOldUser && (
              <InterviewView
                lastInterviewerResponse={lastInterviewerResponse}
                lastUserResponse={lastUserResponse}
                activeTurn={activeTurn}
                interviewerImg={interviewerImg}
                loading={loading}
                onEndCall={onEndCallClick}
                lastUserResponseRef={lastUserResponseRef}
              />
            )}

            {isEnded && !isOldUser && (
              <EndScreen
                isStarted={isStarted}
                isFeedbackSubmitted={isFeedbackSubmitted}
                email={candidateForm.email}
                onFeedbackSubmit={handleFeedbackSubmit}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
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

