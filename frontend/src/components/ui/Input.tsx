import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, leftAddon, rightAddon, wrapperClassName, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-surface-700">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 text-surface-400 pointer-events-none">{leftAddon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900',
            'placeholder:text-surface-400',
            'transition-colors duration-150',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'disabled:bg-surface-50 disabled:cursor-not-allowed disabled:text-surface-400',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            leftAddon && 'pl-10',
            rightAddon && 'pr-10',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3 text-surface-400">{rightAddon}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-surface-500">
          {helperText}
        </p>
      )}
    </div>
  );
});
