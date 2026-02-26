'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import MiniLoader from '@/components/loaders/mini-loader/miniLoader';

interface DeleteInterviewModalProps {
  open: boolean;
  interviewName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteInterviewModal({
  open,
  interviewName,
  onClose,
  onConfirm,
}: DeleteInterviewModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmName('');
    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmName('');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Interview?</AlertDialogTitle>
          <AlertDialogDescription>
            This action{' '}
            <span className="font-semibold text-red-600">cannot be undone</span>
            .
          </AlertDialogDescription>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>⚠️</span>
            All responses and feedback for this interview will be permanently deleted.
          </div>
        </AlertDialogHeader>

        <hr className="border-dashed border-gray-300" />

        <div className="px-1 py-2">
          <p className="text-sm text-gray-600 mb-2">Type name to continue:</p>
          <input
            type="text"
            value={confirmName}
            placeholder="Enter interview name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={isDeleting}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" disabled={isDeleting} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white min-w-[90px]"
            disabled={confirmName !== interviewName || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? <MiniLoader /> : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteInterviewModal;
