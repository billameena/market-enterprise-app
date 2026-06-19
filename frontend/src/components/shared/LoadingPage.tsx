import { Spinner } from '../ui/Spinner';

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" className="text-primary-600" />
        <p className="text-surface-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
