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

/**
 * UPDATE: Cancel a booking
 * Sets status to 'cancelled'
 */
export async function cancelBooking(
  bookingId: string,
  userId?: string
): Promise<BookingResult<BookingRecord>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return customErrorResult<BookingRecord>('Authentication required to cancel booking.');
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('user_id', currentUserId)
      .select()
      .single();

    if (error) {
      console.error('Booking cancellation error:', error);
      return errorResult<BookingRecord>(error, 'booking');
    }

    return successResult(data as BookingRecord);
  } catch (err) {
    console.error('Unexpected cancellation error:', err);
    return customErrorResult<BookingRecord>('Failed to cancel booking.');
  }
}

/**
 * UPDATE: Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'completed',
  userId?: string
): Promise<BookingResult<BookingRecord>> {
  const currentUserId = await getCurrentUserId(userId);

  if (!currentUserId) {
    return customErrorResult<BookingRecord>('Authentication required to update booking.');
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('user_id', currentUserId)
      .select()
      .single();

    if (error) {
      console.error('Booking update error:', error);
      return errorResult<BookingRecord>(error, 'booking');
    }

    return successResult(data as BookingRecord);
  } catch (err) {
    console.error('Unexpected update error:', err);
    return customErrorResult<BookingRecord>('Failed to update booking.');
  }
}

// ============================================================================
// HOST BOOKING OPERATIONS
// ============================================================================

export interface HostBookingRecord extends BookingRecord {
  guest?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

/**
 * READ: Get all bookings for camps owned by the current host
 * RLS policy "Hosts can view bookings for their camps" enforces ownership
 */
export async function getHostBookings(
  hostId?: string
): Promise<BookingResult<HostBookingRecord[]>> {
  const currentUserId = await getCurrentUserId(hostId);

  if (!currentUserId) {
    return customErrorResult<HostBookingRecord[]>('Authentication required to view host bookings.');
  }

  try {
    // First get all camps owned by this host
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .eq('host_id', currentUserId);

    if (campsError) {
      console.error('Camps fetch error:', campsError);
      return errorResult<HostBookingRecord[]>(campsError, 'booking');
    }

    if (!camps || camps.length === 0) {
      return successResult([] as HostBookingRecord[]);
    }

    const campIds = camps.map(c => c.id);

    // Get bookings for those camps with guest info
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
        ),
        profiles!bookings_user_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .in('camp_id', campIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Host bookings fetch error:', error);
      return errorResult<HostBookingRecord[]>(error, 'booking');
    }

    // Transform to include guest info
    const bookings = (data || []).map(b => ({
      ...b,
      guest: b.profiles ? {
        id: b.profiles.id,
        name: b.profiles.name,
        email: b.profiles.email,
        avatar_url: b.profiles.avatar_url,
      } : undefined,
    })) as HostBookingRecord[];

    return successResult(bookings);
  } catch (err) {
    console.error('Unexpected host bookings fetch error:', err);
    return customErrorResult<HostBookingRecord[]>('Failed to fetch host bookings.');
  }
}

/**
 * UPDATE: Host confirms or declines a booking
 * RLS policy "Hosts can update bookings for their camps" enforces ownership
 */
export async function updateHostBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'cancelled',
  hostId?: string
): Promise<BookingResult<BookingRecord>> {
  const currentUserId = await getCurrentUserId(hostId);

  if (!currentUserId) {
    return customErrorResult<BookingRecord>('Authentication required to update booking.');
  }

  try {
    // RLS will verify the host owns the camp
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select(`
        *,
        camps (
          id,
          name,
          location,
          images
        )
      `)
      .single();

    if (error) {
      console.error('Host booking update error:', error);
      return errorResult<BookingRecord>(error, 'booking');
    }

    return successResult(data as BookingRecord);
  } catch (err) {
    console.error('Unexpected host booking update error:', err);
    return customErrorResult<BookingRecord>('Failed to update booking status.');
  }
}

// ============================================================================
// HOST EARNINGS OPERATIONS
// ============================================================================

export interface HostEarningsRecord {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  completed_at?: string;
  booking?: {
    id: string;
    start_date: string;
    end_date: string;
    guest_count?: Record<string, number>;
    camps?: {
      name: string;
    };
  };
  guest?: {
    name: string;
  };
}

export interface HostEarningsSummary {
  available: number;
  pending: number;
  totalEarned: number;
  thisMonth: number;
  lastMonth: number;
  transactions: HostEarningsRecord[];
}

/**
 * READ: Get earnings summary for host
 * Calculates from payments linked to host's camps
 */
export async function getHostEarnings(
  hostId?: string
): Promise<BookingResult<HostEarningsSummary>> {
  const currentUserId = await getCurrentUserId(hostId);

  if (!currentUserId) {
    return customErrorResult<HostEarningsSummary>('Authentication required to view earnings.');
  }

  try {
    // Get all camps owned by this host
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .eq('host_id', currentUserId);

    if (campsError) {
      console.error('Camps fetch error:', campsError);
      return errorResult<HostEarningsSummary>(campsError, 'booking');
    }

    if (!camps || camps.length === 0) {
      return successResult({
        available: 0,
        pending: 0,
        totalEarned: 0,
        thisMonth: 0,
        lastMonth: 0,
        transactions: [],
      });
    }

    const campIds = camps.map(c => c.id);

    // Get bookings with payments for these camps
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        start_date,
        end_date,
        total_price,
        status,
        guest_count,
        created_at,
        camps (
          name
        ),
        profiles!bookings_user_id_fkey (
          name
        )
      `)
      .in('camp_id', campIds)
      .in('status', ['confirmed', 'completed'])
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError);
      return errorResult<HostEarningsSummary>(bookingsError, 'booking');
    }

    // Calculate earnings
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let available = 0;
    let pending = 0;
    let totalEarned = 0;
    let thisMonth = 0;
    let lastMonth = 0;

    const transactions: HostEarningsRecord[] = [];

    (bookings || []).forEach(booking => {
      const amount = booking.total_price || 0;
      const createdAt = new Date(booking.created_at);
      const endDate = new Date(booking.end_date);

      // Check if guest has checked out (end_date passed)
      const isCheckedOut = endDate < now;

      if (isCheckedOut) {
        available += amount;
      } else {
        pending += amount;
      }

      totalEarned += amount;

      if (createdAt >= thisMonthStart) {
        thisMonth += amount;
      } else if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
        lastMonth += amount;
      }

      transactions.push({
        id: booking.id,
        booking_id: booking.id,
        amount,
        currency: 'THB',
        payment_method: 'booking',
        status: isCheckedOut ? 'completed' : 'pending',
        created_at: booking.created_at,
        completed_at: isCheckedOut ? booking.end_date : undefined,
        booking: {
          id: booking.id,
          start_date: booking.start_date,
          end_date: booking.end_date,
          guest_count: booking.guest_count,
          camps: booking.camps,
        },
        guest: booking.profiles ? { name: booking.profiles.name } : undefined,
      });
    });

    return successResult({
      available,
      pending,
      totalEarned,
      thisMonth,
      lastMonth,
      transactions,
    });
  } catch (err) {
    console.error('Unexpected earnings fetch error:', err);
    return customErrorResult<HostEarningsSummary>('Failed to fetch earnings.');
  }
}
