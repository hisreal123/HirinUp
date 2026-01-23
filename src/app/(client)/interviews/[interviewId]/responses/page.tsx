"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationService } from "@/services/organizations.service";
import { useInterviews } from "@/contexts/interviews.context";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import ResponsesTable from "@/components/dashboard/interview/responsesTable";
import LinksTable from "@/components/dashboard/interview/linksTable";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewResponses() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.interviewId as string;
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationNameSlug, setOrganizationNameSlug] = useState<string>("");
  const { getInterviewById } = useInterviews();

  useEffect(() => {
    if (!interviewId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [responsesData, interview] = await Promise.all([
          ResponseService.getAllResponses(interviewId),
          getInterviewById(interviewId),
        ]);
        setResponses(responsesData || []);

        // Fetch organization slug
        if (interview?.organization_id) {
          const orgData = await OrganizationService.getOrganizationById(
            interview.organization_id
          );
          if (orgData?.name) {
            const slug = orgData.name
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
            setOrganizationNameSlug(slug);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [interviewId, getInterviewById]);

  // Calculate statistics
  const totalResponses = responses.filter(
    (r) => r.call_id && r.details
  ).length;
  const totalLinks = responses.length;
  const totalAnsweredLinks = responses.filter(
    (r) => r.is_ended === true
  ).length;
  const unusedLinks = responses.filter(
    (r) => !r.call_id || !r.details
  ).length;

  // Filter responses with details (for table)
  const responsesWithDetails = responses.filter(
    (r) => r.call_id && r.details
  );

  // All links (for links tab)
  const allLinks = responses;

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row items-center gap-4 mt-5 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/interviews/${interviewId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Interview
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mt-3">
              Interview Responses
            </h2>
            <h3 className="text-sm tracking-tight text-gray-600 font-medium">
              View and manage all responses and links for this interview.
            </h3>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {totalResponses}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {totalLinks}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Answered Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {totalAnsweredLinks}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unused Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">
                {unusedLinks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoaderWithText text="Loading responses..." />
            </div>
          ) : (
            <Tabs defaultValue="responses" className="w-full">
              <TabsList>
                <TabsTrigger value="responses">
                  Responses ({totalResponses})
                </TabsTrigger>
                <TabsTrigger value="links">
                  All Links ({totalLinks})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="responses" className="mt-4">
                <ResponsesTable
                  data={responsesWithDetails}
                  interviewId={interviewId}
                />
              </TabsContent>
              <TabsContent value="links" className="mt-4">
                <LinksTable
                  data={allLinks}
                  interviewId={interviewId}
                  organizationNameSlug={organizationNameSlug}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </main>
  );
}

export default InterviewResponses;

