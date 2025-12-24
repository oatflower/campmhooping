/**
 * Booking & Payment CRUD Service
 * Handles Supabase CREATE and READ operations for bookings and payments
 *
 * AUTH: Uses Supabase Auth via getCurrentUserId()
 * RLS policies enforce user_id = get_profile_id() on database level
 */

import { supabase } from '@/lib/supabase';
import {
  MOCK_USER_ID,
  MOCK_USER_IDENTIFIER,
  getCurrentUserId,
} from './constants';
import {
  getUserErrorMessage,
  errorResult,
  successResult,
  customErrorResult,
  type ServiceResult,
} from '@/utils/supabaseErrors';

// Re-export for backward compatibility
export { MOCK_USER_ID, MOCK_USER_IDENTIFIER };

export interface CreateBookingInput {
  campId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  totalPrice: number;
  status?: 'pending' | 'processing' | 'confirmed';
  receiptUrl?: string | null;
  guestCount?: {
    adults: number;
    children: number;
    infants?: number;
  };
  paymentMethod?: 'card' | 'promptpay' | 'bank' | 'pay_at_camp';
  userId?: string; // Optional: Use authenticated user ID, defaults to MOCK_USER_ID
}

export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'card' | 'promptpay' | 'bank' | 'pay_at_camp';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  receiptUrl?: string | null;
  cardLastFour?: string;
  cardBrand?: string;
  provider?: string;
  providerTransactionId?: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  provider?: string;
  provider_transaction_id?: string;
  receipt_url?: string;
  receipt_number?: string;
  card_last_four?: string;
  card_brand?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface BookingRecord {
  id: string;
  user_id: string;
  camp_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  receipt_url?: string;
  payment_method?: string;
  guest_count?: Record<string, number>;
  created_at: string;
  updated_at?: string;
  camps?: {
    id: string;
    name: string;
    location?: string;
    images?: string[];
    price_per_night?: number;
  };
}

// Use ServiceResult from shared utilities
export type BookingResult<T> = ServiceResult<T>;

/**
 * CREATE: Insert a new booking record
 * Requires authenticated user - returns error if not logged in
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<BookingResult<BookingRecord>> {
  // Get authenticated user's profile ID
  const userId = await getCurrentUserId(input.userId);

  if (!userId) {
    return customErrorResult<BookingRecord>('Authentication required to create booking.');
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        camp_id: input.campId,
        start_date: input.startDate,
        end_date: input.endDate,
        total_price: input.totalPrice,
        status: input.status || 'pending',
        receipt_url: input.receiptUrl || null,
        guest_count: input.guestCount || { adults: 1, children: 0 },
        payment_method: input.paymentMethod || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Booking creation error:', error);
      return errorResult<BookingRecord>(error, 'booking');
    }

    return successResult(data as BookingRecord);
  } catch (err) {
    console.error('Unexpected booking error:', err);
    return customErrorResult<BookingRecord>('An unexpected error occurred. Please try again.');
  }
}

/**
 * READ: Get all bookings for current user
 * RLS policies also enforce this on database level
 */
export async function getBookings(userId?: string): Promise<BookingResult<BookingRecord[]>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return customErrorResult<BookingRecord[]>('Authentication required to view bookings.');
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        camps (
          id,
          name,
          location,
          images,
          price_per_night
        )
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Booking fetch error:', error);
      return errorResult<BookingRecord[]>(error, 'booking');
    }

    return successResult((data || []) as BookingRecord[]);
  } catch (err) {
    console.error('Unexpected fetch error:', err);
    return customErrorResult<BookingRecord[]>('Failed to fetch bookings.');
  }
}

/**
 * READ: Get a single booking by ID
 * RLS policies enforce ownership on database level
 */
export async function getBookingById(
  bookingId: string,
  userId?: string
): Promise<BookingResult<BookingRecord>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return customErrorResult<BookingRecord>('Authentication required to view booking.');
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        camps (
          id,
          name,
          location,
          images,
          price_per_night
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', currentUserId)
      .single();

    if (error) {
      console.error('Booking fetch error:', error);
      return errorResult<BookingRecord>(error, 'booking');
    }

    return successResult(data as BookingRecord);
  } catch (err) {
    console.error('Unexpected fetch error:', err);
    return customErrorResult<BookingRecord>('Failed to fetch booking.');
  }
}

/**
 * READ: Get bookings filtered by status
 * RLS policies also enforce this on database level
 */
export async function getBookingsByStatus(
  statuses: string[],
  userId?: string
): Promise<BookingResult<BookingRecord[]>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return customErrorResult<BookingRecord[]>('Authentication required to view bookings.');
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        camps (
          id,
          name,
          location,
          images,
          price_per_night
        )
      `)
      .eq('user_id', currentUserId)
      .in('status', statuses)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Booking fetch error:', error);
      return errorResult<BookingRecord[]>(error, 'booking');
    }

    return successResult((data || []) as BookingRecord[]);
  } catch (err) {
    console.error('Unexpected fetch error:', err);
    return customErrorResult<BookingRecord[]>('Failed to fetch bookings.');
  }
}

/**
 * Check if dates are available for a camp
 * Returns true if no conflicting bookings exist
 */
export async function checkDateAvailability(
  campId: string,
  startDate: string,
  endDate: string
): Promise<BookingResult<{ available: boolean; conflicts: BookingRecord[] }>> {
  try {
    // Check for overlapping bookings (excluding cancelled)
    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, status')
      .eq('camp_id', campId)
      .in('status', ['pending', 'processing', 'confirmed'])
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (error) {
      console.error('Availability check error:', error);
      return errorResult(error, 'booking');
    }

    return successResult({
      available: !data || data.length === 0,
      conflicts: (data || []) as BookingRecord[],
    });
  } catch (err) {
    console.error('Unexpected availability check error:', err);
    return customErrorResult('Failed to check availability.');
  }
}

// ============================================================================
// PAYMENT CRUD OPERATIONS
// ============================================================================

/**
 * CREATE: Insert a new payment record
 * Called AFTER booking creation succeeds
 * Failure-safe: Returns error result instead of throwing
 */
export async function createPayment(
  input: CreatePaymentInput
): Promise<BookingResult<PaymentRecord>> {
  // Validate amount
  if (!input.amount || input.amount <= 0) {
    return customErrorResult<PaymentRecord>('Payment amount must be greater than zero.');
  }

  try {
    // Determine payment status based on method
    const paymentStatus = input.status || (
      input.paymentMethod === 'card' ? 'completed' :
      input.paymentMethod === 'pay_at_camp' ? 'pending' : 'processing'
    );

    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: input.bookingId,
        amount: input.amount,
        currency: input.currency || 'THB',
        payment_method: input.paymentMethod,
        status: paymentStatus,
        receipt_url: input.receiptUrl || null,
        card_last_four: input.cardLastFour || null,
        card_brand: input.cardBrand || null,
        provider: input.provider || 'manual',
        provider_transaction_id: input.providerTransactionId || null,
        completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Payment creation error:', error);
      return errorResult<PaymentRecord>(error, 'payment');
    }

    return successResult(data as PaymentRecord);
  } catch (err) {
    console.error('Unexpected payment error:', err);
    return customErrorResult<PaymentRecord>('Failed to process payment record.');
  }
}

/**
 * READ: Get payment by booking ID
 */
export async function getPaymentByBookingId(
  bookingId: string
): Promise<BookingResult<PaymentRecord>> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) {
      console.error('Payment fetch error:', error);
      return errorResult<PaymentRecord>(error, 'payment');
    }

    return successResult(data as PaymentRecord);
  } catch (err) {
    console.error('Unexpected payment fetch error:', err);
    return customErrorResult<PaymentRecord>('Failed to fetch payment.');
  }
}
