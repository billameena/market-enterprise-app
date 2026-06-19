import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { VendorDashboard } from '../features/vendor/components/VendorDashboard';
import { Button } from '../components/ui/Button';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { vendorService } from '../services/vendor.service';
import { api } from '../utils/api';
import type { AuthUser } from '../types/auth.types';
import toast from 'react-hot-toast';

function PendingReview() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-surface-900">Application Under Review</h2>
      <p className="text-surface-600">
        Your vendor application has been received and is currently under review.
        We'll notify you within 2–3 business days.
      </p>
      <Link to="/" className="inline-block text-sm text-primary-600 hover:text-primary-700 font-medium">
        Back to home
      </Link>
    </div>
  );
}

function VendorApplyForm() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    description: '',
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      vendorService.applyForVendor({
        businessName: form.businessName,
        businessEmail: form.businessEmail,
        businessPhone: form.businessPhone || undefined,
        description: form.description || undefined,
      }),
    onSuccess: async () => {
      toast.success("Application submitted! Redirecting to your dashboard…");
      // Backend has already set role → VENDOR; refresh the auth store so the
      // UI immediately reflects the new role without requiring a re-login.
      try {
        const fresh = await api.get<AuthUser>('/users/me');
        updateUser(fresh.data);
      } catch {
        // fallback: optimistically update role
        updateUser({ role: 'VENDOR' });
      }
      // Small delay so the toast is readable before navigation
      setTimeout(() => navigate({ to: '/vendor/dashboard' }), 1200);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('already have a vendor application')) {
        setIsPending(true);
      } else {
        toast.error(msg || 'Failed to submit application');
      }
    },
  });

  if (isPending) return <PendingReview />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyMutation.mutate();
  }

  return (
    <div className="max-w-lg mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-surface-900">Become a Vendor</h1>
        <p className="text-surface-600">Apply to sell on our marketplace and reach thousands of customers.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Setup Your Store', desc: 'Create your brand and customize your storefront.' },
          { title: 'Add Products', desc: 'List your products with photos and descriptions.' },
          { title: 'Start Selling', desc: 'Get orders and grow your business.' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-surface-50 rounded-xl border border-surface-100">
            <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">
              {i + 1}
            </div>
            <p className="font-semibold text-surface-900 text-sm">{item.title}</p>
            <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-surface-200 rounded-2xl p-6">
        <h2 className="font-semibold text-surface-900">Your Application</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-700">
            Business Name <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={form.businessName}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
            placeholder="Acme Store"
            className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-700">
            Business Email <span className="text-danger-500">*</span>
          </label>
          <input
            type="email"
            required
            value={form.businessEmail}
            onChange={(e) => setForm((f) => ({ ...f, businessEmail: e.target.value }))}
            placeholder="contact@yourbusiness.com"
            className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-700">Business Phone</label>
          <input
            type="tel"
            value={form.businessPhone}
            onChange={(e) => setForm((f) => ({ ...f, businessPhone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-700">Tell us about your business</label>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe what you sell and your experience…"
            className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={applyMutation.isPending}
          disabled={!form.businessName.trim() || !form.businessEmail.trim()}
        >
          Apply Now
        </Button>
      </form>
    </div>
  );
}

export function VendorDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-500 mb-4">Please sign in to access the vendor dashboard.</p>
        <Link to="/login" search={{ redirect: '/vendor/dashboard' }} className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 h-10 px-4 text-sm rounded-lg">
          Sign In
        </Link>
      </div>
    );
  }

  if (user.role === 'CUSTOMER') {
    return <VendorApplyForm />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Vendor Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage your store, products and orders</p>
        </div>
      </div>
      <VendorDashboard />
    </div>
  );
}
