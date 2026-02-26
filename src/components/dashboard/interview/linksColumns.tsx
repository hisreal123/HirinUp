'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowUpDown, Eye, Copy, Check, Trash2 } from 'lucide-react';
import { Response } from '@/types/response';
import { formatDateReadable } from '@/lib/utils';

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

interface CallTypeCellProps {
  isTwoFlow: boolean;
  token: string;
  isUsed: boolean;
  onToggleTwoFlow: (token: string, newValue: boolean) => void;
}

function CallTypeCell({ isTwoFlow, token, isUsed, onToggleTwoFlow }: CallTypeCellProps) {
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  const handleSwitchChange = (checked: boolean) => {
    setPendingValue(checked);
  };

  const handleConfirm = () => {
    if (pendingValue !== null) {
      onToggleTwoFlow(token, pendingValue);
    }
    setPendingValue(null);
  };

  const handleCancel = () => {
    setPendingValue(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isTwoFlow ? (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Two Call
          </span>
        ) : (
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            Single Call
          </span>
        )}
        <Switch
          checked={isTwoFlow}
          disabled={isUsed}
          className={isTwoFlow ? 'bg-indigo-600' : ''}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      <AlertDialog open={pendingValue !== null} onOpenChange={(open) => { if (!open) {handleCancel();} }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Call Type?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue
                ? 'Switch to Two Call flow? Candidate will go through a test call before the main call.'
                : 'Switch to Single Call flow? The candidate will go straight into the interview without a test call.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export interface LinksColumnOptions {
  interviewId: string;
  organizationNameSlug: string;
  copiedLink: string | null;
  copyToClipboard: (link: string) => void;
  setDeleteToken: (token: string) => void;
  onView: (callId: string) => void;
  onToggleTwoFlow: (token: string, newValue: boolean) => void;
}

export function getLinksColumns({
  interviewId,
  organizationNameSlug,
  copiedLink,
  copyToClipboard,
  setDeleteToken,
  onView,
  onToggleTwoFlow,
}: LinksColumnOptions): ColumnDef<Response>[] {
  return [
    {
      accessorKey: 'token',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Link Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isUnused = !row.original.call_id;
        
return (
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isUnused ? 'bg-gray-300' : 'bg-green-500'}`}
            />
            <span className="text-sm font-medium">
              {isUnused ? 'Unused' : 'Used'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Candidate Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue('name') as string | null;
        const isUnused = !row.original.call_id;
        
return (
          <div className="font-medium">
            {isUnused
              ? 'Unused Link'
              : name
                ? `${name}'s Response`
                : 'Anonymous'}
          </div>
        );
      },
    },
    {
      id: 'response_id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Response ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const token = (row.original as any).token || '';
        const linkUrl = token
          ? `${base_url}/join/${organizationNameSlug || 'organization'}/${interviewId}/${token}`
          : '-';
        
return (
          <div className="flex items-center gap-2 max-w-md">
            <span className="text-sm font-medium">{token || '-'}</span>
            {linkUrl !== '-' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Copy full link"
                onClick={() => copyToClipboard(linkUrl)}
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
      accessorKey: 'is_ended',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const response = row.original;
        const isEnded = row.getValue('is_ended') as boolean;
        if (!isEnded && !response.call_id)
          {return <span className="text-sm text-gray-500">-</span>;}
        // Only show "Expired" for manually expired unused links (no call was made)
        if (isEnded && !response.call_id)
          {return <span className="text-sm text-red-500">Expired</span>;}
        // Call was used: show Completed (details may still be pending from Retell/webhook)
        if (isEnded && response.call_id)
          {return <span className="text-sm text-green-600">Completed</span>;}
        
return <span className="text-sm text-yellow-600">In Progress</span>;
      },
    },
    {
      accessorKey: 'is_two_flow',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Call Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isTwoFlow = row.getValue('is_two_flow') as boolean;
        const token = (row.original as any).token as string;
        const isUsed = !!row.original.call_id;

        return (
          <CallTypeCell
            isTwoFlow={isTwoFlow}
            token={token}
            isUsed={isUsed}
            onToggleTwoFlow={onToggleTwoFlow}
          />
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
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as Date;
        
return (
          <div className="text-sm">{formatDateReadable(date.toString())}</div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
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
                className="h-8 px-2"
                onClick={() => response.call_id && onView(response.call_id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}
            {!isEnded && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setDeleteToken(token)}
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
