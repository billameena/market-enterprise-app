import { Outlet, Link } from '@tanstack/react-router';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-surface-900">Marketplace</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
