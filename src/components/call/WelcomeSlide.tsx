'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Interview } from '@/types/interview';
import { ArrowLeft, Info } from 'lucide-react';

interface WelcomeSlideProps {
  interview: Interview;
  loading: boolean;
  onProceed: () => void;
  onExit: () => void;
}

type WelcomeStep = 'description' | 'guidelines';

export function WelcomeSlide({
  interview,
  loading,
  onProceed,
  onExit,
}: WelcomeSlideProps) {
  const [step, setStep] = useState<WelcomeStep>('description');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const handleProceed = () => {
    if (step === 'description') {
      setDirection('forward');
      setStep('guidelines');
    } else {
      onProceed();
    }
  };

  const handleBack = () => {
    setDirection('back');
    setStep('description');
  };

  const descriptionAnimation =
    direction === 'back'
      ? 'animate-in fade-in slide-in-from-left-4 duration-300'
      : 'animate-in fade-in duration-300';
  const guidelinesAnimation =
    direction === 'forward'
      ? 'animate-in fade-in slide-in-from-right-4 duration-300'
      : 'animate-in fade-in duration-300';

  return (
    <div className="relative w-[80%] mx-auto mt-2 h-full p-2 m-2 bg-slate-50 rounded-md shadow-md">
      <div>
        {interview?.logo_url && (
          <div className="p-1 flex justify-center">
            <Image
              src={interview?.logo_url}
              alt="Logo"
              className="h-10 w-auto"
              width={100}
              height={100}
            />
          </div>
        )}

        <div className="p-2 font-normal overflow-hidden relative h-fit text-sm w-[80%] mx-auto mb-4 whitespace-pre-line min-h-[120px]">
          {/* Slide 1: Description */}
          {step === 'description' && (
            <div key="description" className={`mb-5 ${descriptionAnimation}`}>
              {interview?.description}
            </div>
          )}

          {/* Slide 2: Interview Guidelines */}
          {step === 'guidelines' && (
            <div
              key="guidelines"
              className={`text-sm text-gray-800 ${guidelinesAnimation}`}
            >
              <span className="flex items-center gap-2 font-bold text-lg font-normal mt-1 mb-2">
                <Info
                  className="h-5 w-5 text-gray-500 flex-shrink-0"
                  aria-hidden
                />
                Interview Guidelines
              </span>
              <ul className="list-disc list-inside space-y-3 font-normal text-md">
                <li className="font-bold">
                  Please do not refresh or close this page during the interview.
                  <span className="block font-normal text-md mt-1 ml-5">
                    Exiting the session may permanently terminate your
                    assessment and require rescheduling.
                  </span>
                </li>
                <li className="font-bold mt-2 mb-2">
                  Ensure your audio settings are properly configured.
                  <span className="block font-normal text-md mt-1 ml-5">
                    {' '}
                    Confirm your volume is turned on and grant microphone access
                    when prompted. We recommend completing <br /> the interview
                    in a quiet, distraction-free environment.
                  </span>
                </li>
                <li className="font-bold">
                  Session activity is monitored for integrity purposes.
                  <span className="block font-normal text-md mt-1 ml-5">
                    Tab switching and page navigation may be recorded to ensure
                    assessment compliance.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle gap-2">
        {step === 'guidelines' && (
          <Button
            type="button"
            variant="outline"
            className="font-normal rounded-lg flex flex-row justify-center mb-8 px-4 h-10 gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          className="font-normal rounded-lg flex flex-row justify-center mb-8 px-4 h-10"
          disabled={loading}
          onClick={handleProceed}
        >
          Proceed
        </Button>
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-secondary hover:bg-secondary/90 text-white"
                onClick={onExit}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
