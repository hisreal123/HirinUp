'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { formatDateReadable } from '@/lib/utils';
import { Response } from '@/types/response';

interface ResponsesTableProps {
  interviewId: string;
  data: Response[];
  isLoading?: boolean;
    // Backend-driven search/pagination (dedicated responses page)
  search?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  nextCursor?: string | null;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  canGoPrev?: boolean;
}

// Pure helpers — defined outside component to avoid recreation on every render
function formatDate(dateString: string | Date): string {
  return formatDateReadable(dateString.toString());
}

const STATUS_COLORS: Record<string, string> = {
  SELECTED: 'bg-green-500',
  POTENTIAL: 'bg-yellow-500',
  NOT_SELECTED: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  SELECTED: 'Selected',
  POTENTIAL: 'Potential',
  NOT_SELECTED: 'Not Selected',
};

function ResponsesTable({
  data,
  interviewId,
  isLoading = false,
  search = '',
  onSearchChange,
  statusFilter,
  onStatusChange,
  nextCursor = null,
  onNextPage,
  onPrevPage,
  canGoPrev = false,
}: ResponsesTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inputValue, setInputValue] = useState(search);
  // Local status state — used when parent doesn't handle it (client-side mode)
  const [localStatus, setLocalStatus] = useState('ALL');

  const effectiveStatus = onStatusChange ? (statusFilter ?? 'ALL') : localStatus;

  // Debounce — fires onSearchChange 300ms after user stops typing (backend search)
  useEffect(() => {
    if (!onSearchChange) {return;}
    const timer = setTimeout(() => onSearchChange(inputValue), 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  const handleStatusSelect = (val: string) => {
    if (onStatusChange) {
      onStatusChange(val);
    } else {
      setLocalStatus(val);
    }
  };

  // displayData:
  // - backend mode (onSearchChange provided): data is already filtered by backend; only apply local status if needed
  // - client-side mode: filter by name/email/id text AND status
  const displayData = useMemo(() => {
    let filtered = data;

    // Text filter (client-side only — backend mode skips this)
    if (!onSearchChange && inputValue.trim()) {
      const lower = inputValue.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(lower) ||
          r.email?.toLowerCase().includes(lower) ||
          String(r.id).includes(lower)
      );
    }

    // Status filter — always client-side (backend handles it via onStatusChange if provided)
    if (!onStatusChange && effectiveStatus !== 'ALL') {
      filtered = filtered.filter(
        (r) => r.candidate_status === effectiveStatus
      );
    }

    return filtered;
  }, [data, inputValue, onSearchChange, onStatusChange, effectiveStatus]);

  const columns = useMemo<ColumnDef<Response>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-8 px-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Candidate Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const name = row.getValue('name') as string | null;

          return (
            <div className="font-medium">
              {name ? `${name}'s Response` : 'Anonymous'}
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-8 px-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const email = row.getValue('email') as string | null;

          return <div className="text-sm">{email || '-'}</div>;
        },
      },
      {
        accessorKey: 'candidate_status',
        header: 'Candidate Status',
        cell: ({ row }) => {
          const status = row.getValue('candidate_status') as string;
          const color = STATUS_COLORS[status] || 'bg-gray-400';
          const label = STATUS_LABELS[status] || 'No Status';

          return (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm">{label}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'analytics.overallScore',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-8 px-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const analytics = row.original.analytics;
          const score = analytics?.overallScore;

          return (
            <div className="text-sm font-semibold">
              {score !== undefined ? score : '-'}
            </div>
          );
        },
      },
      {
        accessorKey: 'is_ended',
        header: 'Interview Status',
        cell: ({ row }) => {
          const response = row.original;
          const isEnded = row.getValue('is_ended') as boolean;
          const hasCallId = !!response.call_id;
          const hasDetails = !!response.details;

          if (hasDetails && !hasCallId) {
            return (
              <div className="text-sm">
                <span className="text-orange-600 font-semibold">
                  Missing Call ID
                </span>
              </div>
            );
          }

          if (!hasDetails) {
            return (
              <div className="text-sm">
                <span className="text-gray-500 font-semibold">Not Started</span>
              </div>
            );
          }

          return (
            <div className="text-sm">
              {isEnded ? (
                <span className="text-green-600">Completed</span>
              ) : (
                <span className="text-gray-500">In Progress</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-8 px-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Created At
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue('created_at') as Date;

          return <div className="text-sm">{formatDate(date)}</div>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const response = row.original;
          const callId = response.call_id;
          const hasDetails = !!response.details;

          if (hasDetails && !callId) {
            return <span className="text-sm text-orange-500">No Call ID</span>;
          }

          if (!hasDetails) {
            return <span className="text-sm text-gray-400">-</span>;
          }

          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                router.push(`/interviews/${interviewId}?call=${callId}`);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          );
        },
      },
    ],
    [interviewId, router]
  );

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    manualPagination: true,
  });

  const searchAndFilterBar = (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by name, email or ID..."
          value={inputValue}
          className="pl-10"
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      <Select value={effectiveStatus} onValueChange={handleStatusSelect}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="SELECTED">Selected</SelectItem>
          <SelectItem value="POTENTIAL">Potential</SelectItem>
          <SelectItem value="NOT_SELECTED">Not Selected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (!isLoading && displayData.length === 0) {
    return (
      <div className="space-y-4">
        {searchAndFilterBar}
        <div className="text-center py-8 text-gray-500">
          No responses found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchAndFilterBar}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-700">
          {displayData.length} response{displayData.length !== 1 ? 's' : ''} on
          this page
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoPrev || isLoading || !onPrevPage}
            onClick={onPrevPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!nextCursor || isLoading || !onNextPage}
            onClick={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResponsesTable;
