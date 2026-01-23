"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Loader2, Mic, RefreshCw, Check, ArrowUp, ArrowLeft, CircleDot, Router } from "lucide-react";
import { AudioCheckStatus } from "@/hooks/useAudioDetection";
import { useRef } from "react";

interface AudioDetectionModalProps {
  open: boolean;
  audioNotDetected: boolean;
  message: string;
  audioCheckStatus: AudioCheckStatus;
  audioLevel: number;
  availableDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  isTestingMic: boolean;
  onCheckAgain: () => void;
  onOpenChange: (open: boolean) => void;
  onDeviceChange: (deviceId: string) => void;
  onTestMicrophone: () => void;
}

function StatusIcon({ status }: { status: boolean }) {
  return status ? (
    <div className="px-2 py-1 rounded-md flex items-center space-x-2">
      <span className="bg-green-600 rounded-md p-1">
        <Check className="h-4 w-4 text-gray-300 text-white" />
      </span>
      <span className="font-bold">OK</span>
    </div>
  ) : (
    <div className="bg-red-600 text-gray-200 px-2 py-1 rounded-md flex items-center space-x-2">
      <ArrowUp className="h-4 w-4 text-white" />
      <span className="font-bold">Issue</span>
    </div>
  );
}

function AudioLevelBar({ level }: { level: number }) {
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-75"
        style={{ width: `${Math.min(100, level)}%` }}
      />
    </div>
  );
}

export function AudioDetectionModal({
  open,
  audioNotDetected,
  message,
  audioCheckStatus,
  audioLevel,
  availableDevices,
  selectedDeviceId,
  isTestingMic,
  onCheckAgain,
  onOpenChange,
  onDeviceChange,
  onTestMicrophone,
}: AudioDetectionModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const explicitCloseRef = useRef(false);

  // Reset to step 1 when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCurrentStep(1);
      explicitCloseRef.current = false;
    }
    // Allow closing if user explicitly clicked Close button
    // Only prevent closing when clicking outside/ESC if audioNotDetected
    if (!isOpen && audioNotDetected && !explicitCloseRef.current) {
      return;
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg  w-full font-semibold">
            <div className="flex items-center  justify-center gap-3 text-blue-800">
              <span>AI Interview</span>
              <span className="mr-2 ml-2">-</span>
              <span>Audio Not Detected</span>
            </div>
          </AlertDialogTitle>
          
          <div className="border-b-4 border-blue-800 pb-2"></div>


          <AlertDialogDescription className="text-base mt-2 px-4">
            <div className="flex justify-center">
              {currentStep === 1 ? (
                <p className="font-bold text-sm flex text-blue-800">
                  <span>Step 1:</span> Browser & Device Checks <span className="text-blue-500 text-sm ml-2 italic">(Primary Path)</span>
                </p>
              ) : currentStep === 2 ? (
                <p className="font-bold text-sm flex text-blue-800">
                  <span>Step 2:</span> Advanced Network Diagnostics <span className="text-blue-500 text-sm ml-2 italic">(Optional)</span>
                </p>
              ) : (
                <p className="font-bold text-md flex text-blue-800">
                  <span>Step 3:</span> OS-Level Checks <span className="text-blue-500 text-sm ml-2 italic">(No Terminal)</span>
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

<div className="px-4">
        {currentStep === 1 ? (
          <div className="space-y-4 py-4 border border-gray-200 rounded-md p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            <p className="font-medium text-blue-800 italic mt-4 text-sm">"Please check that the correct microphone is selected and not muted. <br/> You should see the audio bar moving when you speak."</p>
          </div>
          
          {/* Status Checklist */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Live Checklist</h4>
            <div className="space-y-2 text-sm border border-gray-200 rounded-md p-1">
              <div className="flex items-center gap-2 w-full relative justify-between">
                <span>Microphone permission granted</span>
                <div className="flex items-center space-x-2">
                  {audioCheckStatus.microphonePermission === true && audioCheckStatus.audioLevelDetected === true ? (
                    <>
                      <StatusIcon status={true} />
                    </>
                  ) : (
                    <>
                      <StatusIcon status={false} />
                    </>
                  )}
                </div>
              </div>

              {/* seperator */}
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex items-center gap-2 w-full relative justify-between">
                  <span>Browser compatible</span>
                  <div className="flex items-center space-x-2">
                    {audioCheckStatus.browserCompatible === true ? <StatusIcon status={true} />  : <StatusIcon status={false} />}
                </div>
              </div>

              {/* seperator */}
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex items-center gap-2 w-full relative justify-between">
                <span>Audio device available</span>
                <div className="flex items-center space-x-2">
                  {audioCheckStatus.deviceSelected === true ? <StatusIcon status={true} />
                   : <StatusIcon status={false} />}
                </div>
              </div>

              {/* seperator */}
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex items-center gap-2 w-full relative justify-between">
                <span>
                  Audio level: {audioCheckStatus.audioLevelDetected === true ? (
                    <span className="font-bold text-green-600">Detected</span>
                  ) : (
                    <span className="font-bold" style={{ color: '#dc2626', fontWeight: 'bold' }}>Not Detected</span>
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  {audioCheckStatus.audioLevelDetected === true ?   
                    <StatusIcon status={true} />
                   : <StatusIcon status={false} />}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Level Indicator */}
          {/* <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Audio Level {isTestingMic && "(Testing...)"}
            </h4>
            <AudioLevelBar level={audioLevel} />
            <p className="text-xs text-gray-500">
              Speak to see the bar move. If it stays still, your microphone may not be working.
            </p>
          </div> */}

          {/* Device Selection */}
          {/* {availableDevices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Select Microphone</h4>
              <Select value={selectedDeviceId} onValueChange={onDeviceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a microphone" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}

          {/* Action Buttons */}
          {/* <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              disabled={isTestingMic}
              className="w-full"
              onClick={onTestMicrophone}
            >
              {isTestingMic ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Test Microphone
                </>
              )}
            </Button>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={onCheckAgain}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Again
            </Button>
          </div> */}
          </div>
        ) : currentStep === 2 ? (
          <div className="space-y-4 py-4 border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="text-sm text-gray-500">
              <p className="font-medium text-blue-800 italic mt-4 text-sm">"if you'd like, we can run a couple of optional connectivity checks. <br/> These do not change your system."</p>
            </div>
            
            {/* Network Diagnostics Checklist */}
            {/* Seperator */}
            <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex items-center gap-2">
                <div className="space-y-2 border shadow-sm border-gray-200 rounded-md p-2">
                  <h4 className="text-sm font-bold text-gray-900 border-b flex items-center space-x-2">
                     <CircleDot className="h-4 w-4 text-blue-500" />
                     Ping Test</h4>
                  <p>ping <span className="text-blue-500">interview.yourdomain.com</span></p>
                </div>

                <div className="space-y-2 border shadow-sm border-gray-200 rounded-md p-2">
                  <h4 className="text-sm font-bold text-gray-900 border-b flex items-center space-x-2">
                     <Router className="h-4 w-4 text-blue-500 mr-2" />
                     DNS Test</h4>
                  <p>nslookup <span className="text-blue-500">interview.yourdomain.com</span></p>
                </div>
              </div>
               {/* seperator line */}
             <div className="h-px bg-gray-200 my-2"></div>
            </div>
        ) : (
          <div className="space-y-4 py-4 border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="text-sm text-gray-500">
              <p className="font-medium text-blue-800 italic mt-4 text-sm">"Your browser settings look fine, This is often caused by a network <br/> issue or another application using the microphone"</p>
            </div>
            
            {/* OS-Level Checks */}
            {/* Seperator */}
            <div className="h-px bg-gray-200 my-2"></div>
              
              <div className="flex items-center gap-2">
                <ul className="list-disc list-inside flex flex-col space-y-4 text-gray-800 font-medium">
                  <li>Another application may be using the microphone</li>
                  <li>OS micophone privacy settings may block access</li>
                  <li>Device driver or audio route issue may be present</li>
                </ul>
              </div>
              {/* seperator line */}
            <div className="h-px bg-gray-200 my-2"></div>  
          </div>
        )}

        <div className="flex justify-end items-center mt-4">
          {currentStep < 3 ? (
            <Button
              variant="outline"
              className="w-fit hover:border-primary/90 hover:text-primary/90 text-blue-800 border-blue-800 border px-4 transition-all duration-300"
              onClick={() => setCurrentStep((currentStep + 1) as 1 | 2 | 3)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-fit hover:border-primary/90 hover:text-primary/90 text-blue-800 border-blue-800 border px-4 transition-all duration-300"
              onClick={() => {
                explicitCloseRef.current = true;
                setCurrentStep(1);
                onOpenChange(false);
              }}
            >
              Resume
            </Button>
          )}
        </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
