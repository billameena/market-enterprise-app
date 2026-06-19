import React, { useState } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { Sidebar } from '../components/shared/Sidebar';
import { Menu, User, ShoppingBag, Store, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown } from '../components/ui/Dropdown';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearAuth, isAdmin, isVendor } = useAuth();
  const navigate = useNavigate();

  const profileMenuItems = [
    { label: 'My Profile', onClick: () => navigate({ to: '/profile' }), icon: <User className="w-4 h-4" /> },
    { label: 'My Orders', onClick: () => navigate({ to: '/orders' }), icon: <ShoppingBag className="w-4 h-4" /> },
    ...(isVendor()
      ? [{ label: 'Vendor Dashboard', onClick: () => navigate({ to: '/vendor/dashboard' }), icon: <Store className="w-4 h-4" /> }]
      : []),
    ...(isAdmin()
      ? [{ label: 'Admin Dashboard', onClick: () => navigate({ to: '/admin' }), icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
    { label: 'Settings', onClick: () => navigate({ to: '/profile' }), icon: <Settings className="w-4 h-4" />, divider: true },
    { label: 'Sign Out', onClick: clearAuth, variant: 'danger' as const, icon: <LogOut className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-white border-b border-surface-200 h-16 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-surface-700" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-100 transition-colors">
                  <Avatar
                    src={user?.avatarUrl}
                    name={user ? `${user.firstName} ${user.lastName}` : undefined}
                    size="sm"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-surface-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-surface-500">{user?.role}</p>
                  </div>
                </button>
              }
              items={profileMenuItems}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="container-narrow py-6">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
