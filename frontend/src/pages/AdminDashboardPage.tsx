import { AdminDashboard } from '../features/admin/components/AdminDashboard';

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
        <p className="text-surface-500 text-sm mt-0.5">Monitor and manage the marketplace</p>
      </div>
      <AdminDashboard />
    </div>
  );
}
