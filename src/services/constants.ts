/**
 * Service Layer Constants
 * Single source of truth for shared values across all services
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// USER IDENTITY
// ============================================================================

/**
 * Mock user ID for local development (fallback only)
 * Used when auth is not available in development mode
 */
export const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';
export const MOCK_USER_IDENTIFIER = 'local-dev-user-001';

// Cache for profile ID to avoid repeated lookups
let cachedProfileId: string | null = null;
let cachedAuthUserId: string | null = null;

/**
 * Get current user's profile ID from Supabase Auth
 * Returns the profile.id (UUID) linked to auth.uid()
 *
 * @param fallbackUserId - Optional fallback for development/testing
 * @returns Profile ID or null if not authenticated
 */
export async function getCurrentUserId(fallbackUserId?: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Use cache if auth user hasn't changed
      if (cachedAuthUserId === user.id && cachedProfileId) {
        return cachedProfileId;
      }

      // Look up profile ID from auth user
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profile && !error) {
        // Cache the result
        cachedAuthUserId = user.id;
        cachedProfileId = profile.id;
        return profile.id;
      }

      // Profile not found - might be newly created, try again without cache
      console.warn('Profile not found for auth user:', user.id);
    }

    // Development fallback - only in dev mode
    if (import.meta.env.DEV && fallbackUserId) {
      return fallbackUserId;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);

    // Development fallback on error
    if (import.meta.env.DEV && fallbackUserId) {
      return fallbackUserId;
    }

    return null;
  }
}

/**
 * Synchronous version for contexts that already have the user
 * Use this when you already have the profile ID from AuthContext
 */
export function getCurrentUserIdSync(profileId?: string | null): string | null {
  return profileId || (import.meta.env.DEV ? MOCK_USER_ID : null);
}

/**
 * Clear the profile ID cache (call on logout)
 */
export function clearUserCache(): void {
  cachedProfileId = null;
  cachedAuthUserId = null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Check if using mock user (for conditional logic in dev)
 */
export function isUsingMockUser(userId?: string | null): boolean {
  return !userId || userId === MOCK_USER_ID;
}

// ============================================================================
// POSTGRES ERROR CODES
// ============================================================================

export const POSTGRES_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  STRING_DATA_RIGHT_TRUNCATION: '22001',
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature flags for gradual rollout
 * AUTH_MIGRATION: Set USE_MOCK_DATA to false when ready
 */
export const FEATURE_FLAGS = {
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  ENABLE_OPTIMISTIC_UPDATES: true,
  ENABLE_LOCAL_STORAGE_CACHE: true,
} as const;
