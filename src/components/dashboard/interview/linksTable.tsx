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
import { ArrowUpDown, Eye, Copy, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { formatDateReadable } from "@/lib/utils";
import { Response } from "@/types/response";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

interface LinksTableProps {
  data: Response[];
  interviewId: string;
  organizationNameSlug: string;
}

function LinksTable({ data, interviewId, organizationNameSlug }: LinksTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const formatDate = (dateString: string | Date) => {
    return formatDateReadable(dateString.toString());
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const columns: ColumnDef<Response>[] = [
    {
      accessorKey: "token",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Link Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const response = row.original;
        // A link is "used" if it has call_id (interview started)
        // call_id is assigned when the interview begins, so that's when the link becomes "used"
        const isUnused = !response.call_id;
        return (
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isUnused ? "bg-gray-300" : "bg-green-500"
              }`}
            />
            <span className="text-sm font-medium">
              {isUnused ? "Unused" : "Used"}
            </span>
          </div>
        );
      },
    },
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
        const response = row.original;
        // A link is "used" if it has call_id (interview started)
        const isUnused = !response.call_id;
        return (
          <div className="font-medium">
            {isUnused
              ? "Unused Link"
              : name
              ? `${name}'s Response`
              : "Anonymous"}
          </div>
        );
      },
    },
    {
      id: "response_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Response ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const response = row.original;
        const token = (response as any).token || "";
        const linkUrl = token
          ? `${base_url}/join/${organizationNameSlug || "organization"}/${interviewId}/${token}`
          : "-";
        return (
          <div className="flex items-center gap-2 max-w-md">
            <span className="text-sm font-medium">{token || "-"}</span>
            {linkUrl !== "-" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(linkUrl)}
                className="h-6 w-6 p-0"
                title="Copy full link"
              >
                {copiedLink === linkUrl ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_ended",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const response = row.original;
        // A link is "used" if it has call_id (interview started)
        const isUnused = !response.call_id;
        const isEnded = row.getValue("is_ended") as boolean;
        if (isUnused) {
          return <span className="text-sm text-gray-500">-</span>;
        }
        return (
          <div className="text-sm">
            {isEnded ? (
              <span className="text-green-600">Completed</span>
            ) : (
              <span className="text-yellow-600">In Progress</span>
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
        // A link is "used" if it has call_id (interview started)
        const isUnused = !response.call_id;
        if (isUnused) {
          return <span className="text-sm text-gray-400">-</span>;
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (response.call_id) {
                router.push(`/interviews/${interviewId}?call=${response.call_id}`);
              }
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
    data,
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
      const token = (response as any).token || "";
      const name = (response.name || "").toLowerCase();
      const email = (response.email || "").toLowerCase();
      // A link is "used" if it has call_id (interview started)
      const isUnused = !response.call_id;
      const status = isUnused ? "unused" : (response.is_ended ? "completed" : "in progress");
      
      return (
        token.toLowerCase().includes(search) ||
        name.includes(search) ||
        email.includes(search) ||
        status.includes(search)
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

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No links to display
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
          placeholder="Search by response ID, name, email, status..."
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
            of {table.getFilteredRowModel().rows.length} links
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

export default LinksTable;

