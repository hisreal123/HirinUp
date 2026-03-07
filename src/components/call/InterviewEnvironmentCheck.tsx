'use client';

import { Check } from 'lucide-react';

interface InterviewEnvironmentCheckProps {
  interviewTitle?: string;
  organizationName?: string;
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
}

export function InterviewEnvironmentCheck({
  interviewTitle,
  organizationName,
  agreed,
  onAgreedChange,
}: InterviewEnvironmentCheckProps) {
  return (
    <div className="space-y-4 rounded-md px-2 pb-2">
      <span className="font-medium flex justify-start text-lg text-slate-800">
        Interview Environment Check
      </span>
      <div className="">
        <p className="text-md text-gray-500">
          Before your <b>{interviewTitle || 'Interview'}</b> begins on{' '}
          <b>{organizationName || 'your company'}</b>,<br /> we run a quick
          veriicaton to keep the interview fair and secure
        </p>
      </div>

      {/* pils */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-200 rounded-md px-3 py-1">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm">Takes ~ 10s</span>
        </div>
        <div className="flex items-center gap-1 bg-gray-200 rounded-md px-3 py-1">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm">No screen recording</span>
        </div>
        <div className="flex items-center gap-1 bg-gray-200 rounded-md px-3 py-1">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm">No files accessed</span>
        </div>
      </div>

      {/* checkbox pill */}
      <div className="border border-gray-200 rounded-md mt-2 flex flex-col">
        <div className="flex items-center gap-2 px-3 relative h-full hover:bg-gray-50 transition-colors py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 p-1">
            <Check className="text-md text-gray-200" />
          </div>
          <span className="text-sm">
            <b>Step 1</b> System & Security Check
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 relative h-full hover:bg-gray-50 transition-colors py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 p-1">
            <span className="font-bold text-gray-200">2</span>
          </div>
          <span className="text-sm">
            <b>Step 2</b> Camera & Audio Setup
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 relative h-full hover:bg-gray-50 transition-colors py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-100 p-1">
            <span className="font-bold text-gray-500">3</span>
          </div>
          <span className="text-sm">
            <b>Step 3</b> Start Interview
          </span>
        </div>
      </div>

      {/* What this verification does */}
      <div>
        <p className="text-sm font-bold text-gray-700 mt-2 mb-3">
          What this verification checks
        </p>

        <div className="ml-4">
          <ul className="text-[0.85rem] list-disc list-inside flex flex-col space-y-2 text-gray-800 font-normal">
            <li>Network integrity (VPN / proxy signals) </li>
            <li>Browser environment authenticity (automation signals) </li>
            <li>
              Virtual camera or voice modification tools (where detectable)
            </li>
            <li>Interfering extensions (ad/script blockers)</li>
          </ul>
        </div>

        {/* <span className="text-sm text-gray-500 mt-3 block">
          if suspicious activity is detected, the session may be flagged for
          review
        </span> */}
      </div>

      {/* What this verification does */}
      <div>
        <p className="text-sm font-bold text-gray-700 mt-2 mb-3">
          Privacy assurance
        </p>

        <div className="ml-4">
          <ul className="text-[0.9rem] list-disc list-inside flex flex-col space-y-2 text-gray-800 font-normal">
            <li>We do not access personal files or folders</li>
            <li>We do not record your screen</li>
            <li>We do not install permanent software</li>
            <li>
              We only collect what&apos;s required for interview compatibility
              and integrity
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3 mt-3">
        <input
          id="environment-agree-checkbox"
          type="checkbox"
          checked={agreed}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
          onChange={(e) => onAgreedChange(e.target.checked)}
        />
        <label
          htmlFor="environment-agree-checkbox"
          className="text-sm text-gray-800 font-normal cursor-pointer leading-snug"
        >
          I understand the rules and agree to proceed without external
          assistance.
        </label>
      </div>
    </div>
  );
}
