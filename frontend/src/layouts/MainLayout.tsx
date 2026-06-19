import { Outlet } from '@tanstack/react-router';
import { Header } from '../components/shared/Header';
import { Footer } from '../components/shared/Footer';
import { CartDrawer } from '../features/cart/components/CartDrawer';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-narrow py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
