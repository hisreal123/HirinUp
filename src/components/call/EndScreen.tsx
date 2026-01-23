"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircleIcon } from "lucide-react";
import { FeedbackForm } from "./feedbackForm";

interface EndScreenProps {
  isStarted: boolean;
  isFeedbackSubmitted: boolean;
  email: string;
  onFeedbackSubmit: (formData: any) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export function EndScreen({
  isStarted,
  isFeedbackSubmitted,
  email,
  onFeedbackSubmit,
  isDialogOpen,
  setIsDialogOpen,
}: EndScreenProps) {
  return (
    <div className="w-[70%] px-3 mx-auto mt-2 border border-secondary rounded-md p-2 m-2 bg-slate-50 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <div>
        <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
          <CheckCircleIcon className="h-[2rem] w-[70%] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
          <p className="text-lg font-semibold text-center">
            {isStarted
              ? `Thank you for taking the time to participate in this interview`
              : "Thank you very much for considering."}
          </p>
          <p className="text-center">
            {"\n"}
            You can close this tab now.
          </p>
        </div>

        {!isFeedbackSubmitted && (
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger className="w-full flex justify-center">
              <Button
                className="bg-secondary hover:bg-secondary/90 text-white h-10 mt-4 mb-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Provide Feedback
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <FeedbackForm email={email} onSubmit={onFeedbackSubmit} />
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

