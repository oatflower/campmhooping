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
}
