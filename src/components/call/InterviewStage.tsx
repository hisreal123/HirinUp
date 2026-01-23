"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useAudioDetection } from "@/hooks/useAudioDetection";
import { InterviewView } from "./InterviewView";
import { AudioDetectionModal } from "./AudioDetectionModal";

interface InterviewStageProps {
  lastInterviewerResponse: string;
  setLastInterviewerResponse: (message: string) => void;
  lastUserResponse: string;
  activeTurn: string;
  interviewerImg: string;
  lastUserResponseRef: React.RefObject<HTMLDivElement>;
  isEnded: boolean;
  onAudioNotDetectedChange: (detected: boolean) => void;
  onTimerPausedChange: (paused: boolean) => void;
  onPerformAudioChecks: (fn: () => Promise<void>) => void;
  onStopAudioLevelDetection: (fn: () => void) => void;
  onTriggerSilenceDetection: (fn: (skipMessage?: boolean) => void) => void;
}

export function InterviewStage({
  lastInterviewerResponse,
  setLastInterviewerResponse,
  lastUserResponse,
  activeTurn,
  interviewerImg,
  lastUserResponseRef,
  isEnded,
  onAudioNotDetectedChange,
  onTimerPausedChange,
  onPerformAudioChecks,
  onStopAudioLevelDetection,
  onTriggerSilenceDetection,
}: InterviewStageProps) {
  const audioMessage = "I can see you, but I'm not receiving any audio yet. Let's quickly check a few things together.";

  const handleAudioMessage = useCallback((message: string) => {
    console.log('[Audio Detection] Setting interviewer message:', message);
    setLastInterviewerResponse(message);
  }, [setLastInterviewerResponse]);

  const {
    audioNotDetected,
    showAudioModal,
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
    triggerSilenceDetection,
  } = useAudioDetection(true, handleAudioMessage);

  // Pass the functions up to the parent
  useEffect(() => {
    onPerformAudioChecks(() => performAudioChecks());
    onStopAudioLevelDetection(() => stopAudioLevelDetection());
    onTriggerSilenceDetection((skipMessage) => triggerSilenceDetection(skipMessage));
  }, [performAudioChecks, stopAudioLevelDetection, triggerSilenceDetection, onPerformAudioChecks, onStopAudioLevelDetection, onTriggerSilenceDetection]);

  // Notify parent of audio detection state changes
  useEffect(() => {
    onAudioNotDetectedChange(audioNotDetected);
  }, [audioNotDetected, onAudioNotDetectedChange]);

  // Track if modal was previously open to only resume when it actually closes
  const wasModalOpenRef = useRef(false);

  // Resume timer when modal closes (not on initial mount)
  useEffect(() => {
    if (showAudioModal) {
      wasModalOpenRef.current = true;
    } else if (wasModalOpenRef.current) {
      // Modal was open and is now closing
      console.log('[InterviewStage] Modal closed, calling onTimerPausedChange(false)');
      onTimerPausedChange(false);
      wasModalOpenRef.current = false;
    }
  }, [showAudioModal, onTimerPausedChange]);

  return (
    <>
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
        onOpenChange={(open) => {
          console.log('[InterviewStage] Modal onOpenChange called with:', open);
          setShowAudioModal(open);
        }}
        onDeviceChange={changeDevice}
        onTestMicrophone={testMicrophone}
      />
      <InterviewView
        lastInterviewerResponse={lastInterviewerResponse}
        lastUserResponse={lastUserResponse}
        activeTurn={activeTurn}
        interviewerImg={interviewerImg}
        lastUserResponseRef={lastUserResponseRef}
      />
    </>
  );
}
