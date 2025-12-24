import { useMemo, useState, useCallback } from 'react';
import type { Camp } from '@/types/camp';

// ============================================================================
// SITE FEATURES FILTERING (Medium Issue #14)
// ============================================================================

export interface CampFilters {
  // Location
  province?: string;
  location?: string;

  // Features (Issue #14)
  facilities?: string[];
  accommodationType?: 'tent' | 'dome' | 'cabin';

  // Guest requirements
  minGuests?: number;
  petFriendly?: boolean;
  electricHookup?: boolean;
  waterfront?: boolean;

  // Price range
  minPrice?: number;
  maxPrice?: number;

  // Rating
  minRating?: number;

  // Tags
  isPopular?: boolean;
  isBeginner?: boolean;

  // Search
  searchQuery?: string;

  // Date availability (for future use)
  checkIn?: Date;
  checkOut?: Date;
}

// Common facility mappings
const FACILITY_MAPPINGS = {
  petFriendly: ['สัตว์เลี้ยง', 'Pet Friendly', 'Pets Allowed', 'pets', 'pet-friendly'],
  electricHookup: ['ไฟฟ้า', 'Electric', 'Power', 'Electricity', 'electric-hookup', 'power-outlet'],
  waterfront: ['ริมน้ำ', 'Waterfront', 'Lake', 'River', 'Beach', 'lakeside', 'riverside'],
  wifi: ['WiFi', 'Wifi', 'wifi', 'Internet'],
  parking: ['ที่จอดรถ', 'Parking', 'parking'],
  bathroom: ['ห้องน้ำ', 'Bathroom', 'Toilet', 'Restroom', 'bathroom'],
  shower: ['ฝักบัว', 'Shower', 'shower', 'hot-shower'],
  bbq: ['BBQ', 'บาร์บีคิว', 'Grill', 'bbq'],
  campfire: ['กองไฟ', 'Campfire', 'Fire Pit', 'campfire'],
};

function hasFacility(camp: Camp, facilityType: keyof typeof FACILITY_MAPPINGS): boolean {
  const searchTerms = FACILITY_MAPPINGS[facilityType];
  return camp.facilities.some(f =>
    searchTerms.some(term =>
      f.toLowerCase().includes(term.toLowerCase())
    )
  );
}

export function filterCamps(camps: Camp[], filters: CampFilters): Camp[] {
  return camps.filter(camp => {
    // Province filter
    if (filters.province && camp.province !== filters.province) {
      return false;
    }

    // Location filter
    if (filters.location && camp.location !== filters.location) {
      return false;
    }

    // Accommodation type filter
    if (filters.accommodationType && camp.accommodationType !== filters.accommodationType) {
      return false;
    }

    // Min guests filter
    if (filters.minGuests && camp.maxGuests < filters.minGuests) {
      return false;
    }

    // Feature-based filtering (Issue #14)
    if (filters.petFriendly && !hasFacility(camp, 'petFriendly')) {
      return false;
    }

    if (filters.electricHookup && !hasFacility(camp, 'electricHookup')) {
      return false;
    }

    if (filters.waterfront && !hasFacility(camp, 'waterfront')) {
      return false;
    }

    // Facilities filter (match all selected)
    if (filters.facilities && filters.facilities.length > 0) {
      const hasAllFacilities = filters.facilities.every(requiredFacility =>
        camp.facilities.some(campFacility =>
          campFacility.toLowerCase().includes(requiredFacility.toLowerCase())
        )
      );
      if (!hasAllFacilities) {
        return false;
      }
    }

    // Price range filter
    if (filters.minPrice !== undefined && camp.pricePerNight < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice !== undefined && camp.pricePerNight > filters.maxPrice) {
      return false;
    }

    // Rating filter
    if (filters.minRating !== undefined && camp.rating < filters.minRating) {
      return false;
    }

    // Tags filter
    if (filters.isPopular && !camp.isPopular) {
      return false;
    }

    if (filters.isBeginner && !camp.isBeginner) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        camp.name,
        camp.nameEn,
        camp.location,
        camp.province,
        camp.description,
        ...camp.facilities,
        ...camp.highlights,
      ].join(' ').toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function useCampFilters(camps: Camp[]) {
  const [filters, setFilters] = useState<CampFilters>({});

  const filteredCamps = useMemo(() => {
    return filterCamps(camps, filters);
  }, [camps, filters]);

  const updateFilter = useCallback(<K extends keyof CampFilters>(
    key: K,
    value: CampFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleFacility = useCallback((facility: string) => {
    setFilters(prev => {
      const currentFacilities = prev.facilities || [];
      const newFacilities = currentFacilities.includes(facility)
        ? currentFacilities.filter(f => f !== facility)
        : [...currentFacilities, facility];
      return {
        ...prev,
        facilities: newFacilities,
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== undefined && value !== null && value !== '';
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.province) count++;
    if (filters.location) count++;
    if (filters.accommodationType) count++;
    if (filters.facilities && filters.facilities.length > 0) count += filters.facilities.length;
    if (filters.petFriendly) count++;
    if (filters.electricHookup) count++;
    if (filters.waterfront) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.minRating !== undefined) count++;
    if (filters.isPopular) count++;
    if (filters.isBeginner) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const provinces = [...new Set(camps.map(c => c.province))].sort();
    const locations = [...new Set(camps.map(c => c.location))].sort();
    const allFacilities = [...new Set(camps.flatMap(c => c.facilities))].sort();
    const accommodationTypes = [...new Set(camps.map(c => c.accommodationType))];
    const priceRange = {
      min: Math.min(...camps.map(c => c.pricePerNight)),
      max: Math.max(...camps.map(c => c.pricePerNight)),
    };

    return {
      provinces,
      locations,
      facilities: allFacilities,
      accommodationTypes,
      priceRange,
    };
  }, [camps]);

  return {
    filters,
    filteredCamps,
    updateFilter,
    toggleFacility,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    filterOptions,
    setFilters,
  };
}

export type CampFiltersReturn = ReturnType<typeof useCampFilters>;
