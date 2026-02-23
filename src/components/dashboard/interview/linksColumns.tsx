"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Copy, Check, Trash2 } from "lucide-react";
import { Response } from "@/types/response";
import { formatDateReadable } from "@/lib/utils";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export interface LinksColumnOptions {
  interviewId: string;
  organizationNameSlug: string;
  copiedLink: string | null;
  copyToClipboard: (link: string) => void;
  setDeleteToken: (token: string) => void;
  onView: (callId: string) => void;
}

export function getLinksColumns({
  interviewId,
  organizationNameSlug,
  copiedLink,
  copyToClipboard,
  setDeleteToken,
  onView,
}: LinksColumnOptions): ColumnDef<Response>[] {
  return [
    {
      accessorKey: "token",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Link Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isUnused = !row.original.call_id;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isUnused ? "bg-gray-300" : "bg-green-500"}`} />
            <span className="text-sm font-medium">{isUnused ? "Unused" : "Used"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Candidate Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string | null;
        const isUnused = !row.original.call_id;
        return (
          <div className="font-medium">
            {isUnused ? "Unused Link" : name ? `${name}'s Response` : "Anonymous"}
          </div>
        );
      },
    },
    {
      id: "response_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Response ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const token = (row.original as any).token || "";
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const response = row.original;
        const isEnded = row.getValue("is_ended") as boolean;
        if (!isEnded && !response.call_id) return <span className="text-sm text-gray-500">-</span>;
        // Only show "Expired" for manually expired unused links (no call was made)
        if (isEnded && !response.call_id) return <span className="text-sm text-red-500">Expired</span>;
        // Call was used: show Completed (details may still be pending from Retell/webhook)
        if (isEnded && response.call_id) return <span className="text-sm text-green-600">Completed</span>;
        return <span className="text-sm text-yellow-600">In Progress</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return <div className="text-sm">{formatDateReadable(date.toString())}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const response = row.original;
        const isUnused = !response.call_id;
        const isEnded = response.is_ended;
        const token = (response as any).token as string;
        return (
          <div className="flex items-center gap-2">
            {!isUnused && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => response.call_id && onView(response.call_id)}
                className="h-8 px-2"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}
            {!isEnded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteToken(token)}
                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
