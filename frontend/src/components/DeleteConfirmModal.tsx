'use client';

import { useRef, useState } from 'react';
import { Task } from '@/lib/api';

interface Props {
  task: Task;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteConfirmModal({ task, onConfirm, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <div className="bg-cream w-full max-w-sm animate-scale-in">
        <div className="px-6 py-6">
          {/* Icon */}
          <div className="w-12 h-12 bg-clay/10 border border-clay/20 flex items-center justify-center mb-5">
            <span className="text-clay text-xl">⚠</span>
          </div>

          <h2 className="font-display text-xl text-ink mb-2">Delete task?</h2>
          <p className="font-body text-sm text-ink-400 mb-1">
            You&apos;re about to permanently delete:
          </p>
          <p className="font-body text-sm text-ink font-medium mb-6 truncate">
            &ldquo;{task.title}&rdquo;
          </p>
          <p className="font-mono text-xs text-ink-400 mb-6">
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
