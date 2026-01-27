"use client";

import Image from "next/image";

interface InterviewViewProps {
  lastInterviewerResponse: string;
  lastUserResponse: string;
  activeTurn: string;
  interviewerImg: string;
  lastUserResponseRef: React.RefObject<HTMLDivElement>;
}

export function InterviewView({
  lastInterviewerResponse,
  lastUserResponse,
  activeTurn,
  interviewerImg,
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
                {interviewerImg ? (
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
                ) : (
                  <div
                    className={`w-[120px] h-[120px] rounded-full bg-gray-200 flex items-center justify-center mx-auto my-auto ${
                      activeTurn === "agent" ? "border-4 border-primary" : ""
                    }`}
                  >
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
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
    </>
  );
}
