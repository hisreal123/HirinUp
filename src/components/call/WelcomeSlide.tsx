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
import { DescriptionDisplay } from '@/components/ui/DescriptionDisplay';

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
                    Exiting the session may permanently terminate your
                    assessment and require the interview to be rescheduled.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2 font-medium text-gray-700">
                <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
                <span>
                  Ensure your audio settings are properly configured.
                  <span className="block font-normal mt-1 text-gray-500">
                    Please confirm that your volume is enabled and grant
                    microphone access when prompted. We recommend completing the
                    interview in a quiet, distraction-free environment.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2 font-medium text-gray-700">
                <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
                <span>
                  Session activity may be monitored for integrity purposes.
                  <span className="block font-normal mt-1 text-gray-500">
                    Actions such as tab switching or navigating away from the
                    page may be recorded to ensure compliance with the
                    assessment guidelines.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2 font-medium text-gray-700">
                <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
                <span>
                  The use of AI assistants is strictly prohibited.
                  <span className="block font-normal mt-1 text-gray-500">
                    This includes tools such as ChatGPT, Claude, Gemini,
                    Copilot, or any similar AI-based services.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2 font-medium text-gray-700">
                <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
                <span>
                  External resources are not permitted during the interview.
                  <span className="block font-normal mt-1 text-gray-500">
                    Please do not use other websites, personal notes, or seek
                    assistance from others while completing the assessment.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2 font-medium text-gray-700">
                <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-900" />
                <span>
                  Automation tools are not allowed.
                  <span className="block font-normal mt-1 text-gray-500">
                    The use of scripts, browser extensions, or other automated
                    tools to assist with answering questions is strictly
                    prohibited.
                  </span>
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
            <label
              htmlFor="agree-checkbox"
              className="text-sm font-normal text-gray-800 cursor-pointer leading-snug"
            >
              I acknowledge and understand the interview guidelines and confirm
              that I will proceed without the use of external assistance.
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="group w-fit hover:border-primary/90 hover:text-primary/90 text-slate-700 border-slate-700 border px-4 transition-all duration-300 flex items-center bg-transparent hover:bg-transparent text-sm font-medium rounded-md"
              disabled={!agreed}
              onClick={() => {
                if (agreed) onGuidelinesOpenChange(false);
              }}
            >
              Continue
              {/* <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-4 group-hover:ml-1">
                <ArrowRight className="h-4 w-4" />
              </span> */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Welcome slide */}
      <div className="border-t border-gray-200 mx-2 my-2" />
      <div className="relative w-full mt-4 h-fit px-16 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="font-normal overflow-hidden relative h-fit text-sm w-full min-h-[120px]">
          <DescriptionDisplay
            description={interview?.description || ''}
            className="mb-2 animate-in fade-in duration-300"
          />
        </div>
      </div>
      <div className="border-t border-gray-200 mx-2 mb-6" />
      <div className="flex flex-row justify-center items-center gap-2">
        <Button
          className="group h-auto w-[150px] justify-center border border-transparent transition-all duration-300 flex items-center text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/85"
          disabled={loading}
          onClick={onProceed}
        >
          Next
          {/* <span className="w-0 overflow-hidden transition-all duration-300 group-hover:w-4 group-hover:ml-1">
            <ArrowRight className="h-4 w-4" />
          </span> */}
        </Button>
      </div>
    </>
  );
}
