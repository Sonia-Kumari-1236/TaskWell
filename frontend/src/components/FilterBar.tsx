'use client';

import { useState, useCallback } from 'react';
import { TaskFilters, TaskStatus, TaskPriority } from '@/lib/api';
import clsx from 'clsx';

interface Props {
  filters: TaskFilters;
  onChange: (f: Partial<TaskFilters>) => void;
}

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: TaskPriority | ''; label: string }[] = [
  { value: '', label: 'All priorities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export default function FilterBar({ filters, onChange }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '');

  // Debounce search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      const timer = setTimeout(() => onChange({ search: value }), 400);
      return () => clearTimeout(timer);
    },
    [onChange]
  );

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 text-sm">
            ⌕
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tasks…"
            className="input-field pl-9"
          />
          {searchValue && (
            <button
              onClick={() => { setSearchValue(''); onChange({ search: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={filters.status ?? ''}
          onChange={(e) => onChange({ status: e.target.value as TaskStatus | '' })}
          className={clsx(
            'input-field sm:w-44',
            filters.status && 'border-ink text-ink font-medium'
          )}
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority ?? ''}
          onChange={(e) => onChange({ priority: e.target.value as TaskPriority | '' })}
          className={clsx(
            'input-field sm:w-44',
            filters.priority && 'border-ink text-ink font-medium'
          )}
        >
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':');
            onChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
          }}
          className="input-field sm:w-48"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date ↑</option>
          <option value="dueDate:desc">Due date ↓</option>
          <option value="title:asc">Title A–Z</option>
          <option value="title:desc">Title Z–A</option>
        </select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSearchValue('');
            onChange({ status: '', priority: '', search: '' });
          }}
          className="font-mono text-xs text-clay hover:text-clay-dark transition-colors flex items-center gap-1.5"
        >
          <span>✕</span> Clear all filters
        </button>
      )}
    </div>
  );
}
