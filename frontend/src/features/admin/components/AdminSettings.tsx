import { useAuth } from '../../../hooks/useAuth';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-surface-100 last:border-0">
      <span className="text-sm text-surface-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-surface-900 break-all">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-6 space-y-1">
      <h3 className="font-bold text-surface-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <Section title="Platform Info">
        <InfoRow label="Platform" value="Enterprise Marketplace" />
        <InfoRow label="Version" value="1.0.0" />
        <InfoRow label="Environment" value={import.meta.env.MODE === 'production' ? 'Production' : 'Development'} />
        <InfoRow label="API Base URL" value={import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'} />
      </Section>

      <Section title="Your Account">
        <InfoRow label="Name" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—'} />
        <InfoRow label="Email" value={user?.email ?? '—'} />
        <InfoRow label="Role" value={user?.role ?? '—'} />
        <InfoRow label="User ID" value={user?.id ?? '—'} />
      </Section>

      <Section title="Role Reference">
        <div className="space-y-2">
          {[
            { role: 'SUPER_ADMIN', level: 100, desc: 'Full platform access — can promote users, delete any data, manage platform-wide settings' },
            { role: 'ADMIN', level: 80, desc: 'Manage users, approve vendors, moderate products, manage coupons and categories' },
            { role: 'SUPPORT', level: 60, desc: 'Read access to orders and users; can resolve disputes' },
            { role: 'VENDOR', level: 40, desc: 'Manage own products, view own orders and analytics' },
            { role: 'CUSTOMER', level: 20, desc: 'Shop, place orders, write reviews' },
          ].map(({ role, level, desc }) => (
            <div key={role} className="flex items-start gap-3 py-2.5 border-b border-surface-50 last:border-0">
              <span className="font-mono text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded shrink-0 mt-0.5">
                {level}
              </span>
              <div>
                <span className="text-sm font-semibold text-surface-900">{role}</span>
                <p className="text-xs text-surface-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Quick Links">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard' },
            { label: 'Render Dashboard', url: 'https://dashboard.render.com' },
            { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard' },
            { label: 'Upstash Console', url: 'https://console.upstash.com' },
            { label: 'Resend Dashboard', url: 'https://resend.com' },
            { label: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' },
          ].map(({ label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
            >
              {label}
              <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
