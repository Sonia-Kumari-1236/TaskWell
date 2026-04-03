'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Task, TaskStatus, TaskPriority } from '@/lib/api';
import { format } from 'date-fns';

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

interface Props {
  task: Task | null;
  onSave: (data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'PENDING',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate
        ? format(new Date(task.dueDate), 'yyyy-MM-dd')
        : '',
    },
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: TaskFormData) => {
    await onSave({
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || null,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div className="bg-cream w-full sm:max-w-lg animate-slide-up sm:animate-scale-in">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-100">
          <div>
            <h2 className="font-display text-xl text-ink">
              {task ? 'Edit task' : 'New task'}
            </h2>
            <p className="font-mono text-xs text-ink-400 mt-0.5 uppercase tracking-widest">
              {task ? 'Update details below' : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-ink-400 hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="label">Task title *</label>
            <input
              type="text"
              className={`input-field ${errors.title ? 'border-clay' : ''}`}
              placeholder="What needs to be done?"
              autoFocus
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-clay font-mono">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="Add more context…"
              {...register('description')}
            />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input-field" {...register('status')}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input-field" {...register('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input-field" {...register('dueDate')} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Saving…
                </>
              ) : task ? (
                'Save changes'
              ) : (
                'Create task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
