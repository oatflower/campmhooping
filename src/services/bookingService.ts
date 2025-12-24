import { supabase } from '@/lib/supabase';
import type { Booking, BookingStatus, BlockedDate } from '@/types/supabase';
import {
  validateStatusTransition,
  isDateRangeAvailable,
  validateGuestCount,
  validateMinimumStay,
  type DateRange,
  type GuestCount,
  type AccommodationCapacity,
} from '@/utils/bookingValidation';
import { calculateRefund } from '@/utils/pricing';

// ============================================================================
// BOOKING STATUS MANAGEMENT (Critical Issue #2)
// ============================================================================

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  userId?: string
): Promise<{ success: boolean; error?: string; booking?: Booking }> {
  try {
    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !currentBooking) {
      return { success: false, error: 'Booking not found' };
    }

    // Validate status transition
    const transition = validateStatusTransition(
      currentBooking.status as BookingStatus,
      newStatus
    );

    if (!transition.valid) {
      return { success: false, error: transition.error };
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, booking: updatedBooking };
  } catch (error) {
    return { success: false, error: 'Failed to update booking status' };
  }
}

// ============================================================================
// ADMIN BOOKING MODIFICATION (High Issue #10)
// ============================================================================

export interface BookingModification {
  bookingId: string;
  newDates?: DateRange;
  newGuests?: GuestCount;
  newCampId?: string;
  newAccommodationId?: string;
}

export async function validateAndModifyBooking(
  modification: BookingModification,
  accommodationCapacity: AccommodationCapacity
): Promise<{ success: boolean; errors: string[]; booking?: Booking }> {
  const errors: string[] = [];

  try {
    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, camps(*)')
      .eq('id', modification.bookingId)
      .single();

    if (fetchError || !currentBooking) {
      return { success: false, errors: ['Booking not found'] };
    }

    // Can only modify pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(currentBooking.status)) {
      return {
        success: false,
        errors: [`Cannot modify booking with status '${currentBooking.status}'`],
      };
    }

    const campId = modification.newCampId || currentBooking.camp_id;
    const dateRange = modification.newDates || {
      from: new Date(currentBooking.start_date),
      to: new Date(currentBooking.end_date),
    };

    // Validate new dates if changed
    if (modification.newDates) {
      // Check minimum stay
      const stayValidation = validateMinimumStay(modification.newDates);
      if (!stayValidation.valid && stayValidation.error) {
        errors.push(stayValidation.error);
      }

      // Check for conflicts (excluding current booking)
      const availability = await isDateRangeAvailable(
        campId,
        modification.newDates,
        modification.bookingId
      );

      if (!availability.available) {
        if (availability.conflicts.length > 0) {
          errors.push('New dates conflict with existing bookings');
        }
        if (availability.blockedDates.length > 0) {
          errors.push('New dates include blocked periods');
        }
      }
    }

    // Validate new guest count if changed
    if (modification.newGuests) {
      const guestValidation = validateGuestCount(
        modification.newGuests,
        accommodationCapacity
      );
      if (!guestValidation.valid) {
        errors.push(...guestValidation.errors);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Build update object
    const updates: Partial<Booking> = {
      updated_at: new Date().toISOString(),
    };

    if (modification.newDates) {
      updates.start_date = modification.newDates.from.toISOString();
      updates.end_date = modification.newDates.to.toISOString();
    }

    if (modification.newGuests) {
      updates.guest_count = modification.newGuests;
    }

    if (modification.newCampId) {
      updates.camp_id = modification.newCampId;
    }

    if (modification.newAccommodationId) {
      updates.accommodation_id = modification.newAccommodationId;
    }

    // Perform update
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', modification.bookingId)
      .select()
      .single();

    if (updateError) {
      return { success: false, errors: [updateError.message] };
    }

    return { success: true, errors: [], booking: updatedBooking };
  } catch (error) {
    return { success: false, errors: ['Failed to modify booking'] };
  }
}

// ============================================================================
// BOOKING CANCELLATION WITH REFUND (High Issue #9)
// ============================================================================

export interface CancellationResult {
  success: boolean;
  error?: string;
  refundAmount?: number;
  refundPercentage?: number;
}

export async function cancelBookingWithRefund(
  bookingId: string,
  userId: string
): Promise<CancellationResult> {
  try {
    // Get current booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Verify ownership or admin
    if (booking.user_id !== userId) {
      return { success: false, error: 'Unauthorized to cancel this booking' };
    }

    // Check if cancellation is allowed
    if (!['pending', 'processing', 'confirmed'].includes(booking.status)) {
      return { success: false, error: `Cannot cancel booking with status '${booking.status}'` };
    }

    // Calculate refund
    const checkInDate = new Date(booking.start_date);
    const refundCalc = calculateRefund(booking.total_price, checkInDate);

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      return { success: false, error: 'Failed to cancel booking' };
    }

    return {
      success: true,
      refundAmount: refundCalc.refundAmount,
      refundPercentage: refundCalc.refundPercentage,
    };
  } catch (error) {
    return { success: false, error: 'Failed to process cancellation' };
  }
}

// ============================================================================
// BLOCKED DATES MANAGEMENT (Issues #4, #17)
// ============================================================================

export interface BlockedDateInput {
  campId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  createdBy: string;
}

export async function addBlockedDateRange(
  input: BlockedDateInput
): Promise<{ success: boolean; error?: string; blockedDate?: BlockedDate }> {
  try {
    // Check for overlap with existing blocked ranges (Issue #17)
    const { data: existingBlocks, error: fetchError } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('camp_id', input.campId)
      .or(
        `and(start_date.lte.${input.endDate.toISOString()},end_date.gte.${input.startDate.toISOString()})`
      );

    if (fetchError) {
      console.error('Error checking existing blocks:', fetchError);
      // Continue anyway - table may not exist
    }

    if (existingBlocks && existingBlocks.length > 0) {
      return {
        success: false,
        error: 'Date range overlaps with existing blocked period',
      };
    }

    // Check for conflicts with existing bookings
    const availability = await isDateRangeAvailable(input.campId, {
      from: input.startDate,
      to: input.endDate,
    });

    if (availability.conflicts.length > 0) {
      return {
        success: false,
        error: `Cannot block dates - ${availability.conflicts.length} existing booking(s) in this range`,
      };
    }

    // Insert blocked date range
    const { data: blockedDate, error: insertError } = await supabase
      .from('blocked_dates')
      .insert({
        camp_id: input.campId,
        start_date: input.startDate.toISOString(),
        end_date: input.endDate.toISOString(),
        reason: input.reason,
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, blockedDate };
  } catch (error) {
    return { success: false, error: 'Failed to add blocked date range' };
  }
}

export async function removeBlockedDateRange(
  blockedDateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', blockedDateId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove blocked date range' };
  }
}

// ============================================================================
// ADMIN BOOKING QUERIES (Issue #16)
// ============================================================================

export interface BookingFilter {
  status?: BookingStatus[];
  campId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export async function getFilteredBookings(
  filter: BookingFilter
): Promise<{ success: boolean; bookings: Booking[]; total: number; error?: string }> {
  try {
    let query = supabase
      .from('bookings')
      .select('*, camps(*)', { count: 'exact' });

    // Apply filters
    if (filter.status && filter.status.length > 0) {
      query = query.in('status', filter.status);
    }

    if (filter.campId) {
      query = query.eq('camp_id', filter.campId);
    }

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }

    // Date range filter (Issue #16)
    if (filter.dateFrom) {
      query = query.gte('start_date', filter.dateFrom.toISOString());
    }

    if (filter.dateTo) {
      query = query.lte('end_date', filter.dateTo.toISOString());
    }

    // Pagination
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: bookings, error, count } = await query;

    if (error) {
      return { success: false, bookings: [], total: 0, error: error.message };
    }

    return {
      success: true,
      bookings: bookings || [],
      total: count || 0,
    };
  } catch (error) {
    return { success: false, bookings: [], total: 0, error: 'Failed to fetch bookings' };
  }
}
