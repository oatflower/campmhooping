import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// XSS Prevention: Escape HTML special characters in user input
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Onboarding data structure
export interface OnboardingData {
  // Step 1: About your camp (Page 0-7)
  campType: string | null;
  location: {
    address: string;
    lat: number | null;
    lng: number | null;
    province: string;
    district: string;
  };
  showExactLocation: boolean;
  environments: string[];
  capacity: {
    maxCampers: number;
    tentSpots: number;
    bathrooms: number;
  };
  zones: Array<{
    id: string;
    name: string;
    capacity: number;
    price: number | null;
  }>;

  // Step 2: Make it stand out (Page 8-17)
  facilities: Record<string, string[]>;
  images: string[];
  coverImageIndex: number;
  title: string;
  description: string;

  // Step 3: Pricing (Page 18-24)
  instantBook: boolean;
  basePrice: number;
  weekendPremium: number;
  acceptsPayAtCamp?: boolean;
  discounts: {
    firstTimer: number;
    weekly: number;
    monthly: number;
    lastMinute: number;
  };
  contact: {
    address: string;
    phone: string;
    isBusiness: boolean;
  };
}

// Initial empty onboarding data
const initialOnboardingData: OnboardingData = {
  campType: null,
  location: {
    address: '',
    lat: null,
    lng: null,
    province: '',
    district: '',
  },
  showExactLocation: true,
  environments: [],
  capacity: {
    maxCampers: 4,
    tentSpots: 2,
    bathrooms: 1,
  },
  zones: [],
  facilities: {},
  images: [],
  coverImageIndex: 0,
  title: '',
  description: '',
  instantBook: false,
  basePrice: 0,
  weekendPremium: 0,
  acceptsPayAtCamp: false,
  discounts: {
    firstTimer: 20,
    weekly: 10,
    monthly: 20,
    lastMinute: 10,
  },
  contact: {
    address: '',
    phone: '',
    isBusiness: false,
  },
};

interface HostListing {
  id: string;
  status: 'draft' | 'in_progress' | 'published' | 'paused';
  data: OnboardingData;
  createdAt: Date;
  updatedAt: Date;
}

interface HostContextType {
  // Mode
  isHostMode: boolean;
  setHostMode: (value: boolean) => void;

  // Onboarding
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;

  // Listings
  listings: HostListing[];
  hasListings: boolean;

  // Progress
  saveProgress: () => void;
  getProgress: () => number;

  // Actions
  publishListing: () => Promise<boolean>;
  isPublishing: boolean;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

const STORAGE_KEY = 'campy_host_data';
const ONBOARDING_KEY = 'campy_host_onboarding';

export function HostProvider({ children }: { children: ReactNode }) {
  const [isHostMode, setIsHostMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialOnboardingData);
  const [listings, setListings] = useState<HostListing[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuth();

  // Load saved data on mount
  useEffect(() => {
    const savedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (savedOnboarding) {
      try {
        const parsed = JSON.parse(savedOnboarding);
        setOnboardingData(parsed.data || initialOnboardingData);
        setCurrentPage(parsed.currentPage || 0);
      } catch (e) {
        console.error('Failed to parse onboarding data:', e);
      }
    }

    const savedHost = localStorage.getItem(STORAGE_KEY);
    if (savedHost) {
      try {
        const parsed = JSON.parse(savedHost);
        setListings(parsed.listings || []);
      } catch (e) {
        console.error('Failed to parse host data:', e);
      }
    }
  }, []);

  // Update onboarding data
  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  // Reset onboarding
  const resetOnboarding = () => {
    setOnboardingData(initialOnboardingData);
    setCurrentPage(0);
    localStorage.removeItem(ONBOARDING_KEY);
  };

  // Save progress
  const saveProgress = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify({
      data: onboardingData,
      currentPage,
      savedAt: new Date().toISOString(),
    }));
  }, [onboardingData, currentPage]);

  // Auto-save on data change with debounce
  useEffect(() => {
    if (currentPage > 0) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timer);
    }
  }, [currentPage, saveProgress]);

  // Calculate progress (0-100)
  const getProgress = () => {
    const totalPages = 24;
    return Math.round((currentPage / totalPages) * 100);
  };

  const publishListing = async (): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to publish');
      return false;
    }

    setIsPublishing(true);

    try {
      // VALIDATION: Validate all required fields before submission
      const title = onboardingData.title?.trim() || '';
      const description = onboardingData.description?.trim() || '';
      const price = Number(onboardingData.basePrice);
      const location = onboardingData.location?.address?.trim() || '';

      // Title validation
      if (!title || title.length < 3) {
        throw new Error('Camp name must be at least 3 characters');
      }
      if (title.length > 200) {
        throw new Error('Camp name must be less than 200 characters');
      }

      // Description validation
      if (!description || description.length < 20) {
        throw new Error('Description must be at least 20 characters');
      }
      if (description.length > 5000) {
        throw new Error('Description must be less than 5000 characters');
      }

      // Price validation
      if (isNaN(price) || price < 100) {
        throw new Error('Price must be at least 100 THB per night');
      }
      if (price > 100000) {
        throw new Error('Price cannot exceed 100,000 THB per night');
      }

      // Location validation
      if (!location || location.length < 5) {
        throw new Error('Please provide a valid location');
      }

      // Images validation
      if (!onboardingData.images || onboardingData.images.length < 3) {
        throw new Error('Please add at least 3 photos of your camp');
      }
      if (onboardingData.images.length > 20) {
        throw new Error('Maximum 20 photos allowed');
      }

      // Capacity validation
      const maxGuests = Number(onboardingData.capacity?.maxCampers) || 1;
      if (maxGuests < 1 || maxGuests > 100) {
        throw new Error('Maximum guests must be between 1 and 100');
      }

      // Sanitize facilities array (prevent oversized arrays)
      const facilities = Object.values(onboardingData.facilities || {})
        .flat()
        .filter((f): f is string => typeof f === 'string' && f.length < 100)
        .slice(0, 50);

      // Sanitize environments/highlights
      const highlights = (onboardingData.environments || [])
        .filter((e): e is string => typeof e === 'string' && e.length < 100)
        .slice(0, 20);

      // Map OnboardingData to Database Columns
      // XSS Prevention: Sanitize user-provided text content
      const campData = {
        host_id: user.id,
        name: escapeHtml(title),
        description: escapeHtml(description),
        price_per_night: price,
        location: escapeHtml(location),
        province: escapeHtml(onboardingData.location.province?.trim() || 'Thailand'),
        images: onboardingData.images.slice(0, 20), // Limit images
        max_guests: maxGuests,
        accommodation_type: onboardingData.campType || 'tent',
        facilities: facilities,
        highlights: highlights,
        coordinates: {
          lat: Number(onboardingData.location.lat) || null,
          lng: Number(onboardingData.location.lng) || null
        },
        is_beginner: false,
        is_popular: false
      };

      const { data, error } = await supabase
        .from('camps')
        .insert(campData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Camp published successfully! 🎉');

      // Clear wizard
      resetOnboarding();

      // Refresh listings (placeholder for now, normally we'd fetch)
      // For now we add a local mock so users see immediate feedback if they stay in session
      const newListing: HostListing = {
        id: data.id,
        status: 'published',
        data: onboardingData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setListings(prev => [newListing, ...prev]);

      return true;

    } catch (error: unknown) {
      console.error('Publish error:', error);
      const message = error instanceof Error ? error.message : 'Failed to publish listing';
      toast.error(message);
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  const setHostMode = (value: boolean) => {
    setIsHostMode(value);
  };

  return (
    <HostContext.Provider
      value={{
        isHostMode,
        setHostMode,
        currentPage,
        setCurrentPage,
        onboardingData,
        updateOnboardingData,
        resetOnboarding,
        listings,
        hasListings: listings.length > 0,
        saveProgress,
        getProgress,
        publishListing,
        isPublishing,
      }}
    >
      {children}
    </HostContext.Provider>
  );
}

export function useHost() {
  const context = useContext(HostContext);
  if (context === undefined) {
    throw new Error('useHost must be used within a HostProvider');
  }
  return context;
}
