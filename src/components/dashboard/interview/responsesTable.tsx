"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { formatDateReadable } from "@/lib/utils";
import { Response } from "@/types/response";

interface ResponsesTableProps {
  data: Response[];
  interviewId: string;
}

function ResponsesTable({ data, interviewId }: ResponsesTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter to only show completed responses (have both call_id AND details)
  const completedResponses = data.filter(
    (response) => response.call_id && response.details
  );

  const formatDate = (dateString: string | Date) => {
    return formatDateReadable(dateString.toString());
  };

  const columns: ColumnDef<Response>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Candidate Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.getValue("name") as string | null;
        return (
          <div className="font-medium">
            {name ? `${name}'s Response` : "Anonymous"}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const email = row.getValue("email") as string | null;
        return <div className="text-sm">{email || "-"}</div>;
      },
    },
    {
      accessorKey: "candidate_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("candidate_status") as string;
        const statusColors: Record<string, string> = {
          SELECTED: "bg-green-500",
          POTENTIAL: "bg-yellow-500",
          NOT_SELECTED: "bg-red-500",
        };
        const statusLabels: Record<string, string> = {
          SELECTED: "Selected",
          POTENTIAL: "Potential",
          NOT_SELECTED: "Not Selected",
        };
        const color = statusColors[status] || "bg-gray-400";
        const label = statusLabels[status] || "No Status";
        return (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm">{label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "analytics.overallScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
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
            {score !== undefined ? score : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "is_ended",
      header: "Status",
      cell: ({ row }) => {
        const response = row.original;
        const isEnded = row.getValue("is_ended") as boolean;
        const hasCallId = !!response.call_id;
        const hasDetails = !!response.details;
        
        // If response has details but no call_id, show special status
        if (hasDetails && !hasCallId) {
          return (
            <div className="text-sm">
              <span className="text-orange-600 font-semibold">Missing Call ID</span>
            </div>
          );
        }
        
        // If no details at all, show not started
        if (!hasDetails) {
          return (
            <div className="text-sm">
              <span className="text-gray-500 font-semibold">Not Started</span>
            </div>
          );
        }
        
        // Normal status for responses with call_id and details
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
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return <div className="text-sm">{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const response = row.original;
        const callId = response.call_id;
        const hasDetails = !!response.details;
        
        if (hasDetails && !callId) {
          return (
            <span className="text-sm text-orange-500">No Call ID</span>
          );
        }
        
        if (!hasDetails) {
          return (
            <span className="text-sm text-gray-400">-</span>
          );
        }
        
        // Only show View button if call_id exists
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/interviews/${interviewId}?call=${callId}`);
            }}
            className="h-8 px-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: completedResponses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const response = row.original;
      const name = (response.name || "").toLowerCase();
      const email = (response.email || "").toLowerCase();
      const status = (response.candidate_status || "").toLowerCase();
      const score = (response.analytics?.overallScore || "").toString();
      const isEnded = response.is_ended ? "completed" : "in progress";
      
      return (
        name.includes(search) ||
        email.includes(search) ||
        status.includes(search) ||
        score.includes(search) ||
        isEnded.includes(search)
      );
    },
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (completedResponses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No completed responses to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by name, email, status, score..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10"
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
          <div className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} responses
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResponsesTable;

