import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { api } from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { formatDate } from '../../../utils/format';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Avatar } from '../../../components/ui/Avatar';
import { Pagination } from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import toast from 'react-hot-toast';

interface ReviewUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

interface ReviewReply {
  id: string;
  body: string;
  createdAt: string;
  store: { name: string };
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: ReviewUser;
  reply?: ReviewReply | null;
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  pages: number;
  averageRating: number;
  ratingBreakdown: Record<string, number>;
}

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

function StarRating({ value, onChange, readOnly = false }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          aria-label={`${star} star`}
        >
          {star <= display ? (
            <StarIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="w-5 h-5 text-surface-300" />
          )}
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId, averageRating, reviewCount }: ProductReviewsProps) {
  const { isAuthenticated } = useAuth();
  const { page, setPage } = usePagination();
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () =>
      api
        .get<ReviewsData>(`/reviews/product/${productId}`, { params: { page, limit: 5 } })
        .then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const currentRating = watch('rating');

  const submitMutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      api.post(`/reviews/product/${productId}`, values).then((r) => r.data),
    onSuccess: () => {
      toast.success('Review submitted!');
      reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to submit review');
    },
  });

  const ratingBreakdown = data?.ratingBreakdown ?? {};

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-6 bg-surface-50 rounded-2xl">
        <div className="flex flex-col items-center justify-center sm:min-w-[120px]">
          <span className="text-5xl font-bold text-surface-900">{averageRating.toFixed(1)}</span>
          <StarRating value={Math.round(averageRating)} readOnly />
          <span className="text-sm text-surface-500 mt-1">{reviewCount} reviews</span>
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] ?? 0;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-surface-500 w-4">{star}</span>
                <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-surface-500 w-6">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review */}
      {isAuthenticated && !showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Write a Review
        </Button>
      )}

      {isAuthenticated && showForm && (
        <div className="p-6 border border-surface-200 rounded-2xl space-y-4">
          <h3 className="font-semibold text-surface-900">Write Your Review</h3>
          <form onSubmit={handleSubmit((v) => submitMutation.mutate(v))} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-700 mb-1.5 block">Rating *</label>
              <StarRating value={currentRating} onChange={(v) => setValue('rating', v, { shouldValidate: true })} />
              {errors.rating && <p className="text-xs text-danger-600 mt-1">{errors.rating.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-surface-700 mb-1.5 block">Title</label>
              <input
                {...register('title')}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-surface-700 mb-1.5 block">Review *</label>
              <textarea
                {...register('body')}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              {errors.body && <p className="text-xs text-danger-600 mt-1">{errors.body.message}</p>}
            </div>

            <div className="flex gap-3">
              <Button type="submit" isLoading={submitMutation.isPending}>
                Submit Review
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : data?.reviews && data.reviews.length > 0 ? (
        <div className="space-y-6">
          {data.reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-surface-100 last:border-0">
              <div className="flex items-start gap-3">
                <Avatar
                  src={review.user.avatar ?? undefined}
                  name={`${review.user.firstName} ${review.user.lastName}`}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-surface-900">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Verified Purchase
                      </span>
                    )}
                    <span className="text-xs text-surface-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating value={review.rating} readOnly />
                  {review.title && (
                    <p className="font-semibold text-surface-900 mt-2">{review.title}</p>
                  )}
                  <p className="text-sm text-surface-600 mt-1 leading-relaxed">{review.body}</p>

                  {review.reply && (
                    <div className="mt-4 ml-4 p-3 bg-surface-50 rounded-lg border-l-2 border-primary-200">
                      <p className="text-xs font-semibold text-primary-700 mb-1">
                        Response from {review.reply.store.name}
                      </p>
                      <p className="text-sm text-surface-600">{review.reply.body}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {data.pages > 1 && (
            <Pagination
              meta={{ page, totalPages: data.pages, total: data.total ?? 0, pageSize: 10, hasNextPage: page < data.pages, hasPreviousPage: page > 1 }}
              onPageChange={setPage}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-surface-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
}
