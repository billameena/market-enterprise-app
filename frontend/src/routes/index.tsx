import React from 'react';
import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from '@tanstack/react-router';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { RoleGuard } from '../components/shared/RoleGuard';
import { useAuth } from '../hooks/useAuth';

// Pages
import { Home } from '../pages/Home';
import { Products } from '../pages/Products';
import { ProductDetailPage } from '../pages/ProductDetail';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { OrderSuccess } from '../pages/OrderSuccess';
import { Orders } from '../pages/Orders';
import { OrderDetailPage } from '../pages/OrderDetail';
import { Profile } from '../pages/Profile';
import { Wishlist } from '../pages/Wishlist';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { VendorDashboardPage } from '../pages/VendorDashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { NotFound } from '../pages/NotFound';
import { AiDemoPage } from '../pages/AiDemoPage';

// Vendor feature components
import { VendorProducts } from '../features/vendor/components/VendorProducts';
import { VendorOrders } from '../features/vendor/components/VendorOrders';
import { VendorAnalytics } from '../features/vendor/components/VendorAnalytics';

// Admin feature components
import { UserManagement } from '../features/admin/components/UserManagement';
import { VendorApproval } from '../features/admin/components/VendorApproval';
import { ProductModeration } from '../features/admin/components/ProductModeration';
import { AdminOrderManagement } from '../features/admin/components/AdminOrderManagement';
import { AdminAnalytics } from '../features/admin/components/AdminAnalytics';
import { AdminCoupons } from '../features/admin/components/AdminCoupons';
import { AdminCategories } from '../features/admin/components/AdminCategories';
import { AdminSettings } from '../features/admin/components/AdminSettings';

// ─── Layout wrappers ──────────────────────────────────────────────────────────

/** Vendor dashboard: redirect to login if not auth; customers see the plain page */
function VendorGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: undefined }} replace />;
  }
  if (user?.role === 'CUSTOMER') {
    return <>{children}</>;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

/** Vendor sub-pages: requires VENDOR or ADMIN role, always in DashboardLayout */
function VendorSubRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['VENDOR', 'ADMIN', 'SUPER_ADMIN']} redirectTo="/vendor/dashboard">
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}

/** Admin sub-pages: requires ADMIN or SUPER_ADMIN role, always in DashboardLayout */
function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}

/** Generic stub for pages not yet built */
function StubPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3">
      <h1 className="text-2xl font-bold text-surface-900">{title}</h1>
      <p className="text-surface-500">This section is coming soon.</p>
    </div>
  );
}

// ─── Root route ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFound,
});

// ─── Main layout — public + customer pages ────────────────────────────────────

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'main',
  component: MainLayout,
});

// ─── Bare layout — vendor/admin dashboard pages (no header/footer wrapper) ───
// DashboardLayout renders its own sidebar + header, so these routes must NOT
// be children of mainLayoutRoute (that would nest DashboardLayout inside
// MainLayout causing double headers and double scrollbars).

const bareLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'bare',
  component: Outlet,  // no wrapper — each route component applies DashboardLayout itself
});

// ─── Public routes ────────────────────────────────────────────────────────────

const homeRoute = createRoute({ getParentRoute: () => mainLayoutRoute, path: '/', component: Home });

const aiDemoRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/ai-demo',
  component: AiDemoPage,
});

const productsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/products',
  component: Products,
  validateSearch: (search: Record<string, unknown>) => ({
    q: search['q'] as string | undefined,
    categoryId: search['categoryId'] as string | undefined,
    sort: search['sort'] as string | undefined,
    featured: search['featured'] as boolean | undefined,
    minPrice: search['minPrice'] ? Number(search['minPrice']) : undefined,
    maxPrice: search['maxPrice'] ? Number(search['maxPrice']) : undefined,
  }),
});

const productDetailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/products/$slug',
  component: ProductDetailPage,
});

const cartRoute = createRoute({ getParentRoute: () => mainLayoutRoute, path: '/cart', component: Cart });

const checkoutRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/checkout',
  component: () => <ProtectedRoute><Checkout /></ProtectedRoute>,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/order-success',
  component: () => <ProtectedRoute><OrderSuccess /></ProtectedRoute>,
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: search['orderId'] as string,
  }),
});

const ordersRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/orders',
  component: () => <ProtectedRoute><Orders /></ProtectedRoute>,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/orders/$orderId',
  component: () => <ProtectedRoute><OrderDetailPage /></ProtectedRoute>,
});

const profileRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/profile',
  component: () => <ProtectedRoute><Profile /></ProtectedRoute>,
});

const wishlistRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/wishlist',
  component: () => <ProtectedRoute><Wishlist /></ProtectedRoute>,
});

// ─── Vendor routes (children of bareLayoutRoute) ──────────────────────────────

const vendorDashboardRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/vendor/dashboard',
  component: () => (
    <VendorGate>
      <VendorDashboardPage />
    </VendorGate>
  ),
});

const vendorProductsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/vendor/products',
  component: () => (
    <VendorSubRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">My Products</h1>
        <VendorProducts />
      </div>
    </VendorSubRoute>
  ),
});

const vendorOrdersRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/vendor/orders',
  component: () => (
    <VendorSubRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Orders</h1>
        <VendorOrders />
      </div>
    </VendorSubRoute>
  ),
});

const vendorAnalyticsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/vendor/analytics',
  component: () => (
    <VendorSubRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
        <VendorAnalytics />
      </div>
    </VendorSubRoute>
  ),
});

const vendorReviewsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/vendor/reviews',
  component: () => (
    <VendorSubRoute>
      <StubPage title="Reviews" />
    </VendorSubRoute>
  ),
});

const vendorSettingsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/vendor/settings',
  component: () => (
    <VendorSubRoute>
      <StubPage title="Store Settings" />
    </VendorSubRoute>
  ),
});

// ─── Admin routes (children of bareLayoutRoute) ───────────────────────────────

const adminDashboardRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin',
  component: () => (
    <AdminRoute>
      <AdminDashboardPage />
    </AdminRoute>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/users',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
        <UserManagement />
      </div>
    </AdminRoute>
  ),
});

const adminVendorsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/vendors',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Vendor Approvals</h1>
        <VendorApproval />
      </div>
    </AdminRoute>
  ),
});

const adminProductsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/products',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Product Moderation</h1>
        <ProductModeration />
      </div>
    </AdminRoute>
  ),
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/orders',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Order Management</h1>
        <AdminOrderManagement />
      </div>
    </AdminRoute>
  ),
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/analytics',
  component: () => (
    <AdminRoute>
      <AdminAnalytics />
    </AdminRoute>
  ),
});

const adminCouponsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/coupons',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Coupons</h1>
        <AdminCoupons />
      </div>
    </AdminRoute>
  ),
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/categories',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
        <AdminCategories />
      </div>
    </AdminRoute>
  ),
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => bareLayoutRoute,
  path: '/admin/settings',
  component: () => (
    <AdminRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <AdminSettings />
      </div>
    </AdminRoute>
  ),
});

// ─── Auth layout routes ───────────────────────────────────────────────────────

const authLayoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'auth', component: AuthLayout });

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: Login,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search['redirect'] as string | undefined,
  }),
});

const registerRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/register', component: Register });
const forgotPasswordRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/forgot-password', component: ForgotPassword });
const resetPasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/reset-password',
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search['token'] as string,
  }),
});

// ─── Route tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    homeRoute,
    aiDemoRoute,
    productsRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
    orderSuccessRoute,
    ordersRoute,
    orderDetailRoute,
    profileRoute,
    wishlistRoute,
  ]),
  bareLayoutRoute.addChildren([
    // Vendor
    vendorDashboardRoute,
    vendorProductsRoute,
    vendorOrdersRoute,
    vendorAnalyticsRoute,
    vendorReviewsRoute,
    vendorSettingsRoute,
    // Admin
    adminDashboardRoute,
    adminUsersRoute,
    adminVendorsRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminAnalyticsRoute,
    adminCouponsRoute,
    adminCategoriesRoute,
    adminSettingsRoute,
  ]),
  authLayoutRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
