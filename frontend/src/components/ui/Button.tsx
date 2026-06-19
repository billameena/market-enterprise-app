import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
  secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200 focus:ring-surface-400',
  outline: 'border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 focus:ring-primary-500',
  ghost: 'bg-transparent text-surface-700 hover:bg-surface-100 focus:ring-surface-400',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 disabled:bg-danger-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs rounded',
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
  xl: 'h-12 px-8 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});
