'use client';

import React from 'react';
import { ShieldAlert, Monitor, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SessionBlockedProps {
  reason?: string;
  onRetry?: () => void;
}

export function SessionBlocked({ reason, onRetry }: SessionBlockedProps) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[90%] max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Monitor className="h-16 w-16 text-gray-400" />
            <ShieldAlert className="h-8 w-8 text-red-500 absolute -bottom-1 -right-1" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Session Already Active
        </h2>

        <p className="text-gray-600 mb-6">
          {reason || 'This interview is already open in another tab or device.'}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            For security reasons, each interview link can only be active in one
            tab at a time. Please close other tabs or devices to continue here.
          </p>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.close()}
          >
            Close This Tab
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you believe this is an error, please wait 30 seconds and try again.
          Sessions automatically expire after inactivity.
        </p>
      </Card>
    </div>
  );
}

export default SessionBlocked;
