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
import { InterviewEnvironmentCheck } from './InterviewEnvironmentCheck';
import { BrowserDeviceCheck } from './BrowserDeviceCheck';

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
  interviewTitle?: string;
  organizationName?: string;
  onCheckAgain: () => void;
  onOpenChange: (open: boolean) => void;
  onDeviceChange: (deviceId: string) => void;
  onTestMicrophone: () => void;
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
  interviewTitle,
  organizationName,
  onCheckAgain,
  onOpenChange,
  onDeviceChange,
  onTestMicrophone,
}: AudioDetectionModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [environmentAgreed, setEnvironmentAgreed] = useState(false);
  const explicitCloseRef = useRef(false);

  // Reset to step 1 when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCurrentStep(1);
      setEnvironmentAgreed(false);
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
          <AlertDialogTitle className="sr-only">
            {currentStep === 1 ? 'Step 1: Browser & Device Checks' : 'Interview Environment Check'}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div>
          {currentStep === 1 ? (
            <BrowserDeviceCheck audioCheckStatus={audioCheckStatus} />
          ) : (
            <InterviewEnvironmentCheck
              interviewTitle={interviewTitle}
              organizationName={organizationName}
              agreed={environmentAgreed}
              onAgreedChange={setEnvironmentAgreed}
            />
          )}

          <div className="flex justify-end items-center mt-4">
            {currentStep < 2 ? (
              <Button
                variant="outline"
                className="group w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-4 transition-all duration-300 flex items-center"
                onClick={() => setCurrentStep((currentStep + 1) as 1 | 2)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={!environmentAgreed}
                className="group w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-4 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
