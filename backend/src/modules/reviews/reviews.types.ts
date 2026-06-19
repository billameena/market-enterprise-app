export interface CreateReviewInput {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
}

export interface CreateReviewReplyInput {
  content: string;
}

export interface ReviewListQuery {
  page?: number;
  pageSize?: number;
  rating?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
}
