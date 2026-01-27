"use client";

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

interface WelcomeSlideProps {
  interview: Interview;
  loading: boolean;
  onProceed: () => void;
  onExit: () => void;
}

export function WelcomeSlide({ interview, loading, onProceed, onExit }: WelcomeSlideProps) {
  return (
    <div className="relative w-[80%] mx-auto mt-2 h-full p-2 m-2 bg-slate-50 rounded-md">
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
          {interview?.description}
          <p className="font-bold text-sm bg-orange-400 rounded-md mt-2 p-2">
            Ensure your volume is up and grant microphone access
            when prompted. Additionally, please make sure you are in a
            quiet environment.
            {"\n\n"}Note: Tab switching will be recorded.
          </p>
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

