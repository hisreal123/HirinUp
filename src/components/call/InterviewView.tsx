'use client';

import React, { memo } from 'react';
import Image from 'next/image';

interface InterviewViewProps {
  lastInterviewerResponse: string;
  lastUserResponse: string;
  activeTurn: string;
  interviewerImg: string;
  lastUserResponseRef: React.RefObject<HTMLDivElement>;
}

export const InterviewView = memo(function InterviewView({
  lastInterviewerResponse,
  lastUserResponse,
  activeTurn,
  interviewerImg,
  lastUserResponseRef,
}: InterviewViewProps) {
  return (
    <>
      <div className="flex flex-row p-2 items-stretch h-[480px]">
        {/* Interviewer column */}
        <div className="w-[50%] flex flex-col py-4 px-3 h-full">
          {/* Avatar — top-left */}
          <div className="flex flex-col items-start mb-3 flex-shrink-0">
            {interviewerImg ? (
              <Image
                src={interviewerImg}
                alt="Image of the interviewer"
                width={100}
                height={100}
                className={`object-cover object-center rounded-full ${
                  activeTurn === 'agent' ? 'border-4 border-primary' : ''
                }`}
              />
            ) : (
              <div
                className={`w-[100px] h-[100px] rounded-full bg-gray-200 flex items-center justify-center ${
                  activeTurn === 'agent' ? 'border-4 border-primary' : ''
                }`}
              >
                <span className="text-gray-500 text-xs">No Image</span>
              </div>
            )}
            <div className="font-semibold mt-1 text-sm">AI Interviewer</div>
          </div>
          {/* Scrollable response text */}
          <div className="w-full flex-1 overflow-y-auto text-base lg:text-lg text-left leading-relaxed font-normal">
            {lastInterviewerResponse}
          </div>
        </div>
        <div className="w-px bg-gray-200 self-stretch" />

        {/* Candidate column */}
        <div className="w-[50%] flex flex-col py-4 px-3">
          {/* Avatar — top-right */}
          <div className="flex justify-end mb-3 flex-shrink-0">
            <div className="flex flex-col items-center">
              <Image
                src={`/user-icon.png`}
                alt="Picture of the user"
                width={100}
                height={100}
                className={`object-cover object-center rounded-full ${
                  activeTurn === 'user' ? 'border-4 border-primary' : ''
                }`}
              />
              <div className="font-semibold mt-1 text-sm">You</div>
            </div>
          </div>
          <div
            ref={lastUserResponseRef} 
            className="w-full flex-1 overflow-y-auto text-base lg:text-lg text-left leading-relaxed font-normal"
          >
            {lastUserResponse}
          </div>
        </div>
      </div>
    </>
  );
});
