"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useResponses } from "@/contexts/responses.context";
import Image from "next/image";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { testEmail } from "@/lib/utils";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackService } from "@/services/feedback.service";
import { FeedbackForm } from "@/components/call/feedbackForm";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InterviewerService } from "@/services/interviewers.service";
import { ResponseService } from "@/services/responses.service";
import { CandidateService } from "@/services/candidates.service";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { countries } from "@/lib/countries";

const webClient = new RetellWebClient();

type InterviewProps = {
  interview: Interview;
  responseToken?: string; // Token (random string) instead of numeric ID
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
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<"welcome" | "candidateForm">("welcome");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [workExperienceYears, setWorkExperienceYears] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidPhone, setIsValidPhone] = useState<boolean>(true);
  const [isValidTwitter, setIsValidTwitter] = useState<boolean>(true);
  const [isValidLinkedin, setIsValidLinkedin] = useState<boolean>(true);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");
  
  // Audio detection states
  const [audioNotDetected, setAudioNotDetected] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const audioMessage = "I can see you, but I'm not receiving any audio yet. Let's quickly check a few things together.";
  const [audioCheckStatus, setAudioCheckStatus] = useState({
    microphonePermission: false,
    audioLevelDetected: false,
    deviceSelected: false,
    browserCompatible: true,
    networkQuality: "unknown" as "good" | "poor" | "unknown",
  });
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    // Pause timer when audio is not detected
    if (isCalling && !audioNotDetected) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      // Use functional update to avoid closure issues
      intervalId = setInterval(() => setTime((prevTime) => prevTime + 1), 10);
    }
    
    // Update currentTimeDuration based on time
    const newDuration = Math.floor(time / 100);
    setCurrentTimeDuration(String(newDuration));
    
    // Check if interview time limit reached
    if (newDuration >= Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalling, time, interviewTimeDuration, audioNotDetected]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    } else {
      setIsValidEmail(false);
    }
  }, [email]);

  useEffect(() => {
    if (phone && phone.trim()) {
      const isValid = isValidPhoneNumber(phone);
      setIsValidPhone(isValid);
    } else {
      setIsValidPhone(true); // Allow empty initially, will be checked on submit
    }
  }, [phone]);

  useEffect(() => {
    if (twitter && twitter.trim()) {
      const url = twitter.trim();
      setIsValidTwitter(url.startsWith("https://") || url === "");
    } else {
      setIsValidTwitter(true);
    }
  }, [twitter]);

  useEffect(() => {
    if (linkedin && linkedin.trim()) {
      const url = linkedin.trim();
      setIsValidLinkedin(url.startsWith("https://") || url === "");
    } else {
      setIsValidLinkedin(true);
    }
  }, [linkedin]);

  // Audio detection functions
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      return false;
    }
  };

  const checkBrowserCompatibility = (): boolean => {
    const hasMediaDevices = !!(navigator.mediaDevices);
    const hasGetUserMedia = hasMediaDevices && "getUserMedia" in navigator.mediaDevices;
    const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
    return hasMediaDevices && hasGetUserMedia && hasAudioContext;
  };

  const getAvailableAudioDevices = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audioinput");
    } catch (error) {
      console.error("Error enumerating devices:", error);
      return [];
    }
  };

  const checkNetworkQuality = async (): Promise<"good" | "poor" | "unknown"> => {
    try {
      // Try to get WebRTC stats from the Retell client
      // Note: This is a simplified check. In production, you'd get actual peer connection stats
      const connection = (webClient as any).peerConnection;
      if (connection) {
        const stats = await connection.getStats();
        let hasAudioStats = false;
        stats.forEach((report: any) => {
          if (report.type === "inbound-rtp" && report.mediaType === "audio") {
            hasAudioStats = true;
            // Check packet loss, jitter, etc.
            const packetLoss = report.packetsLost / report.packetsReceived;
            if (packetLoss > 0.1) {
              return "poor";
            }
          }
        });
        return hasAudioStats ? "good" : "unknown";
      }
      return "unknown";
    } catch (error) {
      console.error("Error checking network quality:", error);
      return "unknown";
    }
  };

  const startAudioLevelDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let noAudioCount = 0;
      const maxNoAudioCount = 30; // ~1 second at 30fps

      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const threshold = 5; // Minimum audio level threshold

        if (average < threshold) {
          noAudioCount++;
          if (noAudioCount >= maxNoAudioCount) {
            setAudioCheckStatus((prev) => ({
              ...prev,
              audioLevelDetected: false,
            }));
            if (!audioNotDetected) {
              // First time detecting no audio
              setAudioNotDetected(true);
              // Only show AI message if interview has started (AI is active)
              if (isStarted) {
                setLastInterviewerResponse(audioMessage);
                // Show modal after a delay to let user see/hear the AI message
                setTimeout(() => {
                  setShowAudioModal(true);
                }, 2000); // 2 second delay
              } else {
                // Interview hasn't started yet - show modal immediately on candidate form
                setTimeout(() => {
                  setShowAudioModal(true);
                }, 1000); // 1 second delay
              }
            }
          }
        } else {
          noAudioCount = 0;
          setAudioCheckStatus((prev) => ({
            ...prev,
            audioLevelDetected: true,
          }));
          if (audioNotDetected) {
            // Audio detected again - hide modal and clear message
            setAudioNotDetected(false);
            setShowAudioModal(false);
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error("Error starting audio detection:", error);
      setAudioCheckStatus((prev) => ({
        ...prev,
        audioLevelDetected: false,
      }));
    }
  };

  const stopAudioLevelDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const performAudioChecks = async () => {
    // Temporarily hide modal while checking
    setShowAudioModal(false);
    
    // Check microphone permission
    const hasPermission = await checkMicrophonePermission();
    setAudioCheckStatus((prev) => ({
      ...prev,
      microphonePermission: hasPermission,
    }));

    // Check browser compatibility
    const isCompatible = checkBrowserCompatibility();
    setAudioCheckStatus((prev) => ({
      ...prev,
      browserCompatible: isCompatible,
    }));

    // Check available devices
    const devices = await getAvailableAudioDevices();
    setAudioCheckStatus((prev) => ({
      ...prev,
      deviceSelected: devices.length > 0,
    }));

    // Check network quality
    const networkQuality = await checkNetworkQuality();
    setAudioCheckStatus((prev) => ({
      ...prev,
      networkQuality,
    }));

    // Start continuous audio level detection if permission granted
    if (hasPermission && isCompatible) {
      await startAudioLevelDetection();
      // If audio is detected, clear the audio not detected state
      if (!audioNotDetected) {
        // Audio is working, clear the message if it was set
        // The normal AI transcript will replace it
      }
    } else {
      // No permission or incompatible - show modal
      setAudioNotDetected(true);
      // Only show AI message if interview has started
      if (isStarted) {
        setLastInterviewerResponse(audioMessage);
        setTimeout(() => {
          setShowAudioModal(true);
        }, 2000); // 2 second delay
      } else {
        // Interview hasn't started yet - show modal immediately
        setTimeout(() => {
          setShowAudioModal(true);
        }, 1000); // 1 second delay
      }
    }
  };

  // Start audio detection when candidate form is shown or component mounts
  useEffect(() => {
    // Start audio detection early - when candidate form is shown or when component first mounts
    if (!isEnded && !isOldUser && (currentSlide === "candidateForm" || currentSlide === "welcome")) {
      // Only start if not already detecting (to avoid multiple simultaneous checks)
      if (!audioStreamRef.current) {
        performAudioChecks();
      }
    }
    
    return () => {
      // Don't stop audio detection here - let it run continuously
      // It will be stopped when call ends or component unmounts
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isEnded, isOldUser]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
      // Ensure audio detection is running when call starts
      if (!audioNotDetected) {
        performAudioChecks();
      }
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
      // Stop audio detection when call ends
      stopAudioLevelDetection();
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      // Optional: Add any logic when agent stops talking
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
      //TODO: highlight the newly uttered word in the UI
    });

    return () => {
      // Clean up event listeners
      webClient.removeAllListeners();
      // Clean up audio detection
      stopAudioLevelDetection();
    };
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
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions.map((q) => q.question).join(", "),
      name: fullName || "not provided",
    };
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(email) ||
      (interview?.respondents && !interview?.respondents.includes(email));

    if (OldUser) {
      setIsOldUser(true);
      setLoading(false);
      return;
    }

    try {
      // Create or update candidate
      // Build social media links JSON object
      const socialMediaLinksObj: Record<string, string> = {};
      if (twitter && twitter.trim()) {
        socialMediaLinksObj.twitter = twitter.trim();
      }
      if (linkedin && linkedin.trim()) {
        socialMediaLinksObj.linkedin = linkedin.trim();
      }
      const parsedSocialMediaLinks = Object.keys(socialMediaLinksObj).length > 0 ? socialMediaLinksObj : null;

      // Build work experience JSON object
      const workExperienceObj: Record<string, any> = {};
      if (workExperienceYears && workExperienceYears.trim()) {
        workExperienceObj.years = workExperienceYears.trim();
      }
      const parsedWorkExperience = Object.keys(workExperienceObj).length > 0 ? workExperienceObj : null;

      const candidateData = {
        email: email || null,
        name: fullName || null,
        full_name: fullName || null,
        phone: phone || null,
        gender: gender || null,
        country: country || null,
        social_media_links: parsedSocialMediaLinks,
        work_experience: parsedWorkExperience,
      };

      const newCandidateId = await CandidateService.createOrUpdateCandidate(
        candidateData,
        email,
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

        // If responseToken is provided, update existing response; otherwise create new one
        if (responseToken) {
          await ResponseService.updateResponseByToken(
            {
              call_id: registerCallResponse.data.registerCallResponse.call_id,
              email: email,
              name: fullName,
              candidate_id: newCandidateId,
            },
            responseToken,
          );
        } else {
          // Backward compatibility: create new response if no responseToken provided
          const response = await createResponse({
            interview_id: interview.id,
            call_id: registerCallResponse.data.registerCallResponse.call_id,
            email: email,
            name: fullName,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded]);

  return (
    <div className="flex justify-center items-center min-h-screen ">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-floralwhite rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg text-xl font-bold transition-all  md:block dark:border-white ">
          <div>
            {isStarted && (
              <div className="m-4 h-[10px] rounded-md border-[1px] border-gray-300">
                <div
                  className=" bg-secondary h-[10px] rounded-md"
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
                  <AlarmClockIcon
                    className="text-primary h-[1rem] w-[1rem] rotate-0 scale-100  dark:-rotate-90 dark:scale-0 mr-2 font-bold"
                  />
                  <div className="text-sm font-normal space-x-1">
                    Expected duration:
                    <span
                      className="font-bold text-primary mr-1"
                    >
                      {interviewTimeDuration} mins
                    </span>
                    or less
                  </div>
                </div>
              )}
            </CardHeader>
            {!isStarted && !isEnded && !isOldUser && currentSlide === "welcome" && (
              <div className=" relative w-[80%] mx-auto mt-2 h-full p-2 m-2 bg-slate-50  rounded-md">
                <div>
                  {interview?.logo_url && (
                    <div className="p-1 flex justify-center">
                      <Image
                        src={interview?.logo_url}
                        alt="Logo"
                        className="h-10 w-auto"
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  <div className="p-2 font-normal overflow-hidden relative h-fit text-sm w-[80%] mx-auto mb-4 whitespace-pre-line">
                    {interview?.description}
                    <p className="font-bold text-sm bg-orange-400 rounded-md mt-2 p-2">
                      Ensure your volume is up and grant microphone access
                      when prompted. Additionally, please make sure you are in a
                      quiet environment.
                      {"\n\n"}Note: Tab switching will be recorded.
                    </p>
                  </div>
                </div>
                <div className="w-[80%]  flex flex-row mx-auto justify-center items-center align-middle gap-2">
                  <Button
                    className="font-normal rounded-lg flex flex-row justify-center mb-8 px-4 h-10"
                    disabled={Loading}
                    onClick={() => setCurrentSlide("candidateForm")}
                  >
                    Proceed
                  </Button>
                  <AlertDialog>
                    {/* <AlertDialogTrigger>
                      <Button
                        className="bg-white border border-primary ml-2 text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger> */}
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-secondary hover:bg-secondary/90 text-white"
                          onClick={async () => {
                            await onEndCallClick();
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
            {!isStarted && !isEnded && !isOldUser && currentSlide === "candidateForm" && (
              <div className=" relative w-[80%] mx-auto mt-2 shadow-lg rounded-md p-2 m-2 bg-slate-50 max-h-[calc(88vh-200px)] overflow-y-auto">
                <div className="p-2">
                  <h2 className="text-lg font-semibold mb-4 text-center">Candidate Information</h2>
                  <div className="grid grid-cols-2 gap-3 px-4">
                    {!interview?.is_anonymous && (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          className={email && !isValidEmail ? "border-red-500" : ""}
                          placeholder="Enter your email address"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {email && !isValidEmail && (
                          <p className="text-xs text-red-500">
                            Please enter a valid email address
                          </p>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        placeholder="Enter your full name"
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={phone}
                        onChange={(value) => setPhone(value || "")}
                        placeholder="Enter phone number"
                        className={!isValidPhone && phone ? "phone-input-error" : ""}
                        numberInputProps={{
                          className: !isValidPhone && phone ? "error" : "",
                        }}
                      />
                      {!isValidPhone && phone && (
                        <p className="text-xs text-red-500">
                          Please enter a valid phone number
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countries.map((countryOption) => (
                            <SelectItem key={countryOption.value} value={countryOption.value}>
                              {countryOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter (optional)</Label>
                      <Input
                        id="twitter"
                        type="url"
                        value={twitter}
                        className={!isValidTwitter ? "border-red-500" : ""}
                        placeholder="https://twitter.com/yourhandle"
                        onChange={(e) => setTwitter(e.target.value)}
                      />
                      {!isValidTwitter && (
                        <p className="text-xs text-red-500">
                          URL must start with https://
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn <span className="text-red-500">*</span></Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={linkedin}
                        className={!isValidLinkedin ? "border-red-500" : ""}
                        placeholder="https://linkedin.com/in/yourprofile"
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                      {!isValidLinkedin && (
                        <p className="text-xs text-red-500">
                          URL must start with https://
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience <span className="text-red-500">*</span></Label>
                      <Input
                        id="experience"
                        type="number"
                        value={workExperienceYears}
                        placeholder="e.g. 5"
                        onChange={(e) => setWorkExperienceYears(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle gap-2 mt-4">
                  <Button
                    className="bg-white border border-primary text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                    disabled={Loading}
                    onClick={() => setCurrentSlide("welcome")}
                  >
                    Go Back
                  </Button>
                  <Button
                    className="min-w-20 h-10 rounded-xl flex flex-row justify-center mb-8 bg-primary text-white hover:bg-primary/90"
                    disabled={
                      Loading ||
                      (!interview?.is_anonymous && !isValidEmail) ||
                      !fullName?.trim() ||
                      !phone?.trim() ||
                      !isValidPhone ||
                      !country?.trim() ||
                      !gender ||
                      !workExperienceYears?.trim() ||
                      !linkedin?.trim() ||
                      !isValidTwitter ||
                      !isValidLinkedin
                    }
                    onClick={startConversation}
                  >
                    {!Loading ? "Start Interview" : <MiniLoader />}
                  </Button>
                  <AlertDialog>
                    {/* <AlertDialogTrigger>
                      <Button
                        className="bg-white border border-primary ml-2 text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger> */}
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-secondary hover:bg-secondary/90 text-white"
                          onClick={async () => {
                            await onEndCallClick();
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
            {/* Audio Detection Modal - Show on both candidate form and interview pages */}
            {!isEnded && !isOldUser && showAudioModal && (
              <AlertDialog 
                open={true}
                onOpenChange={(open) => {
                  // Prevent closing the dialog by clicking outside or pressing ESC
                  // Only allow closing when audio is detected (handled by setAudioNotDetected)
                  if (!open && audioNotDetected) {
                    // Do nothing - keep it open
                  }
                }}
              >
                <AlertDialogContent 
                  className="max-w-md"
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold">
                      Audio Not Detected
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base mt-2">
                      {audioMessage}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={async () => {
                        // Re-run audio checks
                        await performAudioChecks();
                      }}
                    >
                      Check Again
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isStarted && !isEnded && !isOldUser && (
              <div className="flex flex-col">
                <div className="flex flex-row p-2 grow">
                  <div className="border-x-2 border-grey w-[50%] my-auto min-h-[70%]">
                    <div className="flex flex-col justify-evenly">
                      <div
                        className={`text-[22px] w-[80%] md:text-[26px] mt-4 min-h-[250px] mx-auto px-6`}
                      >
                        {lastInterviewerResponse}
                      </div>
                      <div className="flex flex-col mx-auto justify-center items-center align-middle">
                        <Image
                          src={interviewerImg}
                          alt="Image of the interviewer"
                          width={120}
                          height={120}
                          className={`object-cover object-center mx-auto my-auto ${
                            activeTurn === "agent"
                              ? "border-4 border-primary rounded-full"
                              : ""
                          }`}
                        />
                        <div className="font-semibold">Interviewer</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-evenly w-[50%]">
                    <div
                      ref={lastUserResponseRef}
                      className={`text-[22px] w-[80%] md:text-[26px] mt-4 mx-auto h-[250px] px-6 overflow-y-auto`}
                    >
                      {lastUserResponse}
                    </div>
                    <div className="flex flex-col mx-auto justify-center items-center align-middle">
                      <Image
                        src={`/user-icon.png`}
                        alt="Picture of the user"
                        width={120}
                        height={120}
                        className={`object-cover object-center mx-auto my-auto ${
                          activeTurn === "user"
                            ? "border-4 border-primary rounded-full"
                            : ""
                        }`}
                      />
                      <div className="font-semibold">You</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isStarted && !isEnded && !isOldUser && (
              <div className="items-center p-2">
                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <Button
                      className=" bg-white text-black border  border-indigo-600 h-10 mx-auto flex flex-row justify-center mb-8"
                      disabled={Loading}
                    >
                      End Interview
                      <XCircleIcon className="h-[1.5rem] ml-2 w-[1.5rem] rotate-0 scale-100  dark:-rotate-90 dark:scale-0 text-red" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This action will end the
                        call.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-indigo-600 hover:bg-indigo-800"
                        onClick={async () => {
                          await onEndCallClick();
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {isEnded && !isOldUser && (
              <div className="w-[70%]  px-3 mx-auto mt-2  border border-secondary rounded-md p-2 m-2 bg-slate-50  absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[70%] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
                    <p className="text-lg font-semibold text-center">
                      {isStarted
                        ? `Thank you for taking the time to participate in this interview`
                        : "Thank you very much for considering."}
                    </p>
                    <p className="text-center">
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>

                  {!isFeedbackSubmitted && (
                    <AlertDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    >
                      <AlertDialogTrigger className="w-full flex justify-center">
                        <Button
                          className="bg-secondary hover:bg-secondary/90 text-white h-10 mt-4 mb-4"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Provide Feedback
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <FeedbackForm
                          email={email}
                          onSubmit={handleFeedbackSubmit}
                        />
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
            {isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2  border border-indigo-200 rounded-md p-2 m-2 bg-slate-50  absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
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
          <div className="text-center text-md font-normal  shadow-none mr-2  ">
            Powered by{" "}
            <span className="font-bold">
              Hirin<span className="text-indigo-600">Up</span>
            </span>
          </div>
          <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
        </a>
      </div>
    </div>
  );
}

export default Call;
  