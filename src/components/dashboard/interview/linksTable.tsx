'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Response } from '@/types/response';
import { toast } from 'sonner';
import { useUpdateResponseByToken } from '@/hooks/useUpdateResponseByToken';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLinksColumns } from './linksColumns';
import { ExpireLinkDialog } from './expireLinkDialog';

interface LinksTableProps {
  data: Response[];
  interviewId: string;
  organizationNameSlug: string;
  onDelete?: () => void | Promise<void>;
}

function LinksTable({
  data,
  interviewId,
  organizationNameSlug,
  onDelete,
}: LinksTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const updateResponseMutation = useUpdateResponseByToken();

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleToggleTwoFlow = (token: string, newValue: boolean) => {
    updateResponseMutation.mutate(
      { payload: { is_two_flow: newValue }, token },
      {
        onError: () => {
          toast.error('Failed to update call type. Please try again.');
        },
      }
    );
  };

  const columns = getLinksColumns({
    interviewId,
    organizationNameSlug,
    copiedLink,
    copyToClipboard,
    setDeleteToken,
    onView: (callId) =>
      router.push(`/interviews/${interviewId}?call=${callId}`),
    onToggleTwoFlow: handleToggleTwoFlow,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const response = row.original;
      const token = (response as any).token || '';
      const name = (response.name || '').toLowerCase();
      const email = (response.email || '').toLowerCase();
      const isUnused = !response.call_id;
      const status = isUnused
        ? 'unused'
        : response.is_ended
          ? 'completed'
          : 'in progress';
      
return (
        token.toLowerCase().includes(search) ||
        name.includes(search) ||
        email.includes(search) ||
        status.includes(search)
      );
    },
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
  });

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No links to display</div>
    );
  }

  return (
    <div className="space-y-4">
      <ExpireLinkDialog
        token={deleteToken}
        onClose={() => setDeleteToken(null)}
        onSuccess={() => onDelete?.()}
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by response ID, name, email, status..."
          value={globalFilter}
          className="pl-10"
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
          <div className="text-sm text-gray-700">
            Showing{' '}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{' '}
            to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} links
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LinksTable;
