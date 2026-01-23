"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { XCircleIcon } from "lucide-react";

interface InterviewViewProps {
  lastInterviewerResponse: string;
  lastUserResponse: string;
  activeTurn: string;
  interviewerImg: string;
  loading: boolean;
  onEndCall: () => void;
  lastUserResponseRef: React.RefObject<HTMLDivElement>;
}

export function InterviewView({
  lastInterviewerResponse,
  lastUserResponse,
  activeTurn,
  interviewerImg,
  loading,
  onEndCall,
  lastUserResponseRef,
}: InterviewViewProps) {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row p-2 grow">
          <div className="border-x-2 border-grey w-[50%] my-auto min-h-[70%]">
            <div className="flex flex-col justify-evenly">
              <div
                className={`text-[22px] w-[80%] md:text-[26px] mt-4 min-h-[250px] mx-auto px-6`}
              >
                {lastInterviewerResponse}
              </div>
              <div className="flex flex-col mx-auto justify-center items-center align-middle">
                <Image
                  src={interviewerImg}
                  alt="Image of the interviewer"
                  width={120}
                  height={120}
                  className={`object-cover object-center mx-auto my-auto ${
                    activeTurn === "agent"
                      ? "border-4 border-primary rounded-full"
                      : ""
                  }`}
                />
                <div className="font-semibold">Interviewer</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-evenly w-[50%]">
            <div
              ref={lastUserResponseRef}
              className={`text-[22px] w-[80%] md:text-[26px] mt-4 mx-auto h-[250px] px-6 overflow-y-auto`}
            >
              {lastUserResponse}
            </div>
            <div className="flex flex-col mx-auto justify-center items-center align-middle">
              <Image
                src={`/user-icon.png`}
                alt="Picture of the user"
                width={120}
                height={120}
                className={`object-cover object-center mx-auto my-auto ${
                  activeTurn === "user"
                    ? "border-4 border-primary rounded-full"
                    : ""
                }`}
              />
              <div className="font-semibold">You</div>
            </div>
          </div>
        </div>
      </div>
      <div className="items-center p-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-white text-black border border-indigo-600 h-10 mx-auto flex flex-row justify-center mb-8"
              disabled={loading}
            >
              End Interview
              <XCircleIcon className="h-[1.5rem] ml-2 w-[1.5rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-red" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This action will end the call.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-indigo-600 hover:bg-indigo-800"
                onClick={onEndCall}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

