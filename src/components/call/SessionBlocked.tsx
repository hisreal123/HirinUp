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
    <div className="flex justify-center items-center min-h-screen bg-surface-subtle">
      <Card className="w-[90%] max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Monitor className="h-16 w-16 text-muted-foreground" />
            <ShieldAlert className="h-8 w-8 text-destructive absolute -bottom-1 -right-1" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Session Already Active
        </h2>

        <p className="text-muted-foreground mb-6">
          {reason || 'This interview is already open in another tab or device.'}
        </p>

        <div className="bg-warning-subtle border border-warning/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-warning-foreground">
            For security reasons, each interview link can only be active in one
            tab at a time. Please close other tabs or devices to continue here.
          </p>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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

        <p className="text-xs text-muted-foreground mt-6">
          If you believe this is an error, please wait 30 seconds and try again.
          Sessions automatically expire after inactivity.
        </p>
      </Card>
    </div>
  );
}

export default SessionBlocked;
