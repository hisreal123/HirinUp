'use client';

import { Check, XCircle, Megaphone } from 'lucide-react';
import { AudioCheckStatus } from '@/hooks/useAudioDetection';

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

interface BrowserDeviceCheckProps {
  audioCheckStatus: AudioCheckStatus;
}

export function BrowserDeviceCheck({
  audioCheckStatus,
}: BrowserDeviceCheckProps) {
  return (
    <div className="space-y-4 py-2 border border-gray-200 rounded-md p-2 shadow-sm">
      <span className="font-bold flex justify-center text-lg text-slate-800">
        Step 1: Browser & Device Checks
      </span>
      <div className="border-b-2 border-slate-700 pb-2" />

      <div className="text-sm text-gray-500">
        <p className="font-medium text-slate-700 italic mt-4 text-sm">
          <Megaphone className="mr-1 text-sm text-gray-600 inline-block" />
          Please check that the correct microphone is selected and not muted.{' '}
          <br /> You should see the audio bar moving when you speak.
        </p>
      </div>

      {/* Status Checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Live Checklist</h4>
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
                <span className="font-bold text-green-600">Detected</span>
              ) : (
                <span className="font-bold text-red-600">Not Detected</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
