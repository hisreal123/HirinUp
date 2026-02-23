"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Interview } from "@/types/interview";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface WelcomeSlideProps {
  interview: Interview;
  loading: boolean;
  onProceed: () => void;
  onExit: () => void;
}

export function WelcomeSlide({ interview, loading, onProceed, onExit }: WelcomeSlideProps) {
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);

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
        <div className="p-2 font-normal overflow-hidden relative h-fit text-sm w-[80%] mx-auto mb-4 whitespace-pre-line">
          
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsWarningExpanded((prev) => !prev)}
            onKeyDown={(e) => e.key === "Enter" && setIsWarningExpanded((prev) => !prev)}
            className={`text-sm border-l-4 flex border-red-800 bg-gray-100 text-gray-800 p-3 cursor-pointer select-none ${!isWarningExpanded ? "items-center" : ""}`}
          >
            <span className="block flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-gray-800" />
            </span>

            <div className="ml-4 flex-1 min-w-0">
              {isWarningExpanded ? (
                <>
                  <span className="block font-bold text-lg font-normal mt-1">
                    Warning
                  </span>
                  <span className="block font-normal mt-1">
                    Do not refresh or close this page during the interview. 
                    Doing so will end your session permanently.
                  </span>
                  <span className="block font-normal mt-1">
                    Ensure your volume is up and grant microphone access
                    when prompted. Please make sure you are in a quiet environment.
                  </span>
                  <span className="block font-normal mt-1">
                    Tab switching will be recorded.
                  </span>
                  <span className="inline-flex items-center mt-1 text-xs text-gray-600">
                    <ChevronUp className="h-4 w-4 mr-1" /> Click to collapse
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-normal">
                    Do not refresh or close this page during the interview. Doing so will end your session permanently.
                  </span>
                  <span className="inline-flex items-center mt-1 text-xs text-gray-600">
                    <ChevronDown className="h-4 w-4 mr-1" /> Click to show full warning
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-5">
            {interview?.description}
          </div>
        </div>
      </div>
      <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle gap-2">
        <Button
          className="font-normal rounded-lg flex flex-row justify-center mb-8 px-4 h-10"
          disabled={loading}
          onClick={onProceed}
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

