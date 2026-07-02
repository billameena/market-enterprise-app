import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, Settings, Users, Tag, Star, Ticket, FolderTree
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Tag className="w-5 h-5" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Coupons', path: '/admin/coupons', icon: <Ticket className="w-5 h-5" /> },
  { label: 'Categories', path: '/admin/categories', icon: <FolderTree className="w-5 h-5" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

const vendorNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/vendor/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
  { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Reviews', path: '/vendor/reviews', icon: <Star className="w-5 h-5" /> },
  { label: 'Analytics', path: '/vendor/analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Store Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuth();
  const navItems = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? adminNavItems : vendorNavItems;
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-64 bg-surface-900 text-white flex flex-col shrink-0',
          'transform transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0 lg:h-full',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Link to="/" onClick={onClose} className="flex items-center gap-3 px-6 py-5 border-b border-surface-700 hover:bg-surface-800 transition-colors">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg">Marketplace</span>
        </Link>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-400 hover:bg-surface-800 hover:text-white',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-surface-700 p-4">
          <p className="text-xs text-surface-500 text-center">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
      </aside>
    </>
  );
}
