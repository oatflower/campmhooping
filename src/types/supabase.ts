export interface Profile {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'USER' | 'HOST' | 'ADMIN';
    created_at: string;
    updated_at: string;
}

export interface Camp {
    id: string;
    host_id: string;
    name: string;
    description: string;
    price_per_night: number;
    location: string;
    province?: string;
    images: string[];
    max_guests?: number;
    accommodation_type?: string;
    facilities?: string[];
    highlights?: string[];
    is_popular?: boolean;
    is_beginner?: boolean;
    coordinates?: { lat: number; lng: number } | null; // JSONB
    created_at: string;
}

// Booking status state machine (Critical Issue #2)
// Valid transitions:
// pending -> processing, cancelled
// processing -> confirmed, failed, cancelled
// confirmed -> completed, cancelled
// cancelled -> (terminal)
// completed -> (terminal)
// failed -> pending (retry)
export type BookingStatus = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'completed' | 'failed';

export interface Booking {
    id: string;
    user_id: string;
    camp_id: string;
    start_date: string;
    end_date: string;
    status: BookingStatus;
    total_price: number;
    receipt_url?: string;
    payment_method?: 'card' | 'promptpay' | 'bank' | 'pay_at_camp';
    guest_count?: {
        adults: number;
        children: number;
        infants?: number;
    };
    accommodation_id?: string;
    addons?: string[];
    created_at: string;
    updated_at?: string;
    // Joins
    camps?: Camp;
}

// Blocked dates for availability management (Critical Issue #4)
export interface BlockedDate {
    id: string;
    camp_id: string;
    start_date: string;
    end_date: string;
    reason?: string;
    created_by?: string;
    created_at: string;
}
