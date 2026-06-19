import { Link } from '@tanstack/react-router';
import { HomeIcon } from '@heroicons/react/24/outline';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl font-black text-surface-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
      <p className="text-surface-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
      >
        <HomeIcon className="w-4 h-4 mr-2" />
        Go Home
      </Link>
    </div>
  );
}
