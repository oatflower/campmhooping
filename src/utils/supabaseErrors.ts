/**
 * Centralized Supabase Error Handling
 * Provides consistent error mapping and user-friendly messages
 */

import { POSTGRES_ERROR_CODES } from '@/services/constants';

// ============================================================================
// TYPES
// ============================================================================

export interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export interface MappedError {
  type: ErrorType;
  code: string;
  userMessage: string;
  technicalMessage: string;
  isRetryable: boolean;
  suggestedAction?: 'retry' | 'refresh' | 'contact_support' | 'check_input';
}

export type ErrorType =
  | 'unique_violation'
  | 'check_violation'
  | 'foreign_key_violation'
  | 'not_found'
  | 'validation_error'
  | 'network_error'
  | 'auth_error'
  | 'permission_denied'
  | 'unknown';

// ============================================================================
// ERROR MESSAGE MAPPINGS
// ============================================================================

/**
 * Default error messages by Postgres error code
 */
const DEFAULT_ERROR_MESSAGES: Record<string, { type: ErrorType; message: string; isRetryable: boolean }> = {
  [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: {
    type: 'unique_violation',
    message: 'This record already exists.',
    isRetryable: false,
  },
  [POSTGRES_ERROR_CODES.CHECK_VIOLATION]: {
    type: 'check_violation',
    message: 'Invalid data provided. Please check your input.',
    isRetryable: false,
  },
  [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: {
    type: 'foreign_key_violation',
    message: 'Related record not found.',
    isRetryable: false,
  },
  [POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION]: {
    type: 'validation_error',
    message: 'Required field is missing.',
    isRetryable: false,
  },
  'PGRST116': {
    type: 'not_found',
    message: 'Record not found.',
    isRetryable: false,
  },
  'PGRST301': {
    type: 'permission_denied',
    message: 'You do not have permission to perform this action.',
    isRetryable: false,
  },
};

/**
 * Context-specific error messages
 * Override defaults based on the operation context
 */
export const CONTEXT_ERROR_MESSAGES = {
  booking: {
    [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: 'These dates have already been booked. Please select different dates.',
    [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Camp not found. Please try again or select a different camp.',
    [POSTGRES_ERROR_CODES.CHECK_VIOLATION]: 'Invalid booking data. Please check your dates and try again.',
  },
  payment: {
    [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: 'A payment record already exists for this booking.',
    [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Booking not found. Cannot create payment.',
    [POSTGRES_ERROR_CODES.CHECK_VIOLATION]: 'Invalid payment data. Please check the amount and try again.',
  },
  review: {
    [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: 'You have already reviewed this camp.',
    [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Camp or booking not found.',
    [POSTGRES_ERROR_CODES.CHECK_VIOLATION]: 'Invalid review data. Rating must be between 1 and 5.',
  },
  favorite: {
    [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]: 'This camp is already in your favorites.',
    [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Camp not found.',
  },
} as const;

export type ErrorContext = keyof typeof CONTEXT_ERROR_MESSAGES;

// ============================================================================
// ERROR MAPPING FUNCTIONS
// ============================================================================

/**
 * Map a Supabase error to a user-friendly format
 */
export function mapSupabaseError(
  error: SupabaseError,
  context?: ErrorContext
): MappedError {
  const code = error.code || 'unknown';

  // Check for context-specific message first
  if (context && CONTEXT_ERROR_MESSAGES[context]?.[code]) {
    const defaultMapping = DEFAULT_ERROR_MESSAGES[code];
    return {
      type: defaultMapping?.type || 'unknown',
      code,
      userMessage: CONTEXT_ERROR_MESSAGES[context][code],
      technicalMessage: error.message || 'Unknown error',
      isRetryable: defaultMapping?.isRetryable ?? false,
      suggestedAction: getSuggestedAction(defaultMapping?.type || 'unknown'),
    };
  }

  // Fall back to default message
  const mapping = DEFAULT_ERROR_MESSAGES[code];
  if (mapping) {
    return {
      type: mapping.type,
      code,
      userMessage: mapping.message,
      technicalMessage: error.message || 'Unknown error',
      isRetryable: mapping.isRetryable,
      suggestedAction: getSuggestedAction(mapping.type),
    };
  }

  // Check for network errors
  if (isNetworkError(error)) {
    return {
      type: 'network_error',
      code: 'NETWORK_ERROR',
      userMessage: 'Connection error. Please check your internet and try again.',
      technicalMessage: error.message || 'Network error',
      isRetryable: true,
      suggestedAction: 'retry',
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    code,
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: error.message || 'Unknown error',
    isRetryable: true,
    suggestedAction: 'retry',
  };
}

/**
 * Get a simple user message from an error
 */
export function getUserErrorMessage(
  error: SupabaseError,
  context?: ErrorContext,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  const mapped = mapSupabaseError(error, context);
  return mapped.userMessage || fallback;
}

/**
 * Check if an error is a specific Postgres error type
 */
export function isPostgresError(error: SupabaseError, code: string): boolean {
  return error.code === code;
}

/**
 * Check if error is a unique violation (duplicate)
 */
export function isDuplicateError(error: SupabaseError): boolean {
  return isPostgresError(error, POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) ||
    error.message?.toLowerCase().includes('duplicate key') ||
    false;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: SupabaseError): boolean {
  return error.code === 'PGRST116' ||
    error.message?.toLowerCase().includes('not found') ||
    false;
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: SupabaseError): boolean {
  const message = error.message?.toLowerCase() || '';
  return message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    false;
}

/**
 * Check if error should trigger a retry
 */
export function shouldRetry(error: SupabaseError): boolean {
  return isNetworkError(error) ||
    error.code === 'PGRST500' || // Server error
    false;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSuggestedAction(type: ErrorType): MappedError['suggestedAction'] {
  switch (type) {
    case 'network_error':
      return 'retry';
    case 'not_found':
      return 'refresh';
    case 'validation_error':
    case 'check_violation':
      return 'check_input';
    case 'permission_denied':
    case 'auth_error':
      return 'contact_support';
    default:
      return 'retry';
  }
}

// ============================================================================
// RESULT TYPE HELPERS
// ============================================================================

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  errorType?: ErrorType;
}

/**
 * Create a success result
 */
export function successResult<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/**
 * Create an error result from a Supabase error
 */
export function errorResult<T>(
  error: SupabaseError,
  context?: ErrorContext
): ServiceResult<T> {
  const mapped = mapSupabaseError(error, context);
  return {
    success: false,
    error: mapped.userMessage,
    errorCode: mapped.code,
    errorType: mapped.type,
  };
}

/**
 * Create a custom error result
 */
export function customErrorResult<T>(
  message: string,
  code = 'CUSTOM_ERROR'
): ServiceResult<T> {
  return {
    success: false,
    error: message,
    errorCode: code,
    errorType: 'validation_error',
  };
}
