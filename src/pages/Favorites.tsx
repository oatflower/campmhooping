import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CampCard from '@/components/CampCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import BackToTop from '@/components/BackToTop';
import EmptyState from '@/components/EmptyState';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/lib/supabase';
import { Camp } from '@/types/camp';
import { Heart, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch camp details from Supabase based on favorite IDs
  useEffect(() => {
    const fetchFavoriteCamps = async () => {
      if (favorites.length === 0) {
        setCamps([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('camps')
          .select(`
            id,
            name,
            name_en,
            location,
            location_en,
            province,
            description,
            description_en,
            images,
            price_per_night,
            camp_type,
            highlights,
            facilities,
            max_guests,
            latitude,
            longitude,
            is_beginner,
            is_popular,
            distance_from_bangkok
          `)
          .in('id', favorites);

        if (error) throw error;

        // Transform Supabase data to Camp type
        const transformedCamps: Camp[] = (data || []).map(camp => ({
          id: camp.id,
          name: camp.name || '',
          nameEn: camp.name_en || camp.name || '',
          location: camp.location || '',
          locationEn: camp.location_en || camp.location || '',
          province: camp.province || '',
          description: camp.description || '',
          descriptionEn: camp.description_en || camp.description || '',
          image: camp.images?.[0] || '/placeholder.svg',
          images: camp.images || [],
          rating: 4.5, // Default rating - could be calculated from reviews
          reviewCount: 0, // Could be fetched separately
          pricePerNight: camp.price_per_night || 0,
          accommodationType: (camp.camp_type as 'tent' | 'dome' | 'cabin') || 'tent',
          highlights: camp.highlights || [],
          facilities: camp.facilities || [],
          maxGuests: camp.max_guests || 4,
          coordinates: {
            lat: camp.latitude || 0,
            lng: camp.longitude || 0,
          },
          isBeginner: camp.is_beginner || false,
          isPopular: camp.is_popular || false,
          distanceFromBangkok: camp.distance_from_bangkok || '',
        }));

        // Maintain order based on favorites array
        const orderedCamps = favorites
          .map(id => transformedCamps.find(c => c.id === id))
          .filter((c): c is Camp => c !== undefined);

        setCamps(orderedCamps);
      } catch (error) {
        console.error('Error fetching favorite camps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteCamps();
    }
  }, [favorites, favoritesLoading]);

  const showLoading = isLoading || favoritesLoading;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('common.favorites')}</h1>
          </div>
          <p className="text-muted-foreground">
            {showLoading
              ? t('common.loading', 'Loading...')
              : camps.length > 0
                ? t('favorites.youHave', { count: camps.length })
                : t('favorites.noCamps')}
          </p>
        </motion.div>

        {showLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : camps.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {camps.map((camp, index) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CampCard camp={camp} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState type="favorites" />
        )}
      </main>

      <Footer />
      <MobileBottomNav />
      <BackToTop />
    </div>
  );
};

export default Favorites;
