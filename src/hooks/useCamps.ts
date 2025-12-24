import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camp as SupabaseCamp } from '@/types/supabase';
import { Camp } from '@/types/camp'; // UI Type

interface UseCampsFilters {
    province?: string | null;
    category?: string | null;
    guests?: number;
}

export function useCamps(filters?: UseCampsFilters) {
    const [camps, setCamps] = useState<Camp[]>([]); // Start empty, load from database
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCamps() {
            setLoading(true);
            try {
                const query = supabase
                    .from('camps')
                    .select(`
                        id,
                        name,
                        description,
                        price_per_night,
                        location,
                        province,
                        images,
                        accommodation_type,
                        highlights,
                        facilities,
                        max_guests,
                        is_beginner,
                        is_popular,
                        coordinates
                    `); // Select specific columns to reduce payload size

                // Apply filters
                if (filters?.province) {
                    query.eq('province', filters.province);
                }

                // Category mapping to DB filters
                if (filters?.category) {
                    if (filters.category === 'glamping') {
                        query.eq('accommodation_type', 'dome');
                    } else if (filters.category === 'pet-friendly') {
                        query.contains('facilities', ['pet']);
                    }
                }

                if (filters?.guests) {
                    query.gte('max_guests', filters.guests);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error fetching camps:', error);
                    setError(new Error(error.message));
                    return;
                }

                if (data && Array.isArray(data)) {
                    // Runtime validation: ensure data is array and has expected structure
                    const validData = data.filter((item): item is SupabaseCamp =>
                        item !== null &&
                        typeof item === 'object' &&
                        typeof item.id === 'string' &&
                        typeof item.name === 'string'
                    );

                    // Map Supabase data to UI Camp type
                    // We need to merge with default values for missing columns
                    const realCamps: Camp[] = validData.map((dbCamp) => ({
                        id: dbCamp.id,
                        host_id: dbCamp.host_id || 'unknown', // Handle missing fields safely
                        name: dbCamp.name,
                        nameEn: dbCamp.name, // Fallback
                        description: dbCamp.description,
                        pricePerNight: Number(dbCamp.price_per_night),
                        location: typeof dbCamp.location === 'string' ? dbCamp.location : 'Unknown',
                        province: dbCamp.province || 'Thailand',
                        images: dbCamp.images || ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'],
                        image: dbCamp.images?.[0] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
                        rating: 0,
                        reviewCount: 0,
                        accommodationType: (dbCamp.accommodation_type as 'tent' | 'dome' | 'cabin') || 'tent',
                        highlights: Array.isArray(dbCamp.highlights) ? dbCamp.highlights : [],
                        facilities: Array.isArray(dbCamp.facilities) ? dbCamp.facilities : [],
                        maxGuests: dbCamp.max_guests || 2,
                        coordinates: (dbCamp.coordinates && typeof dbCamp.coordinates === 'object' ? dbCamp.coordinates : { lat: 13.7, lng: 100.5 }) as { lat: number; lng: number },
                        isBeginner: dbCamp.is_beginner || false,
                        isPopular: dbCamp.is_popular || false,
                        distanceFromBangkok: 'N/A',
                        created_at: dbCamp.created_at || new Date().toISOString()
                    }));

                    // Use only real data from database
                    setCamps(realCamps);
                }
            } catch (err: unknown) {
                // Silent error in prod or use a logger
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        }

        fetchCamps();
    }, [filters?.province, filters?.category, filters?.guests]);

    return { camps, loading, error };
}
