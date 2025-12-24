import { useState, useEffect, useCallback } from 'react';
import { GuestState } from '@/components/search/WhoDropdown';

const STORAGE_KEY = 'campy-search-state';

interface SearchState {
  selectedProvince: string | null;
  selectedCategory: string | null;
  checkIn: string | undefined; // ISO string
  checkOut: string | undefined; // ISO string
  guests: GuestState;
}

const defaultGuests: GuestState = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
};

const defaultState: SearchState = {
  selectedProvince: null,
  selectedCategory: null,
  checkIn: undefined,
  checkOut: undefined,
  guests: defaultGuests,
};

export function useSearchPersistence() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState<SearchState>(defaultState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SearchState;
        setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load search state:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save search state:', error);
      }
    }
  }, [state, isLoaded]);

  const setSelectedProvince = useCallback((province: string | null) => {
    setState(prev => ({ ...prev, selectedProvince: province }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const setCheckIn = useCallback((date: Date | undefined) => {
    setState(prev => ({ ...prev, checkIn: date?.toISOString() }));
  }, []);

  const setCheckOut = useCallback((date: Date | undefined) => {
    setState(prev => ({ ...prev, checkOut: date?.toISOString() }));
  }, []);

  const setGuests = useCallback((guests: GuestState) => {
    setState(prev => ({ ...prev, guests }));
  }, []);

  const clearSearch = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    isLoaded,
    selectedProvince: state.selectedProvince,
    selectedCategory: state.selectedCategory,
    checkIn: state.checkIn ? new Date(state.checkIn) : undefined,
    checkOut: state.checkOut ? new Date(state.checkOut) : undefined,
    guests: state.guests,
    setSelectedProvince,
    setSelectedCategory,
    setCheckIn,
    setCheckOut,
    setGuests,
    clearSearch,
  };
}
