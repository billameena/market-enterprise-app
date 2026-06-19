import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
}

interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
}

export function usePagination(initialPage = 1, initialPageSize = 20): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
  });

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), []);
  const setPageSize = useCallback(
    (pageSize: number) => setState({ page: 1, pageSize }),
    [],
  );
  const nextPage = useCallback(() => setState((s) => ({ ...s, page: s.page + 1 })), []);
  const prevPage = useCallback(
    () => setState((s) => ({ ...s, page: Math.max(1, s.page - 1) })),
    [],
  );
  const reset = useCallback(
    () => setState({ page: initialPage, pageSize: initialPageSize }),
    [initialPage, initialPageSize],
  );

  return { ...state, setPage, setPageSize, nextPage, prevPage, reset };
}
