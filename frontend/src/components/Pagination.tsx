'use client';

import clsx from 'clsx';

interface Props {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, hasNext, hasPrev, onChange }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show a window of pages around current
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={!hasPrev}
        className={clsx(
          'w-9 h-9 flex items-center justify-center font-mono text-sm transition-colors',
          hasPrev
            ? 'text-ink-500 hover:bg-ink-100 hover:text-ink'
            : 'text-ink-200 cursor-not-allowed'
        )}
      >
        ←
      </button>

      {visiblePages.map((p, i) => {
        const prev = visiblePages[i - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="w-9 h-9 flex items-center justify-center font-mono text-xs text-ink-300">
                …
              </span>
            )}
            <button
              onClick={() => onChange(p)}
              className={clsx(
                'w-9 h-9 flex items-center justify-center font-mono text-sm transition-colors',
                p === page
                  ? 'bg-ink text-cream'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink'
              )}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
        className={clsx(
          'w-9 h-9 flex items-center justify-center font-mono text-sm transition-colors',
          hasNext
            ? 'text-ink-500 hover:bg-ink-100 hover:text-ink'
            : 'text-ink-200 cursor-not-allowed'
        )}
      >
        →
      </button>
    </div>
  );
}
