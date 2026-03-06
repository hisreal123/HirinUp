'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mic,
  RefreshCw,
  Check,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  CircleDot,
  Router,
  Copy,
  Megaphone,
} from 'lucide-react';
import { AudioCheckStatus } from '@/hooks/useAudioDetection';
import { useRef } from 'react';
import { toast } from 'sonner';

const siteDomain =
  process.env.NEXT_PUBLIC_SITE_DOMAIN || 'interview.yourdomain.com';

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
        <Check className="h-4 w-4 text-gray-300" />
      </span>
    </div>
  ) : (
    <div className="px-2 py-1 rounded-md flex items-center space-x-2">
      <span className="bg-red-600 rounded-md p-1">
        <XCircle className="h-4 w-4 text-white" />
      </span>
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
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg  w-full font-semibold">
            <div className="flex items-center justify-center text-slate-700">
              {currentStep === 1 ? (
                <span className="font-bold text-lg text-slate-700">
                  Step 1: Browser & Device Checks
                </span>
              ) : currentStep === 2 ? (
                <span className="font-bold text-lg text-slate-700">
                  Step 2: Advanced Network Diagnostics
                </span>
              ) : (
                <span className="font-bold text-lg text-slate-700">
                  Step 3: OS-Level Checks
                </span>
              )}
            </div>
          </AlertDialogTitle>
          <div className="border-b-2 border-slate-700 pb-2" />
        </AlertDialogHeader>

        <div className="px-4">
          {currentStep === 1 ? (
            <div className="space-y-4 py-4 border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-slate-700 italic mt-4 text-sm">
                  <Megaphone className="mr-1 text-sm text-gray-600 inline-block" />
                  Please check that the correct microphone is selected and not
                  muted. <br /> You should see the audio bar moving when you
                  speak.
                </p>
              </div>

              {/* Status Checklist */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Live Checklist
                </h4>
                <div className="space-y-2 text-sm border border-gray-200 rounded-md p-1">
                  <div className="flex items-center gap-2 w-full relative">
                    <div className="flex items-center space-x-2">
                      {audioCheckStatus.microphonePermission === true &&
                      audioCheckStatus.audioLevelDetected === true ? (
                        <StatusIcon status={true} />
                      ) : (
                        <StatusIcon status={false} />
                      )}
                    </div>
                    <span>Microphone permission granted</span>
                  </div>

                  {/* seperator */}
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex items-center gap-2 w-full relative">
                    <div className="flex items-center space-x-2">
                      {audioCheckStatus.browserCompatible === true ? (
                        <StatusIcon status={true} />
                      ) : (
                        <StatusIcon status={false} />
                      )}
                    </div>
                    <span>Browser compatible</span>
                  </div>

                  {/* seperator */}
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex items-center gap-2 w-full relative">
                    <div className="flex items-center space-x-2">
                      {audioCheckStatus.deviceSelected === true ? (
                        <StatusIcon status={true} />
                      ) : (
                        <StatusIcon status={false} />
                      )}
                    </div>
                    <span>Audio device available</span>
                  </div>

                  {/* seperator */}
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex items-center gap-2 w-full relative">
                    <div className="flex items-center space-x-2">
                      {audioCheckStatus.audioLevelDetected === true ? (
                        <StatusIcon status={true} />
                      ) : (
                        <StatusIcon status={false} />
                      )}
                    </div>
                    <span>
                      Audio level:{' '}
                      {audioCheckStatus.audioLevelDetected === true ? (
                        <span className="font-bold text-green-600">
                          Detected
                        </span>
                      ) : (
                        <span className="font-bold text-red-600">
                          Not Detected
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : currentStep === 2 ? (
            <div className="space-y-4 py-4 border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-slate-700 italic mt-4 text-sm">
                  <Megaphone className="mr-1 text-sm text-gray-600 inline-block" />
                  "if you&lsquo;d like, we can run a couple of optional
                  connectivity checks. <br /> These do not change your system."
                </p>
              </div>

              {/* Network Diagnostics Checklist */}
              {/* Seperator */}
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-700">
                  Please Copy and Paste the following command
                </span>

                <div className="space-y-1 border shadow-sm border-gray-200 rounded-md p-2">
                  <h4 className="text-sm font-normal text-gray-900 border-b flex items-center space-x-2">
                    <CircleDot className="mr-2 h-4 w-4 text-slate-500" />
                    Ping Test
                  </h4>
                  <div className="text-gray-600 h-fit  mt-2 bg-[#1b1f230d] overflow-x-auto pt-2 relative rounded">
                    <pre className="w-full">
                      <code className="cursor-text pl-1 pr-4 whitespace-nowrap text-sm">
                        {siteDomain}
                      </code>
                    </pre>
                    <button
                      className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(`ping ${siteDomain}`);
                        toast.success('Link has been copied');
                      }}
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 border shadow-sm border-gray-200 rounded-md p-2">
                  <h4 className="text-sm font-normal text-gray-900 border-b flex items-center space-x-2">
                    <Router className="h-4 w-4 text-slate-500 mr-2" />
                    DNS Test
                  </h4>
                  <div className="text-gray-600 h-fit mt-2 bg-[#1b1f230d] overflow-x-auto pt-3 relative rounded">
                    <pre className="w-full">
                      <code className="cursor-text pl-1 pr-4 whitespace-nowrap text-sm">
                        {siteDomain}
                      </code>
                    </pre>
                    <button
                      className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(`nslookup ${siteDomain}`);
                        toast.success('Link has been copied');
                      }}
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              {/* seperator line */}
              <div className="h-px bg-gray-200 my-2" />
            </div>
          ) : (
            <div className="space-y-4 py-4 border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-slate-700 italic mt-4 text-sm">
                  <Megaphone className="mr-1 text-sm text-gray-600 inline-block" />
                  "Your browser settings look fine, This is often caused by a
                  network <br /> issue or another application using the
                  microphone"
                </p>
              </div>

              {/* OS-Level Checks */}
              {/* Seperator */}
              <div className="h-px bg-gray-200 my-2" />

              <div className="flex items-center gap-2">
                <ul className="list-disc list-inside flex flex-col space-y-4 text-gray-800 font-medium">
                  <li>Another application may be using the microphone</li>
                  <li>OS micophone privacy settings may block access</li>
                  <li>Device driver or audio route issue may be present</li>
                </ul>
              </div>
              <div className="h-px bg-gray-200 my-2" />
            </div>
          )}

          <div className="flex justify-end items-center mt-4">
            {currentStep < 3 ? (
              <Button
                variant="outline"
                className="group w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-4 transition-all duration-300 flex items-center"
                onClick={() => setCurrentStep((currentStep + 1) as 1 | 2 | 3)}
              >
                Next
                {/* <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-5 group-hover:ml-2">
                  <ArrowRight className="h-4 w-4" />
                </span> */}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="group w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-4 transition-all duration-300 flex items-center"
                onClick={() => {
                  explicitCloseRef.current = true;
                  setCurrentStep(1);
                  onOpenChange(false);
                }}
              >
                Resume
                {/* <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-5 group-hover:ml-2">
                  <ArrowRight className="h-4 w-4" />
                </span> */}
              </Button>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
