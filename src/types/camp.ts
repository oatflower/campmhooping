export interface Camp {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  locationEn?: string;
  province: string;
  description: string;
  descriptionEn?: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  accommodationType: 'tent' | 'dome' | 'cabin';
  highlights: string[];
  facilities: string[];
  maxGuests: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  isBeginner: boolean;
  isPopular: boolean;
  distanceFromBangkok: string;
}

export interface AccommodationOption {
  id: string;
  type: 'tent' | 'dome' | 'cabin';
  name: string;
  pricePerNight: number;
  maxGuests: number;
  extraAdultPrice: number;
  extraChildPrice: number;
  description: string;
  amenities: string[];
  available: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export interface BookingDetails {
  campId: string;
  accommodationId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  addons: string[];
  zoneId?: string;
  pitchId?: string;
}

// Zone/Pitch system for camping slot selection
export interface CampZone {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  features: string[]; // e.g., 'riverside', 'shaded', 'power-hookup'
  priceModifier: number; // +/- from base price (percentage)
  pitches: CampPitch[];
}

export interface CampPitch {
  id: string;
  name: string; // e.g., "A1", "A2", "B1"
  zoneId: string;
  size: 'small' | 'medium' | 'large'; // tent size accommodation
  maxTents: number;
  status: 'available' | 'booked' | 'maintenance';
  features: string[]; // e.g., 'power-hookup', 'water-nearby'
  position?: { x: number; y: number }; // for visual map layout
}
