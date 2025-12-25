/**
 * Reviews & Favorites CRUD Service
 * Handles Supabase operations for reviews and favorites
 *
 * AUTH: Uses Supabase Auth via getCurrentUserId()
 * RLS policies enforce user ownership on database level
 */

import { supabase } from '@/lib/supabase';
import {
  MOCK_USER_ID,
  getCurrentUserId,
  POSTGRES_ERROR_CODES,
} from './constants';
import {
  getUserErrorMessage,
  errorResult,
  successResult,
  customErrorResult,
  isDuplicateError,
  type ServiceResult,
} from '@/utils/supabaseErrors';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateReviewInput {
  campId: string;
  bookingId?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  ratingCleanliness?: number;
  ratingLocation?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  images?: string[];
}

export interface ReviewRecord {
  id: string;
  user_id: string;
  camp_id: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment: string;
  rating_cleanliness?: number;
  rating_location?: number;
  rating_value?: number;
  rating_communication?: number;
  images?: string[];
  host_response?: string;
  host_response_at?: string;
  helpful_count: number;
  status: string;
  created_at: string;
  updated_at?: string;
  // Joined data
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface FavoriteRecord {
  id: string;
  user_id: string;
  camp_id: string;
  list_name: string;
  notes?: string;
  created_at: string;
  // Joined data
  camps?: {
    id: string;
    name: string;
    location?: string;
    province?: string;
    images?: string[];
    price_per_night?: number;
    rating_average?: number;
  };
}

export interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

const REVIEW_ERROR_MESSAGES: Record<string, string> = {
  [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: 'You have already reviewed this camp.',
  [POSTGRES_ERROR_CODES.CHECK_VIOLATION]: 'Invalid review data. Rating must be between 1 and 5.',
  [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Camp or booking not found.',
  'rating_invalid': 'Rating must be between 1 and 5.',
  'comment_required': 'Review comment is required.',
  'booking_not_completed': 'You can only review after completing your stay.',
  'default': 'Failed to submit review. Please try again.',
};

const FAVORITE_ERROR_MESSAGES: Record<string, string> = {
  [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: 'This camp is already in your favorites.',
  [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Camp not found.',
  'default': 'Failed to update favorites. Please try again.',
};

function getReviewErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code && REVIEW_ERROR_MESSAGES[error.code]) {
    return REVIEW_ERROR_MESSAGES[error.code];
  }
  if (error.message?.includes('duplicate key')) {
    return REVIEW_ERROR_MESSAGES[POSTGRES_ERROR_CODES.UNIQUE_VIOLATION];
  }
  return error.message || REVIEW_ERROR_MESSAGES['default'];
}

function getFavoriteErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code && FAVORITE_ERROR_MESSAGES[error.code]) {
    return FAVORITE_ERROR_MESSAGES[error.code];
  }
  if (error.message?.includes('duplicate key')) {
    return FAVORITE_ERROR_MESSAGES[POSTGRES_ERROR_CODES.UNIQUE_VIOLATION];
  }
  return error.message || FAVORITE_ERROR_MESSAGES['default'];
}

// ============================================================================
// REVIEWS CRUD
// ============================================================================

/**
 * CREATE: Submit a new review
 * Basic guard: Optionally verify booking is completed
 * Requires authentication
 */
export async function createReview(
  input: CreateReviewInput,
  skipBookingCheck = false,
  userId?: string
): Promise<CrudResult<ReviewRecord>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return {
      success: false,
      error: 'Authentication required to submit review.',
      errorCode: 'auth_required',
    };
  }

  // Validate rating
  if (!input.rating || input.rating < 1 || input.rating > 5) {
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['rating_invalid'],
      errorCode: 'rating_invalid',
    };
  }

  // Validate comment
  if (!input.comment || input.comment.trim().length < 10) {
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['comment_required'],
      errorCode: 'comment_required',
    };
  }

  try {
    // Optional: Verify booking is completed (basic guard)
    if (input.bookingId && !skipBookingCheck) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('status, end_date')
        .eq('id', input.bookingId)
        .eq('user_id', currentUserId)
        .single();

      if (bookingError || !booking) {
        return {
          success: false,
          error: 'Booking not found.',
          errorCode: 'booking_not_found',
        };
      }

      // Check if stay is completed (end_date has passed or status is completed)
      const endDate = new Date(booking.end_date);
      const now = new Date();
      if (booking.status !== 'completed' && endDate > now) {
        return {
          success: false,
          error: REVIEW_ERROR_MESSAGES['booking_not_completed'],
          errorCode: 'booking_not_completed',
        };
      }
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: currentUserId,
        camp_id: input.campId,
        booking_id: input.bookingId || null,
        rating: input.rating,
        title: input.title || null,
        comment: input.comment.trim(),
        rating_cleanliness: input.ratingCleanliness || null,
        rating_location: input.ratingLocation || null,
        rating_value: input.ratingValue || null,
        rating_communication: input.ratingCommunication || null,
        images: input.images || [],
        status: 'published', // Auto-publish for now
      })
      .select()
      .single();

    if (error) {
      console.error('Review creation error:', error);
      return {
        success: false,
        error: getReviewErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: data as ReviewRecord,
    };
  } catch (err) {
    console.error('Unexpected review error:', err);
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * READ: Get reviews for a specific camp
 * Returns published reviews with user info
 */
export async function getReviewsByCampId(
  campId: string,
  limit = 50
): Promise<CrudResult<ReviewRecord[]>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          name,
          avatar_url
        )
      `)
      .eq('camp_id', campId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Reviews fetch error:', error);
      return {
        success: false,
        error: getReviewErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: (data || []) as ReviewRecord[],
    };
  } catch (err) {
    console.error('Unexpected reviews fetch error:', err);
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * READ: Check if user has already reviewed a camp
 */
export async function hasUserReviewedCamp(
  campId: string,
  userId?: string
): Promise<CrudResult<{ hasReviewed: boolean; review?: ReviewRecord }>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return { success: true, data: { hasReviewed: false } };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('camp_id', campId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (error) {
      console.error('Review check error:', error);
      return {
        success: false,
        error: getReviewErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: {
        hasReviewed: !!data,
        review: data as ReviewRecord | undefined,
      },
    };
  } catch (err) {
    console.error('Unexpected review check error:', err);
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * UPDATE: Host responds to a review
 * RLS policy allows hosts to update reviews for their camps
 */
export async function addHostResponse(
  reviewId: string,
  response: string,
  hostId?: string
): Promise<CrudResult<ReviewRecord>> {
  const currentUserId = await getCurrentUserId(hostId);

  if (!currentUserId) {
    return {
      success: false,
      error: 'Authentication required to respond to reviews.',
      errorCode: 'auth_required',
    };
  }

  if (!response || response.trim().length < 10) {
    return {
      success: false,
      error: 'Response must be at least 10 characters.',
      errorCode: 'response_required',
    };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        host_response: response.trim(),
        host_response_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select(`
        *,
        profiles (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Host response error:', error);
      return {
        success: false,
        error: getReviewErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: data as ReviewRecord,
    };
  } catch (err) {
    console.error('Unexpected host response error:', err);
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * READ: Get reviews for all camps owned by host
 */
export async function getHostReviews(
  hostId?: string
): Promise<CrudResult<ReviewRecord[]>> {
  const currentUserId = await getCurrentUserId(hostId);

  if (!currentUserId) {
    return {
      success: false,
      error: 'Authentication required to view reviews.',
      errorCode: 'auth_required',
    };
  }

  try {
    // First get all camps owned by this host
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id, name')
      .eq('host_id', currentUserId);

    if (campsError) {
      console.error('Camps fetch error:', campsError);
      return {
        success: false,
        error: 'Failed to fetch camps.',
        errorCode: campsError.code,
      };
    }

    if (!camps || camps.length === 0) {
      return { success: true, data: [] };
    }

    const campIds = camps.map(c => c.id);

    // Get reviews for those camps
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          name,
          avatar_url
        ),
        camps (
          id,
          name
        )
      `)
      .in('camp_id', campIds)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Reviews fetch error:', error);
      return {
        success: false,
        error: getReviewErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: (data || []) as ReviewRecord[],
    };
  } catch (err) {
    console.error('Unexpected host reviews fetch error:', err);
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * UPDATE: Increment helpful count
 */
export async function markReviewHelpful(
  reviewId: string
): Promise<CrudResult<ReviewRecord>> {
  try {
    // Use RPC or raw SQL for atomic increment
    const { data, error } = await supabase.rpc('increment_helpful_count', {
      review_id: reviewId,
    });

    // Fallback if RPC doesn't exist: fetch and update
    if (error && error.message?.includes('function')) {
      const { data: current } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      const { data: updated, error: updateError } = await supabase
        .from('reviews')
        .update({ helpful_count: (current?.helpful_count || 0) + 1 })
        .eq('id', reviewId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: getReviewErrorMessage(updateError),
          errorCode: updateError.code,
        };
      }

      return {
        success: true,
        data: updated as ReviewRecord,
      };
    }

    if (error) {
      return {
        success: false,
        error: getReviewErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: data as ReviewRecord,
    };
  } catch (err) {
    console.error('Unexpected helpful update error:', err);
    return {
      success: false,
      error: REVIEW_ERROR_MESSAGES['default'],
    };
  }
}

// ============================================================================
// FAVORITES CRUD
// ============================================================================

/**
 * TOGGLE: Add or remove a camp from favorites
 * Returns the new state (isFavorite: true/false)
 * Requires authentication
 */
export async function toggleFavorite(
  campId: string,
  listName = 'default',
  userId?: string
): Promise<CrudResult<{ isFavorite: boolean; favorite?: FavoriteRecord }>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return {
      success: false,
      error: 'Authentication required to manage favorites.',
      errorCode: 'auth_required',
    };
  }

  try {
    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('camp_id', campId)
      .eq('user_id', currentUserId)
      .eq('list_name', listName)
      .maybeSingle();

    if (checkError) {
      console.error('Favorite check error:', checkError);
      return {
        success: false,
        error: getFavoriteErrorMessage(checkError),
        errorCode: checkError.code,
      };
    }

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Favorite delete error:', deleteError);
        return {
          success: false,
          error: getFavoriteErrorMessage(deleteError),
          errorCode: deleteError.code,
        };
      }

      return {
        success: true,
        data: { isFavorite: false },
      };
    } else {
      // Add favorite
      const { data: newFavorite, error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: currentUserId,
          camp_id: campId,
          list_name: listName,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Favorite insert error:', insertError);
        return {
          success: false,
          error: getFavoriteErrorMessage(insertError),
          errorCode: insertError.code,
        };
      }

      return {
        success: true,
        data: {
          isFavorite: true,
          favorite: newFavorite as FavoriteRecord,
        },
      };
    }
  } catch (err) {
    console.error('Unexpected favorite toggle error:', err);
    return {
      success: false,
      error: FAVORITE_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * CREATE: Add to favorites (explicit add, returns error if duplicate)
 * Requires authentication
 */
export async function addFavorite(
  campId: string,
  listName = 'default',
  notes?: string,
  userId?: string
): Promise<CrudResult<FavoriteRecord>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return {
      success: false,
      error: 'Authentication required to add favorites.',
      errorCode: 'auth_required',
    };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: currentUserId,
        camp_id: campId,
        list_name: listName,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Favorite add error:', error);
      return {
        success: false,
        error: getFavoriteErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: data as FavoriteRecord,
    };
  } catch (err) {
    console.error('Unexpected favorite add error:', err);
    return {
      success: false,
      error: FAVORITE_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * DELETE: Remove from favorites
 * Requires authentication
 */
export async function removeFavorite(
  campId: string,
  listName = 'default',
  userId?: string
): Promise<CrudResult<void>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return {
      success: false,
      error: 'Authentication required to remove favorites.',
      errorCode: 'auth_required',
    };
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('camp_id', campId)
      .eq('user_id', currentUserId)
      .eq('list_name', listName);

    if (error) {
      console.error('Favorite remove error:', error);
      return {
        success: false,
        error: getFavoriteErrorMessage(error),
        errorCode: error.code,
      };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected favorite remove error:', err);
    return {
      success: false,
      error: FAVORITE_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * READ: Get all favorites for current user
 * Includes camp details via join
 */
export async function getFavorites(
  listName?: string,
  userId?: string
): Promise<CrudResult<FavoriteRecord[]>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return { success: true, data: [] };
  }

  try {
    let query = supabase
      .from('favorites')
      .select(`
        *,
        camps (
          id,
          name,
          location,
          province,
          images,
          price_per_night,
          rating_average
        )
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (listName) {
      query = query.eq('list_name', listName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Favorites fetch error:', error);
      return {
        success: false,
        error: getFavoriteErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: (data || []) as FavoriteRecord[],
    };
  } catch (err) {
    console.error('Unexpected favorites fetch error:', err);
    return {
      success: false,
      error: FAVORITE_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * READ: Check if a camp is favorited
 */
export async function isCampFavorited(
  campId: string,
  listName = 'default',
  userId?: string
): Promise<CrudResult<boolean>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return { success: true, data: false };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('camp_id', campId)
      .eq('user_id', currentUserId)
      .eq('list_name', listName)
      .maybeSingle();

    if (error) {
      console.error('Favorite check error:', error);
      return {
        success: false,
        error: getFavoriteErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: !!data,
    };
  } catch (err) {
    console.error('Unexpected favorite check error:', err);
    return {
      success: false,
      error: FAVORITE_ERROR_MESSAGES['default'],
    };
  }
}

/**
 * READ: Get favorite IDs for quick lookup (batch check)
 */
export async function getFavoriteIds(userId?: string): Promise<CrudResult<string[]>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('camp_id')
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Favorite IDs fetch error:', error);
      return {
        success: false,
        error: getFavoriteErrorMessage(error),
        errorCode: error.code,
      };
    }

    return {
      success: true,
      data: (data || []).map(f => f.camp_id),
    };
  } catch (err) {
    console.error('Unexpected favorite IDs fetch error:', err);
    return {
      success: false,
      error: FAVORITE_ERROR_MESSAGES['default'],
    };
  }
}
