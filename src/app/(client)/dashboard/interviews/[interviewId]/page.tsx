'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect, useMemo } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useInterviews } from '@/contexts/interviews.context';
import { Share2, Filter, Pencil, UserIcon, Eye, Link2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ResponseService } from '@/services/responses.service';
// import { ClientService } from "@/services/clients.service"; // replaced with encrypted API call
// import { OrganizationService } from "@/services/organizations.service"; // replaced with encrypted API call
import { encryptedApiCall } from '@/lib/encrypted-api';
import { FeedbackService } from '@/services/feedback.service';
import { Interview } from '@/types/interview';
import { Response } from '@/types/response';
import { formatTimestampToDateHHMM } from '@/lib/utils';
import CallInfo from '@/components/call/callInfo';
import SummaryInfo from '@/components/dashboard/interview/summaryInfo';
import { InterviewService } from '@/services/interviews.service';
import EditInterview from '@/components/dashboard/interview/editInterview';
import Modal from '@/components/dashboard/Modal';
import { toast } from 'sonner';
import SharePopup from '@/components/dashboard/interview/sharePopup';
import GenerateLinkModal from '@/components/dashboard/interview/generateLinkModal';
import { useCreateResponse } from '@/hooks/useCreateResponse';
import { useGetAllResponses } from '@/hooks/useGetAllResponses';
import { useGetInterviewById } from '@/hooks/useGetInterviewById';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CandidateStatus } from '@/lib/enum';
import LoaderWithText from '@/components/loaders/loader-with-text/loaderWithText';
import ResponsesTable from '@/components/dashboard/interview/responsesTable';
import LinksTable from '@/components/dashboard/interview/linksTable';
import FeedbackTable from '@/components/dashboard/interview/feedbackTable';

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewHome() {
  // Use hooks for Next.js 16 compatibility
  const params = useParams();
  const searchParams = useSearchParams();
  const interviewId = params?.interviewId as string;
  const callId = searchParams?.get('call') || '';
  const isEditMode = searchParams?.get('edit') === 'true';
  const [interview, setInterview] = useState<Interview>();
  const [responses, setResponses] = useState<Response[]>();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  useInterviews();
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);
  const [sharedGeneratedLink, setSharedGeneratedLink] = useState<string>('');
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] =
    useState<boolean>(false);
  const [isViewed, setIsViewed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { organization } = useOrganization();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [organizationNameSlug, setOrganizationNameSlug] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'details' | 'responses' | 'links' | 'feedback'
  >('details');

  const createResponseMutation = useCreateResponse();
  const {
    data: responsesData,
    isLoading: responsesLoading,
    refetch: refetchResponses,
  } = useGetAllResponses(interviewId, true);

  // Update local state when query data changes
  useEffect(() => {
    if (responsesData) {
      setResponses(responsesData);
    }
  }, [responsesData]);

  const generateAndSetSharedLink = async () => {
    return new Promise<string | null>((resolve) => {
      createResponseMutation.mutate(
        { interview_id: interviewId },
        {
          onSuccess: (data) => {
            if (data?.response_id) {
              const responseId = data.response_id;
              const orgName =
                organizationNameSlug ||
                interview?.readable_slug ||
                'organization';
              const generatedUrl = `${base_url}/join/${orgName}/${interviewId}/${responseId}`;
              setSharedGeneratedLink(generatedUrl);
              // Refetch responses to update the list
              refetchResponses();
              resolve(generatedUrl);
            } else {
              toast.error('Failed to generate link', {
                position: 'bottom-right',
                duration: 3000,
              });
              resolve(null);
            }
          },
          onError: () => {
            toast.error('Failed to generate link', {
              position: 'bottom-right',
              duration: 3000,
            });
            resolve(null);
          },
        }
      );
    });
  };

  const seeInterviewPreviewPage = async () => {
    if (sharedGeneratedLink) {
      window.open(sharedGeneratedLink, '_blank');
    } else {
      // If no shared link exists, generate one first
      const link = await generateAndSetSharedLink();
      if (link) {
        window.open(link, '_blank');
      }
    }
  };

  const {
    data: interviewData,
    isLoading: interviewLoading,
  } = useGetInterviewById(interviewId);

  useEffect(() => {
    if (!interviewData) { return; }
    setInterview(interviewData);
    setIsActive(interviewData.is_active);

    if (interviewData.organization_id) {
      encryptedApiCall('/api/get-organization', { id: interviewData.organization_id })
        .then((orgData: any) => {
          if (orgData?.name) {
            const slug = orgData.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setOrganizationNameSlug(slug);
          }
          if (orgData?.plan) { setCurrentPlan(orgData.plan); }
        })
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewData]);

  useEffect(() => {
    setLoading(interviewLoading || responsesLoading);
  }, [interviewLoading, responsesLoading]);

  useEffect(() => {
    if (!interviewId) {
      return;
    }

    const fetchFeedbacks = async () => {
      try {
        const feedbackData =
          await FeedbackService.getFeedbacksByInterviewId(interviewId);
        setFeedbacks(feedbackData);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const handleDeleteResponse = (deletedCallId: string) => {
    // Refetch responses to get updated list
    refetchResponses();
    if (callId === deletedCallId) {
      router.push(`/dashboard/interviews/${interviewId}`);
    }
  };

  const handleResponseClick = async (response: Response) => {
    try {
      await ResponseService.saveResponse({ is_viewed: true }, response.call_id);
      // Refetch responses to get updated view status
      refetchResponses();
      setIsViewed(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async () => {
    try {
      const updatedIsActive = !isActive;
      setIsActive(updatedIsActive);

      await InterviewService.updateInterview(
        { is_active: updatedIsActive },
        interviewId
      );

      toast.success('Interview status updated', {
        description: `The interview is now ${
          updatedIsActive ? 'active' : 'inactive'
        }.`,
        position: 'bottom-right',
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error('Error', {
        description: 'Failed to update the interview status.',
        duration: 3000,
      });
    }
  };

  const handleCandidateStatusChange = (callId: string, newStatus: string) => {
    // Refetch responses to get updated status
    refetchResponses();
  };

  const openSharePopup = async () => {
    if (sharedGeneratedLink) {
      setShareUrl(sharedGeneratedLink);
      setIsSharePopupOpen(true);
    } else {
      // If no shared link exists, generate one first
      const link = await generateAndSetSharedLink();
      if (link) {
        setShareUrl(link);
        setIsSharePopupOpen(true);
      }
    }
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  // Memoized — only recomputes when responses or filterStatus changes
  const filteredResponses = useMemo(() => {
    if (!responses) {return [];}
    const completed = responses.filter(
      (response) => response.call_id && response.details
    );
    if (filterStatus === 'ALL') {return completed;}
    
return completed.filter(
      (response) => response?.candidate_status === filterStatus
    );
  }, [responses, filterStatus]);

  // Memoized stats — avoids re-filtering on unrelated renders
  const stats = useMemo(() => {
    const totalResponses = responses?.length || 0;
    const totalAnsweredLinks =
      responses?.filter((r) => r.is_ended === true).length || 0;
    const emptyResponses = totalResponses - totalAnsweredLinks;
    const totalFeedbacks = feedbacks?.length || 0;
    const totalLinks = totalResponses;
    
return {
      totalResponses,
      totalAnsweredLinks,
      emptyResponses,
      totalFeedbacks,
      totalLinks,
    };
  }, [responses, feedbacks]);

  return (
    <div className="flex flex-col w-full h-full m-2 bg-background">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80%] w-full">
          <LoaderWithText />
        </div>
      ) : (
        <>
          <div className="flex flex-row p-3 pt-4 justify-center gap-6 items-center sticky top-2 bg-background">
            <div className="font-bold text-md">{interview?.name}</div>

            <div className="flex flex-row gap-3 my-auto">
              <UserIcon className="my-auto" size={16} />: {stats.totalResponses}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-transparent shadow-none text-xs text-secondary px-0 h-7 hover:scale-110 relative"
                    onClick={(event) => {
                      event.stopPropagation();
                      seeInterviewPreviewPage();
                    }}
                  >
                    <Eye />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-secondary"
                  side="bottom"
                  sideOffset={4}
                >
                  <span className="text-secondary-foreground flex flex-row gap-4">
                    Preview
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-transparent shadow-none text-xs text-secondary px-0 h-7 hover:scale-110 relative"
                    onClick={(event) => {
                      router.push(`/dashboard/interviews/${interviewId}?edit=true`);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-secondary"
                  side="bottom"
                  sideOffset={4}
                >
                  <span className="text-secondary-foreground flex flex-row gap-4">Edit</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <label className="inline-flex cursor-pointer">
              {currentPlan == 'free_trial_over' ? (
                <>
                  <span className="ms-3 my-auto text-sm">Inactive</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipContent
                        className="bg-secondary"
                        side="bottom"
                        sideOffset={4}
                      >
                        Upgrade your plan to reactivate
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <>
                  <span className="ms-3 my-auto text-sm">Active</span>
                  <Switch
                    checked={isActive}
                    className={`ms-3 my-auto ${
                      isActive ? 'bg-secondary' : 'bg-muted'
                    }`}
                    onCheckedChange={handleToggle}
                  />
                </>
              )}
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 h-7 text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsGenerateLinkModalOpen(true);
                    }}
                  >
                    <Link2 size={16} className="mr-2" />
                    Generate Link
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-secondary"
                  side="bottom"
                  sideOffset={4}
                >
                  <span className="text-secondary-foreground flex flex-row gap-4">
                    Generate Link
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 h-7 text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      openSharePopup();
                    }}
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-secondary"
                  side="bottom"
                  sideOffset={4}
                >
                  <span className="text-secondary-foreground flex flex-row gap-4">Share</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-row w-full p-2 h-[85%] gap-1 ">
            <div className="w-[20%] flex flex-col p-2 divide-y-2 rounded-sm border-2 border-border">
              <div className="flex w-full justify-center py-2">
                <Select
                  onValueChange={async (newValue: string) => {
                    setFilterStatus(newValue);
                  }}
                >
                  <SelectTrigger className="w-[95%] bg-muted rounded-lg">
                    <Filter size={18} className=" text-muted-foreground" />
                    <SelectValue placeholder="Filter By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CandidateStatus.NO_STATUS}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-muted-foreground rounded-full mr-2" />
                        No Status
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.NOT_SELECTED}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-destructive rounded-full mr-2" />
                        Not Selected
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.POTENTIAL}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-warning rounded-full mr-2" />
                        Potential
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.SELECTED}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-success rounded-full mr-2" />
                        Selected
                      </div>
                    </SelectItem>
                    <SelectItem value="ALL">
                      <div className="flex items-center">
                        <div className="w-3 h-3 border-2 border-border rounded-full mr-2" />
                        All
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[calc(100vh-250px)] p-1 rounded-md border-none">
                {filteredResponses.length > 0 ? (
                  filteredResponses.map((response) => (
                    <div
                      className={`p-2 rounded-md hover:bg-primary/10 border-2 my-1 text-left text-xs ${
                        callId == response.call_id
                          ? 'bg-primary/20'
                          : 'border-primary/20'
                      } flex flex-row justify-between cursor-pointer w-full`}
                      key={response?.id}
                      onClick={() => {
                        if (response.call_id) {
                          router.push(
                            `/dashboard/interviews/${interviewId}?call=${response.call_id}`
                          );
                          handleResponseClick(response);
                        }
                      }}
                    >
                      <div className="flex flex-row gap-1 items-center w-full">
                        {response.candidate_status === 'NOT_SELECTED' ? (
                          <div className="w-[5%] h-full bg-destructive rounded-sm" />
                        ) : response.candidate_status === 'POTENTIAL' ? (
                          <div className="w-[5%] h-full bg-warning rounded-sm" />
                        ) : response.candidate_status === 'SELECTED' ? (
                          <div className="w-[5%] h-full bg-success rounded-sm" />
                        ) : (
                          <div className="w-[5%] h-full bg-muted-foreground rounded-sm" />
                        )}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col my-auto">
                            <p className="font-medium mb-[2px]">
                              {response?.name
                                ? `${response?.name}'s Response`
                                : 'Anonymous'}
                            </p>
                            <p className="">
                              {formatTimestampToDateHHMM(
                                String(response?.created_at)
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-center justify-center ml-auto flex-shrink-0">
                            {!response.is_viewed && (
                              <div className="w-4 h-4 flex items-center justify-center mb-1">
                                <div className="text-primary text-xl leading-none">
                                  ●
                                </div>
                              </div>
                            )}
                            <div
                              className={`w-6 h-6 flex items-center justify-center ${
                                response.is_viewed ? 'h-full' : ''
                              }`}
                            >
                              {response.analytics &&
                                response.analytics.overallScore !==
                                  undefined && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                          <span className="text-primary text-xs font-semibold">
                                            {response?.analytics?.overallScore}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        className="bg-secondary"
                                        side="bottom"
                                        sideOffset={4}
                                      >
                                        <span className="text-secondary-foreground font-normal flex flex-row gap-4">
                                          Overall Score
                                        </span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No responses to display
                  </p>
                )}
              </ScrollArea>
            </div>
            {responses && (
              <div className="w-[85%] rounded-md ">
                {callId ? (
                  <CallInfo
                    call_id={callId}
                    onDeleteResponse={handleDeleteResponse}
                    onCandidateStatusChange={handleCandidateStatusChange}
                  />
                ) : isEditMode ? (
                  <EditInterview interview={interview} />
                ) : (
                  <>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Responses
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">
                            {stats.totalResponses}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Empty Responses
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-secondary">
                            {stats.emptyResponses}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Feedbacks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">
                            {stats.totalFeedbacks}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">
                            {stats.totalLinks}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Answered Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-secondary">
                            {stats.totalAnsweredLinks}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <Tabs
                      value={activeTab}
                      className="w-full"
                      onValueChange={(value) =>
                        setActiveTab(
                          value as
                            | 'details'
                            | 'responses'
                            | 'links'
                            | 'feedback'
                        )
                      }
                    >
                      <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="responses">
                          Responses ({stats.totalAnsweredLinks})
                        </TabsTrigger>
                        <TabsTrigger value="links">
                          All Links ({stats.totalLinks})
                        </TabsTrigger>
                        <TabsTrigger value="feedback">
                          Feedback ({stats.totalFeedbacks})
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="mt-4">
                        <SummaryInfo
                          responses={responses}
                          interview={interview}
                        />
                      </TabsContent>
                      <TabsContent value="responses" className="mt-4">
                        <ResponsesTable
                          data={filteredResponses}
                          interviewId={interviewId}
                        />
                      </TabsContent>
                      <TabsContent value="links" className="mt-4">
                        <LinksTable
                          data={responses || []}
                          interviewId={interviewId}
                          organizationNameSlug={organizationNameSlug}
                        />
                      </TabsContent>
                      <TabsContent value="feedback" className="mt-4">
                        <FeedbackTable data={feedbacks || []} />
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
      {isSharePopupOpen && (
        <SharePopup
          open={isSharePopupOpen}
          shareContent={shareUrl || (interview?.url as string)}
          onClose={closeSharePopup}
        />
      )}
      {isGenerateLinkModalOpen && interview && (
        <GenerateLinkModal
          open={isGenerateLinkModalOpen}
          interviewId={interview.id}
          organizationName={
            organizationNameSlug || interview.readable_slug || 'organization'
          }
          sharedLink={sharedGeneratedLink}
          setSharedLink={setSharedGeneratedLink}
          onClose={() => setIsGenerateLinkModalOpen(false)}
        />
      )}
    </div>
  );
}

export default InterviewHome;
