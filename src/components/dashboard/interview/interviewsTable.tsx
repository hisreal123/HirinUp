'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Eye, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDateReadable } from '@/lib/utils';
import { Interview } from '@/types/interview';
import { useInterviewers } from '@/contexts/interviewers.context';
import { useDeleteInterview } from '@/hooks/useDeleteInterview';
import { toast } from 'sonner';
import DateRangePicker, { DateRange } from '@/components/ui/DateRangePicker';
import DeleteInterviewModal from '@/components/dashboard/interview/deleteInterviewModal';

interface InterviewsTableProps {
  data: Interview[];
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (val: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  nextCursor?: string | null;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  canGoPrev?: boolean;
  onDeleteSuccess?: () => void;
}

function capitalize(str: string) {
  if (!str) { return str; }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function InterviewsTable({
  data,
  isLoading,
  search = '',
  onSearchChange,
  dateRange,
  onDateRangeChange,
  nextCursor,
  onNextPage,
  onPrevPage,
  canGoPrev,
  onDeleteSuccess,
}: InterviewsTableProps) {
  const router = useRouter();
  const { interviewers } = useInterviewers();
  const interviewerMap = useMemo(
    () => new Map(interviewers.map((i) => [String(i.id), i])),
    [interviewers]
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inputValue, setInputValue] = useState(search);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteInterview, setDeleteInterview] = useState<Interview | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: deleteInterviewMutation } = useDeleteInterview();

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    if (!deleteInterview) { return; }
    try {
      await deleteInterviewMutation(deleteInterview.id);
      toast.success('Interview deleted.', { position: 'bottom-right', duration: 3000 });
      setDeleteInterview(null);
      onDeleteSuccess?.();
    } catch {
      toast.error('Failed to delete the interview.', { position: 'bottom-right', duration: 3000 });
      throw new Error('Failed to delete interview');
    }
  };

  // Debounce search
  useEffect(() => {
    if (!onSearchChange) { return; }
    const timer = setTimeout(() => onSearchChange(inputValue), 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  // Client-side filter when no backend handler
  const displayData = useMemo(() => {
    if (onSearchChange || !inputValue.trim()) { return data; }
    const lower = inputValue.toLowerCase();

    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) ||
        String(item.id).toLowerCase().includes(lower)
    );
  }, [data, inputValue, onSearchChange]);

  const columns = useMemo<ColumnDef<Interview>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {capitalize(row.getValue('name') as string)}
          </div>
        ),
      },
      {
        accessorKey: 'interviewer_id',
        header: 'Interviewer',
        cell: ({ row }) => {
          const interviewer = interviewerMap.get(
            String(row.getValue('interviewer_id'))
          );
          if (!interviewer) { return <span className="text-xs text-gray-400">—</span>; }

          return (
            <div className="flex items-center gap-2">
              {interviewer.image ? (
                <Image
                  src={interviewer.image}
                  alt={interviewer.name}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {interviewer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm">{interviewer.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const active = row.getValue('is_active') as boolean;

          return (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {active ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDateReadable(row.getValue('created_at'))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const interview = row.original;
          const isOpen = openMenuId === interview?.id;

          return (
            <div className="relative" ref={isOpen ? menuRef : undefined}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(isOpen ? null : interview.id);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="absolute right-0 top-full z-20 mt-1 bg-white border rounded-md shadow-md py-1 min-w-[140px] origin-top-right"
                  >
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        router.push(`/interviews/${interview.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                      View
                    </button>
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setDeleteInterview(interview);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        },
      },
    ],
    [openMenuId, router, interviewerMap]
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or ID..."
            value={inputValue}
            className="pl-10"
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        {onDateRangeChange && (
          <DateRangePicker
            value={dateRange}
            placeholder="Filter by date"
            onChange={onDateRangeChange}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-gray-400">
                  No interviews found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/interviews/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={!canGoPrev} onClick={onPrevPage}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!nextCursor} onClick={onNextPage}>
          Next
        </Button>
      </div>

      <DeleteInterviewModal
        open={!!deleteInterview}
        interviewName={deleteInterview?.name ?? ''}
        onClose={() => setDeleteInterview(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
