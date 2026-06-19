import { useParams } from '@tanstack/react-router';
import { useProduct } from '../features/products/hooks/useProduct';
import { ProductDetail } from '../features/products/components/ProductDetail';
import { Spinner } from '../components/ui/Spinner';
import { NotFound } from './NotFound';

export function ProductDetailPage() {
  const { slug } = useParams({ from: '/main/products/$slug' });
  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  return <ProductDetail product={product} />;
}
