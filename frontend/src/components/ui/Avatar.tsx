import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary-100 text-primary-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index]!;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?';
  const colorClass = name ? getAvatarColor(name) : 'bg-surface-100 text-surface-600';

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name ?? 'Avatar'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        sizeClasses[size],
        colorClass,
        className,
      )}
      aria-label={name ?? 'Avatar'}
    >
      {initials}
    </div>
  );
}
