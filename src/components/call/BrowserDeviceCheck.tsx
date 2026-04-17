'use client';

import { Check, XCircle, Megaphone } from 'lucide-react';
import { AudioCheckStatus } from '@/hooks/useAudioDetection';

function StatusIcon({ status }: { status: boolean }) {
  return status ? (
    <div className="px-2 py-1 rounded-md flex items-center space-x-2">
      <span className="bg-success rounded-md p-1">
        <Check className="h-4 w-4 text-success-foreground" />
      </span>
    </div>
  ) : (
    <div className="px-2 py-1 rounded-md flex items-center space-x-2">
      <span className="bg-destructive rounded-md p-1">
        <XCircle className="h-4 w-4 text-destructive-foreground" />
      </span>
    </div>
  );
}

interface BrowserDeviceCheckProps {
  audioCheckStatus: AudioCheckStatus;
}

export function BrowserDeviceCheck({
  audioCheckStatus,
}: BrowserDeviceCheckProps) {
  return (
    <div className="space-y-4 py-2 border border-border rounded-md p-2 shadow-sm">
      <span className="font-bold flex justify-center text-lg text-foreground">
        Step 1: Browser & Device Checks
      </span>
      <div className="border-b-2 border-border pb-2" />

      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground italic mt-4 text-sm">
          <Megaphone className="mr-1 text-sm text-muted-foreground inline-block" />
          Please check that the correct microphone is selected and not muted.{' '}
          <br /> You should see the audio bar moving when you speak.
        </p>
      </div>

      {/* Status Checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Live Checklist</h4>
        <div className="space-y-2 text-sm border border-border rounded-md p-1">
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
          <div className="h-px bg-border my-2" />
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
          <div className="h-px bg-border my-2" />
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
          <div className="h-px bg-border my-2" />
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
                <span className="font-bold text-success">Detected</span>
              ) : (
                <span className="font-bold text-destructive">Not Detected</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
