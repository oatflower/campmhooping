import type { AccommodationOption, Addon } from '@/types/camp';

// ============================================================================
// SEASONAL PRICING (Medium Issue #15)
// ============================================================================

export type Season = 'peak' | 'high' | 'regular' | 'low';

export interface SeasonConfig {
  name: Season;
  multiplier: number;
  months: number[];
}

// Thai camping seasons
export const SEASONS: SeasonConfig[] = [
  { name: 'peak', multiplier: 1.5, months: [12, 1] }, // Dec-Jan (New Year, Cool season peak)
  { name: 'high', multiplier: 1.25, months: [11, 2, 3, 4] }, // Nov, Feb-Apr (Cool season, Songkran)
  { name: 'regular', multiplier: 1.0, months: [5, 10] }, // May, Oct (Transition)
  { name: 'low', multiplier: 0.85, months: [6, 7, 8, 9] }, // Jun-Sep (Rainy season)
];

export function getSeasonForDate(date: Date): SeasonConfig {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  return SEASONS.find(s => s.months.includes(month)) || SEASONS[2]; // Default to regular
}

export function getSeasonalPrice(basePrice: number, date: Date): number {
  const season = getSeasonForDate(date);
  return Math.round(basePrice * season.multiplier);
}

// Calculate average seasonal price for a date range
export function getAverageSeasonalPrice(basePrice: number, startDate: Date, endDate: Date): number {
  let totalPrice = 0;
  let nights = 0;

  const currentDate = new Date(startDate);
  while (currentDate < endDate) {
    totalPrice += getSeasonalPrice(basePrice, currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    nights++;
  }

  return nights > 0 ? Math.round(totalPrice / nights) : basePrice;
}

// ============================================================================
// PRICING CALCULATION (Critical Issue #5 - Add-ons)
// ============================================================================

export interface GuestCount {
  adults: number;
  children: number;
  infants?: number;
}

export interface PricingInput {
  accommodation: AccommodationOption;
  startDate: Date;
  endDate: Date;
  guests: GuestCount;
  selectedAddons?: Addon[];
  useSeasonalPricing?: boolean;
}

export interface PricingBreakdown {
  // Base pricing
  pricePerNight: number;
  nights: number;
  basePrice: number;
  seasonalAdjustment: number;

  // Extra guests
  extraAdults: number;
  extraAdultPrice: number;
  extraChildren: number;
  extraChildPrice: number;

  // Add-ons (Critical Issue #5)
  addons: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  addonTotal: number;

  // Subtotals and totals
  subtotal: number;
  vatRate: number;
  vat: number;
  total: number;

  // Seasonal info
  season: Season;
  seasonMultiplier: number;
}

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const { accommodation, startDate, endDate, guests, selectedAddons = [], useSeasonalPricing = true } = input;

  // Calculate nights
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get season info for the start date (or use average)
  const season = getSeasonForDate(startDate);
  const seasonMultiplier = useSeasonalPricing ? season.multiplier : 1.0;

  // Calculate base price with seasonal adjustment
  const basePricePerNight = accommodation.pricePerNight;
  const seasonalPricePerNight = Math.round(basePricePerNight * seasonMultiplier);
  const seasonalAdjustment = (seasonalPricePerNight - basePricePerNight) * nights;
  const basePrice = basePricePerNight * nights;

  // Extra guests calculation
  const standardGuests = accommodation.maxGuests;
  const totalAdults = guests.adults;
  const extraAdults = Math.max(0, totalAdults - standardGuests);
  const extraChildren = guests.children; // Children always count as extra

  const extraAdultPrice = extraAdults * accommodation.extraAdultPrice * nights;
  const extraChildPrice = extraChildren * accommodation.extraChildPrice * nights;

  // Add-ons calculation (Critical Issue #5 - Now properly included!)
  const addonsBreakdown = selectedAddons.map(addon => ({
    id: addon.id,
    name: addon.name,
    price: addon.price,
    quantity: 1, // Could be extended to support quantities
    total: addon.price * nights, // Add-ons typically charged per night
  }));
  const addonTotal = addonsBreakdown.reduce((sum, addon) => sum + addon.total, 0);

  // Calculate subtotal (includes everything before tax)
  const subtotal = basePrice + seasonalAdjustment + extraAdultPrice + extraChildPrice + addonTotal;

  // VAT calculation (7% in Thailand)
  const vatRate = 0.07;
  const vat = Math.round(subtotal * vatRate);

  // Total
  const total = subtotal + vat;

  return {
    pricePerNight: seasonalPricePerNight,
    nights,
    basePrice,
    seasonalAdjustment,
    extraAdults,
    extraAdultPrice,
    extraChildren,
    extraChildPrice,
    addons: addonsBreakdown,
    addonTotal,
    subtotal,
    vatRate,
    vat,
    total,
    season: season.name,
    seasonMultiplier,
  };
}

// ============================================================================
// PAYMENT VALIDATION (High Issue #8)
// ============================================================================

export function validatePaymentAmount(
  paymentAmount: number,
  expectedTotal: number,
  tolerance: number = 0.01
): { valid: boolean; error?: string } {
  // Allow for small rounding differences
  const diff = Math.abs(paymentAmount - expectedTotal);
  const percentDiff = diff / expectedTotal;

  if (diff > 1 && percentDiff > tolerance) {
    if (paymentAmount < expectedTotal) {
      return {
        valid: false,
        error: `Payment amount (${paymentAmount}) is less than required (${expectedTotal})`,
      };
    } else {
      return {
        valid: false,
        error: `Payment amount (${paymentAmount}) exceeds required amount (${expectedTotal})`,
      };
    }
  }

  return { valid: true };
}

// ============================================================================
// CANCELLATION REFUND LOGIC (High Issue #9)
// ============================================================================

export interface CancellationPolicy {
  daysBeforeCheckIn: number;
  refundPercentage: number;
  description: string;
}

// Standard cancellation policies
export const CANCELLATION_POLICIES: CancellationPolicy[] = [
  { daysBeforeCheckIn: 7, refundPercentage: 100, description: 'Full refund if cancelled 7+ days before check-in' },
  { daysBeforeCheckIn: 3, refundPercentage: 50, description: '50% refund if cancelled 3-6 days before check-in' },
  { daysBeforeCheckIn: 1, refundPercentage: 25, description: '25% refund if cancelled 1-2 days before check-in' },
  { daysBeforeCheckIn: 0, refundPercentage: 0, description: 'No refund for same-day cancellation or no-show' },
];

export interface RefundCalculation {
  refundPercentage: number;
  refundAmount: number;
  retainedAmount: number;
  policy: CancellationPolicy;
  daysUntilCheckIn: number;
}

export function calculateRefund(
  bookingTotal: number,
  checkInDate: Date,
  cancellationDate: Date = new Date()
): RefundCalculation {
  // Calculate days until check-in
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Find applicable policy (first one where daysBeforeCheckIn <= daysUntilCheckIn)
  const policy = CANCELLATION_POLICIES.find(p => daysUntilCheckIn >= p.daysBeforeCheckIn)
    || CANCELLATION_POLICIES[CANCELLATION_POLICIES.length - 1];

  const refundAmount = Math.round(bookingTotal * (policy.refundPercentage / 100));
  const retainedAmount = bookingTotal - refundAmount;

  return {
    refundPercentage: policy.refundPercentage,
    refundAmount,
    retainedAmount,
    policy,
    daysUntilCheckIn,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatPrice(price: number, currency: string = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateNights(startDate: Date, endDate: Date): number {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
