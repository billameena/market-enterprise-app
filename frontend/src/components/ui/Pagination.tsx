import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import type { PaginationMeta } from '../../types/api.types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  const { page, totalPages, hasNextPage, hasPreviousPage } = meta;

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPreviousPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-1 text-sm text-surface-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary-600 text-white'
                : 'text-surface-600 hover:bg-surface-100',
            )}
          >
            {p}
          </button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
}

function getPageNumbers(current: number, total: number): Array<number | '...'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
