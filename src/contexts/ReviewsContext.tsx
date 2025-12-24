import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  createReview as createReviewApi,
  getReviewsByCampId,
  markReviewHelpful,
  hasUserReviewedCamp,
  ReviewRecord,
  CreateReviewInput,
} from '@/services/reviewsFavoritesCrud';

export interface Review {
  id: string;
  campId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  title?: string;
  avatarUrl?: string;
}

interface ReviewsContextType {
  reviews: Review[];
  isLoading: boolean;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpful'>, bookingId?: string) => Promise<{ success: boolean; error?: string }>;
  getReviewsByCamp: (campId: string) => Review[];
  fetchReviewsByCamp: (campId: string) => Promise<void>;
  markHelpful: (reviewId: string) => Promise<void>;
  hasReviewed: (campId: string) => Promise<boolean>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Convert Supabase record to UI Review type
function mapRecordToReview(record: ReviewRecord): Review {
  return {
    id: record.id,
    campId: record.camp_id,
    userId: record.user_id,
    userName: record.profiles?.name || 'Anonymous',
    rating: record.rating,
    comment: record.comment,
    createdAt: record.created_at,
    helpful: record.helpful_count,
    title: record.title,
    avatarUrl: record.profiles?.avatar_url,
  };
}

/**
 * ReviewsProvider - Manages reviews with Supabase as primary source
 *
 * Data flow:
 * 1. Start with empty reviews
 * 2. Fetch from Supabase per camp on demand
 * 3. Cache fetched camps to avoid re-fetching
 *
 * AUTH_MIGRATION: Currently uses MOCK_USER_ID via service layer
 */
export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedCamps, setFetchedCamps] = useState<Set<string>>(new Set());

  // Fetch reviews for a specific camp from Supabase
  const fetchReviewsByCamp = useCallback(async (campId: string) => {
    // Skip if already fetched
    if (fetchedCamps.has(campId)) return;

    setIsLoading(true);
    try {
      const result = await getReviewsByCampId(campId);
      if (result.success && result.data) {
        const dbReviews = result.data.map(mapRecordToReview);

        // Replace reviews for this camp with DB data
        setReviews(prev => {
          const otherCampReviews = prev.filter(r => r.campId !== campId);
          return [...dbReviews, ...otherCampReviews];
        });

        setFetchedCamps(prev => new Set(prev).add(campId));
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchedCamps]);

  // Add a new review via Supabase
  const addReview = useCallback(async (
    review: Omit<Review, 'id' | 'createdAt' | 'helpful'>,
    bookingId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const input: CreateReviewInput = {
      campId: review.campId,
      bookingId,
      rating: review.rating,
      comment: review.comment,
      title: review.title,
    };

    const result = await createReviewApi(input, !bookingId); // Skip booking check if no bookingId

    if (result.success && result.data) {
      const newReview = mapRecordToReview(result.data);
      // Use the provided userName if profile name is not available
      newReview.userName = newReview.userName === 'Anonymous' ? review.userName : newReview.userName;

      setReviews(prev => [newReview, ...prev]);
      return { success: true };
    }

    return { success: false, error: result.error };
  }, []);

  // Get reviews for a camp (from local state)
  const getReviewsByCamp = useCallback((campId: string) => {
    return reviews.filter(r => r.campId === campId);
  }, [reviews]);

  // Mark a review as helpful
  const markHelpful = useCallback(async (reviewId: string) => {
    // Optimistic update
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      )
    );

    const result = await markReviewHelpful(reviewId);
    if (!result.success) {
      // Rollback on error
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId ? { ...r, helpful: r.helpful - 1 } : r
        )
      );
      console.error('Mark helpful failed:', result.error);
    }
  }, []);

  // Check if user has already reviewed a camp
  const hasReviewed = useCallback(async (campId: string): Promise<boolean> => {
    const result = await hasUserReviewedCamp(campId);
    return result.success ? result.data?.hasReviewed || false : false;
  }, []);

  return (
    <ReviewsContext.Provider value={{
      reviews,
      isLoading,
      addReview,
      getReviewsByCamp,
      fetchReviewsByCamp,
      markHelpful,
      hasReviewed,
    }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
