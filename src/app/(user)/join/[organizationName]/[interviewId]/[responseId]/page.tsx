'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDevToolsDetection } from '@/hooks/useDevToolsDetection';
import { DevToolsBlocker } from '@/components/call/DevToolsBlocker';
import Call from '@/components/call';
import Image from 'next/image';
import { Interview } from '@/types/interview';
import LoaderWithText from '@/components/loaders/loader-with-text/loaderWithText';
import { ResponseService } from '@/services/responses.service';
import { encryptedApiCall } from '@/lib/encrypted-api';

type PopupProps = {
  title: string;
  description: string;
  image: string;
};

function PopupLoader() {
  return (
    <div className="bg-background rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-border font-bold transition-all md:block">
        <div className="relative flex flex-col items-center justify-center h-full">
          <LoaderWithText />
        </div>
      </div>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="bg-background rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] content-center rounded-lg shadow-md font-bold transition-all md:block">
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
    </div>
  );
}

function InterviewInterface() {
  const { isDevToolsOpen } = useDevToolsDetection();

  // Use useParams hook for client components (Next.js 16 compatible)
  const params = useParams();
  const router = useRouter();
  const organizationName = params?.organizationName as string;
  const interviewId = params?.interviewId as string;
  const responseId = params?.responseId as string;

  const [interview, setInterview] = useState<Interview>();
  const [isActive, setIsActive] = useState(true);
  // const { getInterviewById } = useInterviews();
  const [interviewNotFound, setInterviewNotFound] = useState(false);
  const [responseNotFound, setResponseNotFound] = useState(false);
  const [organizationNotFound, setOrganizationNotFound] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expirationChecked, setExpirationChecked] = useState(false);
  const [isTwoFlow, setIsTwoFlow] = useState(false);
  const [initialCallPhase, setInitialCallPhase] = useState<
    'first_call' | 'verification_modal' | 'second_call'
  >('first_call');
  const [orgDisplayName, setOrgDisplayName] = useState<string>('');

  useEffect(() => {
    if (interview) {
      setIsActive(interview?.is_active === true);
    }
  }, [interview, interviewId]);

  // PRIORITY: Early expiration check + call flow state check + isLoaded logging
  // This prevents users from seeing interview details or candidate form if link is expired
  // Also determines which call phase to resume from on refresh
  useEffect(() => {
    if (!responseId) {
      return;
    }

    const checkExpiration = async () => {
      setIsValidating(true);

      try {
        const response = await encryptedApiCall('/api/get-response', {
          token: responseId,
        });
        if (response && response.is_ended === true) {
          setIsExpired(true);
          setExpirationChecked(true);
          setIsValidating(false);

          return;
        }

        // Read is_two_flow from response record
        setIsTwoFlow(response?.is_two_flow === true);

        // DB is source of truth - localStorage is just a cache
        const dbFlowState =
          (response?.call_flow_state as Record<string, string>) || {};

        // Always sync localStorage from DB (clear if DB is empty, update if DB has data)
        try {
          if (Object.keys(dbFlowState).length > 0) {
            localStorage.setItem(
              `call_flow_state_${responseId}`,
              JSON.stringify(dbFlowState)
            );
          } else {
            // DB is empty (new response) - clear ALL stale localStorage for this response
            localStorage.removeItem(`call_flow_state_${responseId}`);
            localStorage.removeItem(`candidate_name_${responseId}`);
          }
        } catch (e) {
          // ignore localStorage errors
        }

        // Use DB state as the source of truth
        const flowState = dbFlowState;

        if (flowState.second_call_completed) {
          // All done — treat as expired
          setIsExpired(true);
          setExpirationChecked(true);
          setIsValidating(false);

          return;
        } else if (flowState.second_call_started) {
          // Second call was in progress — resume it from the second call phase
          setInitialCallPhase('second_call');
        } else if (flowState.modal_closed) {
          // Modal was closed but second call not yet started — resume from second call
          setInitialCallPhase('second_call');
        } else if (flowState.first_call_started) {
          // First call done, show modal directly
          setInitialCallPhase('verification_modal');
        }

        // Log isLoaded to DB first (DB is source of truth), then sync to localStorage
        if (!flowState.is_loaded) {
          const isLoadedTs = new Date().toISOString();
          const updatedState = { ...dbFlowState, is_loaded: isLoadedTs };

          // Write to DB first
          await ResponseService.updateResponseByToken(
            { call_flow_state: updatedState },
            responseId
          );

          // Then sync localStorage from updated DB state
          try {
            localStorage.setItem(
              `call_flow_state_${responseId}`,
              JSON.stringify(updatedState)
            );
          } catch (e) {
            // ignore localStorage errors
          }
        }

        setExpirationChecked(true);
        setIsValidating(false);
      } catch (error) {
        console.error('Error checking expiration:', error);
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

    let cancelled = false;

    const validateAll = async () => {
      if (cancelled) {
        return;
      }
      setIsValidating(true);
      setValidationError(null);

      try {
        // Step 1: Validate Response exists and belongs to interview
        const response = await encryptedApiCall('/api/get-response', {
          token: responseId,
        });

        if (cancelled) {
          return;
        }

        if (!response) {
          console.error('Response not found for token:', responseId);
          setValidationError('Response not found');
          setResponseNotFound(true);
          setIsValidating(false);

          return;
        }

        // Compare with actual interview.id (not the interviewId from URL)
        if (response.interview_id !== interview.id) {
          console.error('Response interview_id mismatch:', {
            responseInterviewId: response.interview_id,
            expectedInterviewId: interview.id,
            urlInterviewId: interviewId,
          });
          setValidationError('Response does not belong to this interview');
          setResponseNotFound(true);
          setIsValidating(false);

          return;
        }

        // Double-check expiration (in case early check didn't catch it)
        if (response.is_ended === true) {
          setIsExpired(true);
          setIsValidating(false);

          return;
        }

        // Step 2: Validate Organization exists and matches URL
        if (!interview.organization_id) {
          console.error('Interview has no organization_id');
          setValidationError('Interview organization not found');
          setOrganizationNotFound(true);
          setIsValidating(false);

          return;
        }

        // Retry up to 2 times for transient network/server errors.
        // Only treat a genuine 404 "Organization not found" as unregistered —
        // a network blip or 500 should not permanently block the candidate.
        let organization = null;
        let orgFetchError: Error | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            organization = await encryptedApiCall('/api/get-organization', {
              id: interview.organization_id,
            });
            orgFetchError = null;
            break;
          } catch (err: any) {
            orgFetchError = err;
            const isNotFound =
              err?.message === 'Organization not found' ||
              err?.message?.includes('404');
            if (isNotFound) {
              break; // Genuine 404 — no point retrying
            }
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
            }
          }
        }

        if (cancelled) {
          return;
        }

        if (!organization) {
          const isNotFound =
            orgFetchError?.message === 'Organization not found' ||
            orgFetchError?.message?.includes('404');
          console.error('Organization fetch failed:', orgFetchError?.message);
          setValidationError(
            isNotFound
              ? 'Organization not registered'
              : 'Could not verify organization. Please refresh and try again.'
          );
          setOrganizationNotFound(true);
          setIsValidating(false);

          return;
        }

        // Validate organization name matches URL (normalize for comparison)
        const orgNameSlug = organization.name
          ?.toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        if (
          orgNameSlug !== organizationName &&
          !organizationName?.startsWith(orgNameSlug)
        ) {
          console.error('Organization name mismatch:', {
            urlOrgName: organizationName,
            dbOrgName: orgNameSlug,
            actualOrgName: organization.name,
          });
          setValidationError('Organization name does not match');
          setOrganizationNotFound(true);
          setIsValidating(false);

          return;
        }

        if (!cancelled) {
          setOrgDisplayName(organization.name || '');
          setIsValidating(false);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error('Error during validation:', error);
        setValidationError('Validation error occurred, Kindly Refresh');
        setIsValidating(false);
        setResponseNotFound(true);
      }
    };

    validateAll();

    return () => {
      cancelled = true;
    };
  }, [
    responseId,
    interview,
    organizationName,
    interviewId,
    expirationChecked,
    isExpired,
  ]);

  useEffect(() => {
    if (!interviewId || !expirationChecked || isExpired) {
      return;
    }

    const fetchinterview = async () => {
      try {
        const response = await encryptedApiCall<Interview>(
          '/api/get-interview',
          { id: interviewId }
        );
        if (response) {
          setInterview(response);
          document.title = `AI Recruiter for Voice Interviews - ${response.name ? response.name.charAt(0).toUpperCase() + response.name.slice(1) : ''}`;
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
  if (
    responseNotFound ||
    organizationNotFound ||
    interviewNotFound ||
    validationError
  ) {
    return (
      <div>
        <div className="hidden md:block p-8 mx-auto form-container">
          <PopUpMessage
            title="Page Not Found"
            description={
              validationError ||
              `<span class="text-center">The link you're trying to access is invalid or has expired.<br>Kindly check the URL, refresh and try again.</span>`
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
      {/* {isDevToolsOpen && <DevToolsBlocker />} */}
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
          <Call
            interview={interview}
            responseToken={responseId}
            initialCallPhase={initialCallPhase}
            isTwoFlow={isTwoFlow}
            organizationName={orgDisplayName}
          />
        )}
      </div>
    </div>
  );
}

export default InterviewInterface;
