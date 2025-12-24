import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  toggleFavorite as toggleFavoriteApi,
  getFavoriteIds,
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
} from '@/services/reviewsFavoritesCrud';
import { POSTGRES_ERROR_CODES } from '@/services/constants';

interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  addFavorite: (campId: string) => Promise<void>;
  removeFavorite: (campId: string) => Promise<void>;
  toggleFavorite: (campId: string) => Promise<void>;
  isFavorite: (campId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * FavoritesProvider - Manages user favorites with Supabase as primary source
 *
 * Data flow:
 * 1. Initialize from localStorage cache for instant UI
 * 2. Immediately fetch from Supabase to get latest data
 * 3. Sync changes to both Supabase (primary) and localStorage (cache)
 *
 * Auth: Uses Supabase Auth via service layer (production-ready)
 */
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Initialize from localStorage cache for instant UI
    try {
      const stored = localStorage.getItem('camp-favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to parse favorites from localStorage:', error);
      localStorage.removeItem('camp-favorites');
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync localStorage when favorites change
  useEffect(() => {
    localStorage.setItem('camp-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch favorites from Supabase on mount
  const refreshFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getFavoriteIds();
      if (result.success && result.data) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Add favorite with Supabase sync
  const addFavorite = useCallback(async (campId: string) => {
    // Optimistic update
    setFavorites(prev => prev.includes(campId) ? prev : [...prev, campId]);

    const result = await addFavoriteApi(campId);
    if (!result.success) {
      // Rollback on error (unless it's a duplicate - that's fine)
      if (result.errorCode !== POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        setFavorites(prev => prev.filter(id => id !== campId));
        console.error('Add favorite failed:', result.error);
      }
    }
  }, []);

  // Remove favorite with Supabase sync
  const removeFavorite = useCallback(async (campId: string) => {
    // Optimistic update
    setFavorites(prev => prev.filter(id => id !== campId));

    const result = await removeFavoriteApi(campId);
    if (!result.success) {
      // Rollback on error
      setFavorites(prev => [...prev, campId]);
      console.error('Remove favorite failed:', result.error);
    }
  }, []);

  // Toggle favorite with Supabase sync
  const toggleFavorite = useCallback(async (campId: string) => {
    const wasFavorite = favorites.includes(campId);

    // Optimistic update
    setFavorites(prev =>
      wasFavorite
        ? prev.filter(id => id !== campId)
        : [...prev, campId]
    );

    const result = await toggleFavoriteApi(campId);
    if (!result.success) {
      // Rollback on error
      setFavorites(prev =>
        wasFavorite
          ? [...prev, campId]
          : prev.filter(id => id !== campId)
      );
      console.error('Toggle favorite failed:', result.error);
    }
  }, [favorites]);

  const isFavorite = useCallback((campId: string) => favorites.includes(campId), [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      refreshFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
