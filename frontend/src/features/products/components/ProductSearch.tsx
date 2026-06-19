import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { useDebounce } from '../../../hooks/useDebounce';
import { Spinner } from '../../../components/ui/Spinner';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
  store: { name: string };
}

interface ProductSearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
  fullWidth?: boolean;
}

export function ProductSearch({ placeholder = 'Search products...', autoFocus = false, onClose, fullWidth = false }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, isFetching } = useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: () =>
      api
        .get<{ products: SearchResult[] }>('/products/search', {
          params: { q: debouncedQuery, limit: 6 },
        })
        .then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length >= 2);
  }

  function handleClear() {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleSelect(slug: string) {
    setQuery('');
    setIsOpen(false);
    onClose?.();
    navigate({ to: '/products/$slug', params: { slug } });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onClose?.();
      navigate({ to: '/products', search: { q: query.trim(), categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined } });
    }
  }

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : 'w-full max-w-lg'}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isFetching && <Spinner size="sm" />}
            {query && !isFetching && (
              <button type="button" onClick={handleClear} className="text-surface-400 hover:text-surface-600 transition-colors">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {isOpen && debouncedQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-surface-100 overflow-hidden z-50">
          {isFetching && !data ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : data?.products && data.products.length > 0 ? (
            <>
              <ul className="divide-y divide-surface-50">
                {data.products.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(product.slug)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left"
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-surface-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{product.name}</p>
                        <p className="text-xs text-surface-500 truncate">{product.store.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary-600 flex-shrink-0">
                        ${product.price.toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-surface-100 bg-surface-50">
                <button
                  type="button"
                  onClick={handleSubmit as unknown as React.MouseEventHandler}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  View all results for "{debouncedQuery}"
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-surface-500">No products found for "{debouncedQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
