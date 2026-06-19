import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Search, User, Menu, Bell, ShoppingBag, Settings, LogOut, Store, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth, isAdmin, isVendor } = useAuth();
  const { itemCount, toggleCart } = useCartStore();

  const userMenuItems = [
    { label: 'My Profile', onClick: () => navigate({ to: '/profile' }), icon: <User className="w-4 h-4" /> },
    { label: 'My Orders', onClick: () => navigate({ to: '/orders' }), icon: <ShoppingBag className="w-4 h-4" /> },
    ...(isVendor() || user?.role === 'CUSTOMER'
      ? [{ label: isVendor() ? 'Vendor Dashboard' : 'Become a Vendor', onClick: () => navigate({ to: '/vendor/dashboard' }), icon: <Store className="w-4 h-4" /> }]
      : []),
    ...(isAdmin()
      ? [{ label: 'Admin Dashboard', onClick: () => navigate({ to: '/admin' }), icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
    { label: 'Settings', onClick: () => navigate({ to: '/profile' }), icon: <Settings className="w-4 h-4" />, divider: true },
    { label: 'Sign Out', onClick: clearAuth, variant: 'danger' as const, icon: <LogOut className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-narrow">
        <div className="flex h-16 items-center gap-4">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-surface-700" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-surface-900 hidden sm:block">Marketplace</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 ml-8">
            <Link
              to="/products"
              search={{ q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }}
              className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/vendor/dashboard"
              className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
            >
              {isVendor() ? 'My Store' : 'Sell'}
            </Link>
            <Link
              to="/ai-demo"
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-primary-100 text-purple-700 hover:from-purple-200 hover:to-primary-200 transition-all"
            >
              <span>✨</span>
              AI Demo
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="Search">
              <Search className="w-5 h-5" />
            </Button>

            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart className="w-5 h-5 text-surface-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </Button>
                <Dropdown
                  align="right"
                  trigger={
                    <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-100 transition-colors">
                      <Avatar
                        src={user.avatarUrl}
                        name={`${user.firstName} ${user.lastName}`}
                        size="sm"
                      />
                    </button>
                  }
                  items={userMenuItems}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  search={{ redirect: undefined }}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
