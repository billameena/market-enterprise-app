import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../ui/Input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, placeholder = 'Search products...', className, autoFocus }: SearchBarProps) {
  const [value, setValue] = useState('');
  useDebounce(value, 400);

  // Effect: notify parent when debounced value changes
  // This is handled via the parent using debouncedValue directly
  // or by calling onSearch inside a useEffect in the parent

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    // For immediate feedback we also debounce in the parent via useDebounce
    onSearch(v);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={className}>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        leftAddon={<Search className="w-4 h-4" />}
        rightAddon={
          value ? (
            <button onClick={handleClear} aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          ) : undefined
        }
      />
    </div>
  );
}
