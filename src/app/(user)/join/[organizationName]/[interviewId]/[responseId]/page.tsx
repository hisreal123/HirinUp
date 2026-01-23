"use client";

import { useInterviews } from "@/contexts/interviews.context";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Call from "@/components/call";
import Image from "next/image";
import { ArrowUpRightSquareIcon } from "lucide-react";
import { Interview } from "@/types/interview";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { ResponseService } from "@/services/responses.service";
import { OrganizationService } from "@/services/organizations.service";

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
      <div className="h-[88vh] content-center rounded-lg shadow-md font-bold transition-all  md:block dark:border-white ">
        <div className="flex flex-col items-center justify-center my-auto">
          <Image
            src={image}
            alt="Graphic"
            width={200}
            height={200}
            className="mb-4"
          />
          <h1 className="text-md font-normal mb-2">{title}</h1>
          <p dangerouslySetInnerHTML={{ __html: description }} />
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

function InterviewInterface() {
  // Use useParams hook for client components (Next.js 16 compatible)
  const params = useParams();
  const router = useRouter();
  const organizationName = params?.organizationName as string;
  const interviewId = params?.interviewId as string;
  const responseId = params?.responseId as string;

  const [interview, setInterview] = useState<Interview>();
  const [isActive, setIsActive] = useState(true);
  const { getInterviewById } = useInterviews();
  const [interviewNotFound, setInterviewNotFound] = useState(false);
  const [responseNotFound, setResponseNotFound] = useState(false);
  const [organizationNotFound, setOrganizationNotFound] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expirationChecked, setExpirationChecked] = useState(false);

  useEffect(() => {
    if (interview) {
      setIsActive(interview?.is_active === true);
    }
  }, [interview, interviewId]);

  // PRIORITY: Early expiration check - MUST happen FIRST before anything else
  // This prevents users from seeing interview details or candidate form if link is expired
  useEffect(() => {
    if (!responseId) {
      return;
    }

    const checkExpiration = async () => {
      setIsValidating(true);
      try {
        const response = await ResponseService.getResponseByToken(responseId);
        if (response && response.is_ended === true) {
          console.log("Link expired - response has ended");
          setIsExpired(true);
          setExpirationChecked(true);
          setIsValidating(false);
          return;
        }
        // If not expired, mark as checked and allow other operations to proceed
        setExpirationChecked(true);
        setIsValidating(false);
      } catch (error) {
        console.error("Error checking expiration:", error);
        // On error, assume not expired to allow normal flow (will be caught in validation)
        setExpirationChecked(true);
        setIsValidating(false);
      }
    };

    checkExpiration();
  }, [responseId]);

  // Comprehensive validation: Check interview, response, and organization
  // Only runs AFTER expiration check passes
  useEffect(() => {
    if (!responseId || !interview || !expirationChecked) {
      // Wait for expiration check, responseId, and interview to be loaded
      return;
    }

    // Skip validation if already expired
    if (isExpired) {
      return;
    }

    const validateAll = async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        console.log("Starting comprehensive validation...");
        console.log("Organization Name (from URL):", organizationName);
        console.log("Interview ID (from URL):", interviewId);
        console.log("Response ID (token):", responseId);
        console.log("Interview data:", interview);

        // Step 1: Validate Response exists and belongs to interview
        console.log("Step 1: Validating response...");
        const response = await ResponseService.getResponseByToken(responseId);
        
        if (!response) {
          console.error("Response not found for token:", responseId);
          setValidationError("Response not found");
          setResponseNotFound(true);
          setIsValidating(false);
          return;
        }
        
        // Compare with actual interview.id (not the interviewId from URL)
        if (response.interview_id !== interview.id) {
          console.error("Response interview_id mismatch:", {
            responseInterviewId: response.interview_id,
            expectedInterviewId: interview.id,
            urlInterviewId: interviewId
          });
          setValidationError("Response does not belong to this interview");
          setResponseNotFound(true);
          setIsValidating(false);
          return;
        }
        
        // Double-check expiration (in case early check didn't catch it)
        if (response.is_ended === true) {
          console.log("Response has ended - link expired");
          setIsExpired(true);
          setIsValidating(false);
          return;
        }
        
        console.log("✓ Response validation passed");

        // Step 2: Validate Organization exists and matches URL
        console.log("Step 2: Validating organization...");
        if (!interview.organization_id) {
          console.error("Interview has no organization_id");
          setValidationError("Interview organization not found");
          setOrganizationNotFound(true);
          setIsValidating(false);
          return;
        }

        const organization = await OrganizationService.getOrganizationById(
          interview.organization_id
        );

        if (!organization) {
          console.error("Organization not found:", interview.organization_id);
          setValidationError("Organization not registered");
          setOrganizationNotFound(true);
          setIsValidating(false);
          return;
        }

        // Validate organization name matches URL (normalize for comparison)
        const orgNameSlug = organization.name
          ?.toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        
        if (orgNameSlug !== organizationName) {
          console.error("Organization name mismatch:", {
            urlOrgName: organizationName,
            dbOrgName: orgNameSlug,
            actualOrgName: organization.name
          });
          setValidationError("Organization name does not match");
          setOrganizationNotFound(true);
          setIsValidating(false);
          return;
        }

        console.log("✓ Organization validation passed");
        console.log("Organization name:", organization.name);

   
        setIsValidating(false);
      } catch (error) {
        console.error("Error during validation:", error);
        setValidationError("Validation error occurred");
        setIsValidating(false);
        // Set appropriate error state
        setResponseNotFound(true);
      }
    };

    validateAll();
  }, [responseId, interview, organizationName, interviewId, expirationChecked, isExpired]);

  // Only fetch interview AFTER expiration check passes
  useEffect(() => {
    if (!interviewId || !expirationChecked || isExpired) {
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
  }, [interviewId, expirationChecked, isExpired]);

  // Show expired link message if response has ended
  if (isExpired) {
    return (
      <div>
        <div className="hidden md:block p-8 mx-auto form-container">
          <PopUpMessage
            title="Link Expired"
            description="This interview link has expired or has already been completed. <br/> Please contact the sender for a new link if needed."
            image="/invalid-url.png"
          />
        </div>
      </div>
    );
  }

  // Show 404/error page if validation fails
  if (responseNotFound || organizationNotFound || interviewNotFound || validationError) {
    return (
      <div>
        <div className="hidden md:block p-8 mx-auto form-container">
          <PopUpMessage
            title="Page Not Found"
            description={
              validationError ||
              "The link you're trying to access is invalid or has expired. <br/> Please check the URL and try again."
            }
            image="/invalid-url.png"
          />
        </div>
      </div>
    );
  }

  // Show loader while validating
  if (isValidating) {
    return (
      <div>
        <div className="hidden md:block p-8 mx-auto form-container">
          <PopupLoader />
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
          <Call interview={interview} responseToken={responseId} />
        )}
      </div>
    </div>
  );
}

export default InterviewInterface;

