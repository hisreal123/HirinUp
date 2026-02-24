'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ResponseService } from '@/services/responses.service';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExpireLinkDialogProps {
  token: string | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function ExpireLinkDialog({
  token,
  onClose,
  onSuccess,
}: ExpireLinkDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!token) {return;}
    setDeleting(true);
    try {
      await ResponseService.updateResponseByToken({ is_ended: true }, token);
      toast.success('Link expired successfully');
      await onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to expire link:', err);
      toast.error('Failed to expire link');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={!!token}
      onOpenChange={(open) => {
        if (!open && !deleting) {onClose();}
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Expire this link?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately expire the link. The candidate will no longer
            be able to use it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
          >
            {deleting ? 'Expiring...' : 'Expire Link'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
