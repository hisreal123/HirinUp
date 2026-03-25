'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResponseService } from '@/services/responses.service';
import { Response } from '@/types/response';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { OrganizationService } from "@/services/organizations.service"; // replaced with encrypted API call
import { encryptedApiCall } from '@/lib/encrypted-api';
import { useInterviews } from '@/contexts/interviews.context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoaderWithText from '@/components/loaders/loader-with-text/loaderWithText';
import ResponsesTable from '@/components/dashboard/interview/responsesTable';
import LinksTable from '@/components/dashboard/interview/linksTable';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewResponses() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.interviewId as string;

  // Stats + Links tab: initial full load (high limit)
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationNameSlug, setOrganizationNameSlug] = useState<string>('');
  const { getInterviewById } = useInterviews();

  // Responses tab: paginated
  const [tableData, setTableData] = useState<Response[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Initial load for stats + links tab
  useEffect(() => {
    if (!interviewId) {return;}

    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: responsesData }, interview] = await Promise.all([
          ResponseService.getAllResponses(interviewId, { limit: 1000 }),
          getInterviewById(interviewId),
        ]);
        setAllResponses(responsesData || []);

        if (interview?.organization_id) {
          const orgData = await encryptedApiCall('/api/get-organization', {
            id: interview.organization_id,
          });
          if (orgData?.name) {
            const slug = orgData.name
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            setOrganizationNameSlug(slug);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [interviewId, getInterviewById]);

  // Paginated fetch for Responses table
  const fetchTableData = useCallback(async () => {
    if (!interviewId) {return;}
    setTableLoading(true);
    try {
      const { data, nextCursor: nc } = await ResponseService.getAllResponses(
        interviewId,
        {
          search: search || undefined,
          cursor: cursor || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }
      );
      setTableData(data);
      setNextCursor(nc);
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setTableLoading(false);
    }
  }, [interviewId, search, cursor, statusFilter]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCursor(null);
    setCursorHistory([]);
    setNextCursor(null);
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
    setCursor(null);
    setCursorHistory([]);
    setNextCursor(null);
  }, []);

  const handleNextPage = useCallback(() => {
    if (!nextCursor) {return;}
    setCursorHistory((prev) => [...prev, cursor ?? '']);
    setCursor(nextCursor);
  }, [nextCursor, cursor]);

  const handlePrevPage = useCallback(() => {
    setCursorHistory((prev) => {
      const newHistory = [...prev];
      const prevCursor = newHistory.pop() ?? null;
      setCursor(prevCursor);
      return newHistory;
    });
  }, []);

  const fetchAllResponses = useCallback(async () => {
    if (!interviewId) {return;}
    const { data } = await ResponseService.getAllResponses(interviewId, {
      limit: 1000,
    });
    setAllResponses(data || []);
    fetchTableData();
  }, [interviewId, fetchTableData]);

  // Calculate statistics from full load
  const totalResponses = allResponses.filter((r) => r.call_id && r.details).length;
  const totalLinks = allResponses.length;
  const totalAnsweredLinks = allResponses.filter(
    (r) => r.is_ended === true
  ).length;
  const unusedLinks = allResponses.filter(
    (r) => !r.call_id || !r.details
  ).length;

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row items-center gap-4 mt-5 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.push(`/interviews/${interviewId}`)}
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
                  data={tableData}
                  interviewId={interviewId}
                  isLoading={tableLoading}
                  search={search}
                  onSearchChange={handleSearchChange}
                  statusFilter={statusFilter}
                  onStatusChange={handleStatusChange}
                  nextCursor={nextCursor}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                  canGoPrev={cursorHistory.length > 0}
                />
              </TabsContent>
              <TabsContent value="links" className="mt-4">
                <LinksTable
                  data={allResponses}
                  interviewId={interviewId}
                  organizationNameSlug={organizationNameSlug}
                  onDelete={fetchAllResponses}
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
