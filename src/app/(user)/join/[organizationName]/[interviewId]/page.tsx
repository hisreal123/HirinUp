"use client";

import { useInterviews } from "@/contexts/interviews.context";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowUpRightSquareIcon } from "lucide-react";
import { Interview } from "@/types/interview";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import axios from "axios";

type PopupProps = {
  title: string;
  description: string;
  image: string;
};

function PopupLoader() {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all md:block dark:border-white">
        <div className="relative flex flex-col items-center justify-center h-full">
          <LoaderWithText />
        </div>
      </div>
      <a
        className="flex flex-row justify-center align-middle mt-3"
          href="https://hirin-up.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="text-center text-md font-semibold mr-2">
          Powered by{" "}
          <span className="font-bold">
            Hirin<span className="text-indigo-600">Up</span>
          </span>
        </div>
        <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
      </a>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] content-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all  md:block dark:border-white ">
        <div className="flex flex-col items-center justify-center my-auto">
          <Image
            src={image}
            alt="Graphic"
            width={200}
            height={200}
            className="mb-4"
          />
          <h1 className="text-md font-medium mb-2">{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <a
        className="flex flex-row justify-center align-middle mt-3"
          href="https://hirin-up.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="text-center text-md font-semibold mr-2">
          Powered by{" "}
          <span className="font-bold">
            Hirin<span className="text-indigo-600">Up</span>
          </span>
        </div>
        <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
      </a>
    </div>
  );
}

/**
 * Landing page that generates a response_id and redirects to the call page
 * This allows us to track each candidate with a unique response_id
 */
function InterviewLanding() {
  const params = useParams();
  const router = useRouter();
  const organizationName = params?.organizationName as string;
  const interviewId = params?.interviewId as string;

  const [interview, setInterview] = useState<Interview>();
  const [isActive, setIsActive] = useState(true);
  const { getInterviewById } = useInterviews();
  const [interviewNotFound, setInterviewNotFound] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interview) {
      setIsActive(interview?.is_active === true);
    }
  }, [interview, interviewId]);

  useEffect(() => {
    if (!interviewId) {
      setInterviewNotFound(true);
      return;
    }

    const fetchinterview = async () => {
      try {
        const response = await getInterviewById(interviewId);
        if (response) {
          setInterview(response);
          document.title = response.name;
        } else {
          setInterviewNotFound(true);
        }
      } catch (error) {
        console.error(error);
        setInterviewNotFound(true);
      }
    };

    fetchinterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Generate response_id and redirect when interview is loaded
  useEffect(() => {
    if (!interview || !isActive || isGenerating) return;

    const generateResponseAndRedirect = async () => {
      setIsGenerating(true);
      try {
        // Create response record early (before call starts)
        const response = await axios.post("/api/create-response", {
          interview_id: interview.id,
          // email and name can be added later when user provides them
        });

        if (response.data?.response_id) {
          // Redirect to call page with response_id
          router.push(`/join/${organizationName}/${interviewId}/${response.data.response_id}`);
        } else {
          setError("Failed to generate response link. Please try again.");
          setIsGenerating(false);
        }
      } catch (err: any) {
        console.error("Error generating response:", err);
        setError(
          err.response?.data?.error ||
            "Failed to generate response link. Please try again.",
        );
        setIsGenerating(false);
      }
    };

    generateResponseAndRedirect();
  }, [interview, isActive, organizationName, interviewId, router, isGenerating]);

  if (error) {
    return (
      <div>
        <div className="hidden md:block p-8 mx-auto form-container">
          <PopUpMessage
            title="Error"
            description={error}
            image="/invalid-url.png"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden md:block p-8 mx-auto form-container">
        {!interview ? (
          interviewNotFound ? (
            <PopUpMessage
              title="Invalid URL"
              description="The interview link you're trying to access is invalid. Please check the URL and try again."
              image="/invalid-url.png"
            />
          ) : (
            <PopupLoader />
          )
        ) : !isActive ? (
          <PopUpMessage
            title="Interview Is Unavailable"
            description="We are not currently accepting responses. Please contact the sender for more information."
            image="/closed.png"
          />
        ) : (
          <PopupLoader />
        )}
      </div>
    </div>
  );
}

export default InterviewLanding;

