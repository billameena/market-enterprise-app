import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { Skeleton } from '../components/ui/Skeleton';
import type { Product, Category } from '../types/product.types';

interface HomeData {
  featuredProducts: Product[];
  newArrivals: Product[];
  categories: Category[];
  banners: Array<{ id: string; title: string; subtitle: string; imageUrl: string; linkUrl: string }>;
}

export function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.get<HomeData>('/home').then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="space-y-16">
      {/* Hero banner */}
      <section>
        {isLoading ? (
          <Skeleton className="h-[480px] rounded-2xl" />
        ) : data?.banners?.[0] ? (
          <div className="relative h-[480px] rounded-2xl overflow-hidden">
            <img
              src={data.banners[0].imageUrl}
              alt={data.banners[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="px-10 max-w-lg">
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
                  {data.banners[0].title}
                </h1>
                <p className="text-white/80 text-lg mb-6">{data.banners[0].subtitle}</p>
                <Link to={data.banners[0].linkUrl as '/products'} search={{ q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }} className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 h-11 px-6 text-base rounded-lg">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[480px] rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-700 flex items-center">
            <div className="px-10 max-w-lg">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
                Discover Amazing Products
              </h1>
              <p className="text-white/80 text-lg mb-6">
                Shop from thousands of vendors and find exactly what you need.
              </p>
              <Link to="/products" search={{ q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }} className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-surface-100 text-surface-900 hover:bg-surface-200 focus:ring-surface-400 h-11 px-6 text-base rounded-lg">
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900">Shop by Category</h2>
          <Link to="/products" search={{ q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            All Categories <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(data?.categories ?? []).slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to="/products"
                search={{ q: undefined, categoryId: cat.id, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-surface-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-center"
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-cover rounded-lg" />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-lg" />
                )}
                <span className="text-xs font-semibold text-surface-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900">Featured Products</h2>
          <Link to="/products" search={{ q: undefined, categoryId: undefined, sort: undefined, featured: true, minPrice: undefined, maxPrice: undefined }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(data?.featuredProducts ?? []).slice(0, 4).map((product) => (
              <div key={product.id} className="relative">
                <span className="absolute top-3 left-3 z-10 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Featured
                </span>
                <Link to="/products/$slug" params={{ slug: product.slug }} className="block group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-surface-100 mb-3">
                    <img
                      src={product.images?.[0]?.url ?? ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-semibold text-surface-900 line-clamp-2">{product.name}</p>
                  <p className="text-sm font-bold text-primary-700 mt-1">${product.price.toFixed(2)}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900">New Arrivals</h2>
          <Link to="/products" search={{ q: undefined, categoryId: undefined, sort: 'newest', featured: undefined, minPrice: undefined, maxPrice: undefined }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)
            : (data?.newArrivals ?? []).slice(0, 4).map((product) => (
                <Link key={product.id} to="/products/$slug" params={{ slug: product.slug }} className="block group">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-100 mb-3">
                    <img
                      src={product.images?.[0]?.url ?? ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-semibold text-surface-900 line-clamp-2">{product.name}</p>
                  <p className="text-sm font-bold text-primary-700 mt-1">${product.price.toFixed(2)}</p>
                </Link>
              ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-10 text-center">
        <h2 className="text-3xl font-black text-white mb-3">Start Selling Today</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Join thousands of vendors already selling on our marketplace. Setup takes less than 10 minutes.
        </p>
        <a href="#" className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-surface-100 text-surface-900 hover:bg-surface-200 focus:ring-surface-400 h-11 px-6 text-base rounded-lg">
          Become a Vendor
        </a>
      </section>
    </div>
  );
}
