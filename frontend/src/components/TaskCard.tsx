'use client';

import { Task } from '@/lib/api';
import { format, isValid, parseISO, isPast } from 'date-fns';
import clsx from 'clsx';

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

const statusConfig = {
  PENDING: { label: 'Pending', className: 'bg-amber-task/15 text-ink-600 border border-amber-task/40', dot: 'bg-amber-task' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-sage/15 text-sage-dark border border-sage/40', dot: 'bg-sage' },
  COMPLETED: { label: 'Completed', className: 'bg-ink-100 text-ink-400 border border-ink-200', dot: 'bg-ink-400' },
};

const priorityConfig = {
  LOW: { label: 'Low', className: 'text-ink-400', dot: 'bg-ink-300' },
  MEDIUM: { label: 'Medium', className: 'text-amber-task', dot: 'bg-amber-task' },
  HIGH: { label: 'High', className: 'text-clay', dot: 'bg-clay' },
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const isCompleted = task.status === 'COMPLETED';

  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = dueDate && isValid(dueDate) && isPast(dueDate) && !isCompleted;

  return (
    <div
      className={clsx(
        'task-card flex flex-col group relative',
        isCompleted && 'opacity-70'
      )}
    >
      {/* Priority stripe */}
      <div
        className={clsx(
          'absolute top-0 left-0 w-1 h-full',
          task.priority === 'HIGH' && 'bg-clay',
          task.priority === 'MEDIUM' && 'bg-amber-task',
          task.priority === 'LOW' && 'bg-ink-200'
        )}
      />

      <div className="pl-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={clsx('status-badge', status.className)}>
            <span className={clsx('priority-dot', status.dot)} />
            {status.label}
          </span>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            <button
              onClick={onToggle}
              title="Toggle status"
              className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-sage hover:bg-sage/10 transition-colors text-xs"
            >
              ↻
            </button>
            <button
              onClick={onEdit}
              title="Edit task"
              className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-ink hover:bg-ink-100 transition-colors text-xs"
            >
              ✎
            </button>
            <button
              onClick={onDelete}
              title="Delete task"
              className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-clay hover:bg-clay/10 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={clsx(
            'font-body font-medium text-ink mb-2 leading-snug',
            isCompleted && 'line-through text-ink-400'
          )}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="font-body text-xs text-ink-400 leading-relaxed mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink-100">
          <div className="flex items-center gap-1.5">
            <span className={clsx('priority-dot', priority.dot)} />
            <span className={clsx('font-mono text-xs', priority.className)}>
              {priority.label}
            </span>
          </div>

          {dueDate && isValid(dueDate) && (
            <span
              className={clsx(
                'font-mono text-xs',
                isOverdue ? 'text-clay font-medium' : 'text-ink-400'
              )}
            >
              {isOverdue ? '⚠ ' : ''}
              {format(dueDate, 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
