'use client';

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
import { ArrowRight, Info } from 'lucide-react';
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
  return (
    <>
      {/* Guidelines modal — auto-opens on page load */}
      <AlertDialog open={guidelinesOpen} onOpenChange={onGuidelinesOpenChange}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <Info
                className="h-5 w-5 text-gray-500 flex-shrink-0"
                aria-hidden
              />
              Interview Guidelines
            </AlertDialogTitle>
          </AlertDialogHeader>
          <ul className="list-disc list-inside space-y-3 text-sm text-gray-800">
            <li className="font-bold">
              Please do not refresh or close this page during the interview.
              <span className="block font-normal mt-1 ml-5">
                Exiting the session may permanently terminate your assessment
                and require rescheduling.
              </span>
            </li>
            <li className="font-bold">
              Ensure your audio settings are properly configured.
              <span className="block font-normal mt-1 ml-5">
                Confirm your volume is turned on and grant microphone access
                when prompted. We recommend completing the interview in a quiet,
                distraction-free environment.
              </span>
            </li>
            <li className="font-bold">
              Session activity is monitored for integrity purposes.
              <span className="block font-normal mt-1 ml-5">
                Tab switching and page navigation may be recorded to ensure
                assessment compliance.
              </span>
            </li>
          </ul>
          <AlertDialogFooter>
            <AlertDialogAction
              className="group flex items-center"
              onClick={() => onGuidelinesOpenChange(false)}
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
      <div className="border-t border-gray-200 mx-1" />
      <div className="relative w-full mt-4 h-fit px-4 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="font-normal overflow-hidden relative h-fit text-sm w-full mb-4 min-h-[120px]">
          <div
            className="mb-5 prose prose-sm max-w-none animate-in fade-in duration-300"
            dangerouslySetInnerHTML={{
              __html: normalizeDescriptionToHtml(interview?.description || ''),
            }}
          />
        </div>

        <div className="w-[50%] flex flex-row justify-start items-center gap-2">
          <Button
            className="group font-normal rounded-lg flex flex-row justify-center mb-8 px-4 h-10"
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
