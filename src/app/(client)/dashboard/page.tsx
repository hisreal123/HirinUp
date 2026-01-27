"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import InterviewListItem from "@/components/dashboard/interview/interviewListItem";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { Gem, Plus, Grid3x3, List } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] =
    useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  function InterviewsLoader() {
    return (
      <>
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
      </>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses =
          await ResponseService.getResponseCountByOrganizationId(
            organization.id,
          );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row items-center justify-between mt-8">
          <div>
            <h2 className="mr-2 text-2xl font-semibold tracking-tight">
          My Interviews
        </h2>
            <h3 className="text-gray-500 text-sm tracking-tight ">
              {interviews?.length} Interviews created
        </h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-2"
            >
              <Grid3x3 size={16} />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List size={16} />
              List
            </Button>
          </div>
        </div>
        <div className={`relative mt-1 ${viewMode === "grid" ? "grid grid-cols-4 gap-4" : "flex flex-col gap-4"}`}>
          {currentPlan == "free_trial_over" ? (
            <Card className={`w-full flex flex-col gap-4 border border-dashed border-primary-500 bg-lightCard-100 hover:bg-secondary-100/30 transition-colors rounded-xl justify-center items-center p-4 cursor-pointer ${viewMode === "grid" ? "h-full min-h-40" : "min-h-24"}`}>
              <CardContent className="flex items-center flex-col mx-auto">
                <div className="flex flex-col justify-center items-center w-full overflow-hidden">
                  <Plus size={viewMode === "grid" ? 90 : 50} strokeWidth={0.5} className="text-gray-700" />
                </div>
                <CardTitle className="p-0 text-md text-center">
                  You cannot create any more interviews unless you upgrade
                </CardTitle>
              </CardContent>
            </Card>
          ) : (
            <CreateInterviewCard viewMode={viewMode} />
          )}
          {interviewsLoading || loading ? (
            <InterviewsLoader />
          ) : (
            <>
              {isModalOpen && (
                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center text-indigo-600">
                      <Gem />
                    </div>
                    <h3 className="text-xl font-semibold text-center">
                      Upgrade to Pro
                    </h3>
                    <p className="text-l text-center">
                      You have reached your limit for the free trial. Please
                      upgrade to pro to continue using our features.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-center items-center">
                        <Image
                          src={"/premium-plan-icon.png"}
                          alt="Graphic"
                          width={299}
                          height={300}
                        />
                      </div>

                      <div className="grid grid-rows-2 gap-2">
                        <div className="p-4 border rounded-lg">
                          <h4 className="text-lg font-medium">Free Plan</h4>
                          <ul className="list-disc pl-5 mt-2">
                            <li>10 Responses</li>
                            <li>Basic Support</li>
                            <li>Limited Features</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="text-lg font-medium">Pro Plan</h4>
                          <ul className="list-disc pl-5 mt-2">
                            <li>Flexible Pay-Per-Response</li>
                            <li>Priority Support</li>
                            <li>All Features</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <p className="text-l text-center">
                      Contact{" "}
                      <span className="font-semibold">founders@hirin-up.co</span>{" "}
                      to upgrade your plan.
                    </p>
                  </div>
                </Modal>
              )}
              {viewMode === "grid" ? (
                interviews.map((item) => (
                <InterviewCard
                  id={item.id}
                  interviewerId={item.interviewer_id}
                  key={item.id}
                  name={item.name}
                  url={item.url ?? ""}
                  readableSlug={item.readable_slug}
                />
                ))
              ) : (
                interviews.map((item) => (
                  <InterviewListItem
                    id={item.id}
                    interviewerId={item.interviewer_id}
                    key={item.id}
                    name={item.name}
                    url={item.url ?? ""}
                    readableSlug={item.readable_slug}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Interviews;
