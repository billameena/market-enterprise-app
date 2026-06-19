import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center max-w-md px-4">
        <p className="text-8xl font-black text-primary-600 mb-4">404</p>
        <h1 className="text-3xl font-bold text-surface-900 mb-4">Page Not Found</h1>
        <p className="text-surface-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
