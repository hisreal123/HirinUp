'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Interview } from '@/types/interview';
import { ArrowRight, Info, Check } from 'lucide-react';
import { normalizeDescriptionToHtml } from '@/lib/utils';

interface WelcomeSlideProps {
  interview: Interview;
  loading: boolean;
  guidelinesOpen: boolean;
  onGuidelinesOpenChange: (open: boolean) => void;
  onProceed: () => void;
  onExit: () => void;
}

export function WelcomeSlide({
  interview,
  loading,
  guidelinesOpen,
  onGuidelinesOpenChange,
  onProceed,
}: WelcomeSlideProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {/* Guidelines modal — auto-opens on page load */}
      <AlertDialog open={guidelinesOpen} onOpenChange={onGuidelinesOpenChange}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center gap-2 text-lg">
              <Info
                className="h-5 w-5 text-gray-500 flex-shrink-0"
                aria-hidden
              />
              Interview Rules
            </AlertDialogTitle>
          <div className="border-b-2 border-slate-700 pb-2" />
          </AlertDialogHeader>
          <div className="px-4">
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2 font-medium text-gray-700">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
              <span>
                Please do not refresh or close this page during the interview.
                <span className="block font-normal mt-1 text-gray-500">
                  Exiting the session may permanently terminate your assessment
                  and require rescheduling.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2 font-medium text-gray-700">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
              <span>
                Ensure your audio settings are properly configured.
                <span className="block font-normal mt-1 text-gray-500">
                  Confirm your volume is turned on and grant microphone access
                  when prompted. We recommend completing the interview in a quiet,
                  distraction-free environment.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2 font-medium text-gray-700">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
              <span>
                Session activity is monitored for integrity purposes.
                <span className="block font-normal mt-1 text-gray-500">
                  Tab switching and page navigation may be recorded to ensure
                  assessment compliance.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
              <span>
                <span className="font-medium text-gray-700 mr-1">Don&apos;t use AI assistants</span>
                (ChatGPT, Claude, Gemini, Copilot, etc).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
              <span>
                <span className="font-medium text-gray-700 mr-1">Don&apos;t use other websites,</span>
                notes, or help from others
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
              <span>
                <span className="font-medium text-gray-700 mr-1">Don&apos;t use automation</span>
                tools, scripts, or extensions to assist answers.
              </span>
            </li>
          </ul>
          </div>
          <div className="px-4 flex items-start gap-3 mt-2">
            <input
              id="agree-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
            />
            <label htmlFor="agree-checkbox" className="text-sm font-bold text-gray-800 cursor-pointer leading-snug">
              I understand the rules and agree to proceed without external assistance
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="group w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-4 transition-all duration-300 flex items-center bg-transparent hover:bg-transparent text-sm font-medium rounded-md"
              disabled={!agreed}
              onClick={() => { if (agreed) onGuidelinesOpenChange(false); }}
            >
              Continue
              <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-5 group-hover:ml-2">
                <ArrowRight className="h-4 w-4" />
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Welcome slide */}
      <div className="border-t border-gray-200 mx-1 my-6" />
      <div className="relative w-full mt-4 h-fit px-8 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="font-normal overflow-hidden relative h-fit text-sm w-full mb-4 min-h-[120px]">
          <div
            className="mb-5 prose prose-sm max-w-none animate-in fade-in duration-300"
            dangerouslySetInnerHTML={{
              __html: normalizeDescriptionToHtml(interview?.description || ''),
            }}
          />
        </div>
        <div className="border-t border-gray-200 mx-1 my-6" />

        <div className="flex flex-row justify-center items-center gap-2">
          <Button
            className="group h-auto rounded-lg flex flex-row justify-center mb-8 px-16 py-3 text-lg leading-none font-normal text-white hover:bg-primary/85" style={{ fontFamily: 'Montreal, sans-serif', fontWeight: 400 }}
            disabled={loading}
            onClick={onProceed}
          >
            Next
            <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-5 group-hover:ml-2">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
