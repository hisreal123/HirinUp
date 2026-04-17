'use client';

const foundersemail = process.env.NEXT_PUBLIC_FOUNDERS_EMAIL;

import { useState, useEffect, useCallback } from 'react';
import { useOrganization, useClerk } from '@clerk/nextjs';
import InterviewCard from '@/components/dashboard/interview/interviewCard';
import CreateInterviewCard from '@/components/dashboard/interview/createInterviewCard';
import InterviewsTable from '@/components/dashboard/interview/interviewsTable';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ClientService } from '@/services/clients.service';
import { encryptedApiCall } from '@/lib/encrypted-api';
import { ResponseService } from '@/services/responses.service';
import { InterviewService } from '@/services/interviews.service';
import { useInterviews } from '@/contexts/interviews.context';
import Modal from '@/components/dashboard/Modal';
import CreateInterviewModal from '@/components/dashboard/interview/createInterviewModal';
import { Gem, Plus, Grid3x3, Table2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Interview } from '@/types/interview';
import { DateRange } from '@/components/ui/DateRangePicker';
import { ALLOWED_RESPONSE_COUNT, ALLOWED_INTERVIEW_COUNT } from '@/lib/utils';

const PAGE_SIZE = 20;

function Interviews() {
  const { interviews, interviewsLoading, fetchInterviews } = useInterviews();
  const { organization } = useOrganization();
  const { user } = useClerk();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(
    ALLOWED_RESPONSE_COUNT
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [createOpen, setCreateOpen] = useState(false);
  const isAtInterviewLimit = interviews.length >= ALLOWED_INTERVIEW_COUNT;

  // Table state
  const [tableData, setTableData] = useState<Interview[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchTableData = useCallback(async () => {
    if (!organization?.id && !user?.id) {
      return;
    }
    setTableLoading(true);
    try {
      const response = await encryptedApiCall<{
        data: Interview[];
        nextCursor: string | null;
      }>('/api/get-interviews', {
        userId: user?.id,
        organizationId: organization?.id,
        search: search || undefined,
        cursor: cursor || undefined,
        limit: PAGE_SIZE,
        dateFrom: dateRange?.from?.toISOString(),
        dateTo: dateRange?.to
          ? new Date(dateRange.to.setHours(23, 59, 59, 999)).toISOString()
          : undefined,
      });
      setTableData(response?.data || []);
      setNextCursor(response?.nextCursor ?? null);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setTableLoading(false);
    }
  }, [organization?.id, user?.id, search, cursor, dateRange]);

  useEffect(() => {
    if (viewMode === 'table') {
      fetchTableData();
    }
  }, [fetchTableData, viewMode]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCursor(null);
    setCursorHistory([]);
    setNextCursor(null);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    setCursor(null);
    setCursorHistory([]);
    setNextCursor(null);
  }, []);

  const handleNextPage = useCallback(() => {
    if (!nextCursor) {
      return;
    }
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

  useEffect(() => {
    if (!organization?.id) {
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const data = await encryptedApiCall('/api/get-organization', {
          id: organization.id,
        });
        const plan: string = data?.plan ?? '';
        const limit: number =
          data?.allowed_responses_count ?? ALLOWED_RESPONSE_COUNT;
        setCurrentPlan(plan);
        setAllowedResponsesCount(limit);
        if (plan === 'free_trial_over') {
          setIsModalOpen(true);
        }

        if (plan === 'free') {
          const totalResponses =
            await ResponseService.getResponseCountByOrganizationId(
              organization.id
            );
          if (totalResponses >= limit) {
            setCurrentPlan('free_trial_over');
            await InterviewService.deactivateInterviewsByOrgId(organization.id);
            await ClientService.updateOrganization(
              { plan: 'free_trial_over' },
              organization.id
            );
          }
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [organization?.id]);

  function InterviewsLoader() {
    return (
      <>
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
        <div className="h-48 w-full mt-4 animate-pulse rounded-xl bg-gray-300" />
      </>
    );
  }

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row items-center justify-between mt-8">
          <div>
            <h2 className="mr-2 text-2xl font-semibold tracking-tight">
              My Interviews
            </h2>
            <h3 className="text-gray-500 text-sm tracking-tight">
              {interviews?.length} Interviews created
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={16} />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setViewMode('table')}
            >
              <Table2 size={16} />
              Table
            </Button>
          </div>
        </div>

        {isAtInterviewLimit && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              You have reached the maximum of <strong>1,000 interviews</strong>{' '}
              for this organization. Delete existing interviews to create new
              ones.
            </span>
          </div>
        )}

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
                You have reached your limit for the free trial. Please upgrade
                to pro to continue using our features.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-center items-center">
                  <Image
                    src={'/premium-plan-icon.png'}
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
                Contact <span className="font-semibold">{foundersemail}</span>
                to upgrade your plan.
              </p>
            </div>
          </Modal>
        )}

        {viewMode === 'grid' ? (
          <div className="relative mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentPlan === 'free_trial_over' ? (
              <Card className="w-full flex flex-col gap-4 border border-dashed border-primary-500 bg-lightCard-100 hover:bg-secondary-100/30 transition-colors rounded-xl justify-center items-center p-4 cursor-pointer h-full min-h-40">
                <CardContent className="flex items-center flex-col mx-auto">
                  <div className="flex flex-col justify-center items-center w-full overflow-hidden">
                    <Plus
                      size={90}
                      strokeWidth={0.5}
                      className="text-gray-700"
                    />
                  </div>
                  <CardTitle className="p-0 text-md text-center">
                    You cannot create any more interviews unless you upgrade
                  </CardTitle>
                </CardContent>
              </Card>
            ) : (
              <CreateInterviewCard
                viewMode="grid"
                disabled={isAtInterviewLimit || tableLoading || loading}
              />
            )}
            {interviewsLoading || loading ? (
              <InterviewsLoader />
            ) : (
              interviews.map((item) => (
                <InterviewCard
                  id={item.id}
                  interviewerId={item.interviewer_id}
                  key={item.id}
                  name={item.name}
                  url={item.url ?? ''}
                  readableSlug={item.readable_slug}
                />
              ))
            )}
          </div>
        ) : (
          <div className="mt-4">
            <InterviewsTable
              data={tableData}
              isLoading={tableLoading || loading}
              search={search}
              dateRange={dateRange}
              nextCursor={nextCursor}
              canGoPrev={cursorHistory.length > 0}
              createDisabled={isAtInterviewLimit || tableLoading || loading}
              onCreateInterview={
                currentPlan !== 'free_trial_over'
                  ? () => setCreateOpen(true)
                  : undefined
              }
              onDeleteSuccess={() => {
                fetchTableData();
                fetchInterviews();
              }}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onSearchChange={handleSearchChange}
              onDateRangeChange={handleDateRangeChange}
            />
            <Modal
              open={createOpen}
              closeOnOutsideClick={false}
              onClose={() => setCreateOpen(false)}
            >
              <CreateInterviewModal
                open={createOpen}
                setOpen={setCreateOpen}
                onSuccess={fetchTableData}
              />
            </Modal>
          </div>
        )}
      </div>
    </main>
  );
}

export default Interviews;
