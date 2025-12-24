import { supabase } from '@/lib/supabase';
import type { Booking } from '@/types/supabase';

// ============================================================================
// BOOKING STATUS STATE MACHINE (Critical Issue #2)
// ============================================================================

export type BookingStatus = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'completed' | 'failed';

// Valid state transitions
const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['confirmed', 'failed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [], // Terminal state
  completed: [], // Terminal state
  failed: ['pending'], // Can retry
};

export function isValidStatusTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateStatusTransition(from: BookingStatus, to: BookingStatus): { valid: boolean; error?: string } {
  if (from === to) {
    return { valid: true };
  }

  if (!isValidStatusTransition(from, to)) {
    return {
      valid: false,
      error: `Invalid status transition from '${from}' to '${to}'. Allowed: ${VALID_STATUS_TRANSITIONS[from]?.join(', ') || 'none'}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// DATE VALIDATION & OVERLAP DETECTION (Critical Issues #3, #4)
// ============================================================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface BlockedDateRange {
  id: string;
  campId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

// Check if two date ranges overlap
export function doDateRangesOverlap(range1: DateRange, range2: DateRange): boolean {
  return range1.from < range2.to && range2.from < range1.to;
}

// Check if a date range is available for a specific camp
export async function isDateRangeAvailable(
  campId: string,
  dateRange: DateRange,
  excludeBookingId?: string
): Promise<{ available: boolean; conflicts: Booking[]; blockedDates: BlockedDateRange[] }> {
  const conflicts: Booking[] = [];
  const blockedDates: BlockedDateRange[] = [];

  try {
    // 1. Check for existing bookings that overlap
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('camp_id', campId)
      .in('status', ['pending', 'processing', 'confirmed']) // Active bookings only
      .or(`and(start_date.lte.${dateRange.to.toISOString()},end_date.gte.${dateRange.from.toISOString()})`);

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data: existingBookings, error: bookingError } = await query;

    if (bookingError) {
      console.error('Error checking booking conflicts:', bookingError);
      throw new Error('Failed to check booking availability');
    }

    if (existingBookings && existingBookings.length > 0) {
      conflicts.push(...existingBookings);
    }

    // 2. Check for blocked date ranges (admin-blocked dates)
    const { data: blockedRanges, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('camp_id', campId)
      .or(`and(start_date.lte.${dateRange.to.toISOString()},end_date.gte.${dateRange.from.toISOString()})`);

    if (blockedError) {
      console.error('Error checking blocked dates:', blockedError);
      // Don't throw - blocked_dates table may not exist yet
    }

    if (blockedRanges && blockedRanges.length > 0) {
      blockedDates.push(...blockedRanges.map(r => ({
        id: r.id,
        campId: r.camp_id,
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        reason: r.reason,
      })));
    }

    return {
      available: conflicts.length === 0 && blockedDates.length === 0,
      conflicts,
      blockedDates,
    };
  } catch (error) {
    console.error('Availability check failed:', error);
    throw error;
  }
}

// ============================================================================
// MULTI-SITE BOOKING PREVENTION (Critical Issue #1)
// ============================================================================

export async function hasActiveBooking(
  userId: string,
  dateRange?: DateRange
): Promise<{ hasActive: boolean; activeBookings: Booking[] }> {
  try {
    let query = supabase
      .from('bookings')
      .select('*, camps(*)')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing', 'confirmed']);

    // If date range provided, check for overlaps
    if (dateRange) {
      query = query.or(
        `and(start_date.lte.${dateRange.to.toISOString()},end_date.gte.${dateRange.from.toISOString()})`
      );
    }

    const { data: activeBookings, error } = await query;

    if (error) {
      console.error('Error checking active bookings:', error);
      throw new Error('Failed to check for active bookings');
    }

    return {
      hasActive: (activeBookings?.length ?? 0) > 0,
      activeBookings: activeBookings || [],
    };
  } catch (error) {
    console.error('Active booking check failed:', error);
    throw error;
  }
}

// ============================================================================
// GUEST COUNT VALIDATION (Critical Issue #6)
// ============================================================================

export interface GuestCount {
  adults: number;
  children: number;
  infants?: number;
  pets?: number;
}

export interface AccommodationCapacity {
  maxGuests: number;
  maxAdults?: number;
  maxChildren?: number;
  petsAllowed?: boolean;
}

export function validateGuestCount(
  guests: GuestCount,
  capacity: AccommodationCapacity
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Total guest check
  const totalGuests = guests.adults + guests.children + (guests.infants || 0);
  if (totalGuests > capacity.maxGuests) {
    errors.push(`Total guests (${totalGuests}) exceeds maximum capacity (${capacity.maxGuests})`);
  }

  // Minimum adults
  if (guests.adults < 1) {
    errors.push('At least 1 adult is required');
  }

  // Max adults if specified
  if (capacity.maxAdults && guests.adults > capacity.maxAdults) {
    errors.push(`Adults (${guests.adults}) exceeds maximum allowed (${capacity.maxAdults})`);
  }

  // Max children if specified
  if (capacity.maxChildren && guests.children > capacity.maxChildren) {
    errors.push(`Children (${guests.children}) exceeds maximum allowed (${capacity.maxChildren})`);
  }

  // Pets check
  if (guests.pets && guests.pets > 0 && !capacity.petsAllowed) {
    errors.push('Pets are not allowed at this accommodation');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// MINIMUM STAY VALIDATION (High Issue #7)
// ============================================================================

export const MINIMUM_NIGHTS = 1; // No minimum stay requirement

export function validateMinimumStay(dateRange: DateRange): { valid: boolean; nights: number; error?: string } {
  const nights = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));

  // Check if checkout is before or same as checkin
  if (nights <= 0) {
    return {
      valid: false,
      nights: 0,
      error: 'Check-out date must be after check-in date',
    };
  }

  if (nights < MINIMUM_NIGHTS) {
    return {
      valid: false,
      nights,
      error: `Minimum stay is ${MINIMUM_NIGHTS} night(s). Selected: ${nights} night(s)`,
    };
  }

  return { valid: true, nights };
}

// ============================================================================
// CHECK-IN/CHECK-OUT TIME VALIDATION (Medium Issue #13)
// ============================================================================

export const STANDARD_CHECK_IN_HOUR = 14; // 2:00 PM
export const STANDARD_CHECK_OUT_HOUR = 11; // 11:00 AM

export function getCheckInTime(): string {
  return `${STANDARD_CHECK_IN_HOUR}:00`;
}

export function getCheckOutTime(): string {
  return `${STANDARD_CHECK_OUT_HOUR}:00`;
}

export function isValidCheckInDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function canBookSameDayTurnaround(checkoutDate: Date, checkinDate: Date): boolean {
  // Same-day turnaround is allowed if checkout is before checkin time
  // i.e., previous guest checks out at 11 AM, new guest checks in at 2 PM
  if (checkoutDate.toDateString() === checkinDate.toDateString()) {
    return true; // 3-hour buffer between checkout and checkin
  }
  return checkoutDate < checkinDate;
}

// ============================================================================
// EMAIL VALIDATION (Medium Issue #11)
// ============================================================================

// Standard email regex - consistent across the application
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

// ============================================================================
// PHONE VALIDATION (Medium Issue #12)
// ============================================================================

// Thai phone number regex with minimum 9 digits
export const PHONE_REGEX = /^(\+66|0)[0-9]{8,9}$/;

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  if (cleanPhone.length < 9) {
    return { valid: false, error: 'Phone number must be at least 9 digits' };
  }

  if (!PHONE_REGEX.test(cleanPhone)) {
    return { valid: false, error: 'Please enter a valid Thai phone number' };
  }

  return { valid: true };
}

// ============================================================================
// COMPREHENSIVE BOOKING VALIDATION
// ============================================================================

export interface BookingValidationInput {
  userId: string;
  campId: string;
  dateRange: DateRange;
  guests: GuestCount;
  accommodationCapacity: AccommodationCapacity;
}

export interface BookingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateBooking(input: BookingValidationInput): Promise<BookingValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate minimum stay
  const stayValidation = validateMinimumStay(input.dateRange);
  if (!stayValidation.valid && stayValidation.error) {
    errors.push(stayValidation.error);
  }

  // 2. Validate check-in date is not in the past
  if (!isValidCheckInDate(input.dateRange.from)) {
    errors.push('Check-in date cannot be in the past');
  }

  // 3. Validate guest count against capacity
  const guestValidation = validateGuestCount(input.guests, input.accommodationCapacity);
  if (!guestValidation.valid) {
    errors.push(...guestValidation.errors);
  }

  // 4. Check for multi-site booking conflicts
  try {
    const activeBookingCheck = await hasActiveBooking(input.userId, input.dateRange);
    if (activeBookingCheck.hasActive) {
      const campNames = activeBookingCheck.activeBookings
        .map(b => b.camps?.name || 'Unknown camp')
        .join(', ');
      errors.push(`You already have an active booking for these dates at: ${campNames}`);
    }
  } catch (e) {
    warnings.push('Could not verify existing bookings');
  }

  // 5. Check date range availability (overlaps and blocked dates)
  try {
    const availabilityCheck = await isDateRangeAvailable(input.campId, input.dateRange);
    if (!availabilityCheck.available) {
      if (availabilityCheck.conflicts.length > 0) {
        errors.push('Selected dates are not available - another booking exists');
      }
      if (availabilityCheck.blockedDates.length > 0) {
        const reasons = availabilityCheck.blockedDates
          .map(b => b.reason || 'Blocked by host')
          .join('; ');
        errors.push(`Selected dates are blocked: ${reasons}`);
      }
    }
  } catch (e) {
    warnings.push('Could not verify date availability');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
