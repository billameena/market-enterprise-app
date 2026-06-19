import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => setIsOpen((o) => !o)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-48 rounded-xl bg-white shadow-lg border border-surface-200 py-1',
            align === 'right' ? 'right-0' : 'left-0',
            'animate-fade-in',
          )}
        >
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.divider && <hr className="my-1 border-surface-100" />}
              <button
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                  'hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed',
                  item.variant === 'danger'
                    ? 'text-danger-600 hover:bg-danger-50'
                    : 'text-surface-700',
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
