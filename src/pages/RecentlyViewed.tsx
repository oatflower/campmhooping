import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CampCard from '@/components/CampCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Trash2, Loader2 } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { supabase } from '@/lib/supabase';
import { useFavorites } from '@/contexts/FavoritesContext';

interface Camp {
  id: string;
  name: string;
  location: string;
  province: string;
  price_per_night: number;
  images: string[];
  rating?: number;
  review_count?: number;
  highlights?: string[];
}

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { recentIds } = useRecentlyViewed();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCamps = async () => {
      if (recentIds.length === 0) {
        setCamps([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('camps')
          .select('id, name, location, province, price_per_night, images, highlights')
          .in('id', recentIds);

        if (error) throw error;

        // Sort by the order in recentIds to maintain recency order
        const sortedCamps = recentIds
          .map(id => data?.find(c => c.id === id))
          .filter((c): c is Camp => c !== undefined);

        setCamps(sortedCamps);
      } catch (error) {
        console.error('Error fetching recently viewed camps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCamps();
  }, [recentIds]);

  const handleClearHistory = () => {
    localStorage.removeItem('recently_viewed_camps');
    setCamps([]);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  {t('recentlyViewed.title', 'Recently Viewed')}
                </h1>
                <p className="text-muted-foreground">
                  {t('recentlyViewed.subtitle', 'Camps you have looked at recently')}
                </p>
              </div>
            </div>

            {camps.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('recentlyViewed.clearAll', 'Clear All')}
              </Button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : camps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {camps.map((camp, index) => (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CampCard
                    id={camp.id}
                    name={camp.name}
                    location={camp.location || camp.province}
                    price={camp.price_per_night}
                    images={camp.images || []}
                    rating={camp.rating || 4.5}
                    reviewCount={camp.review_count || 0}
                    highlight={camp.highlights?.[0]}
                    isFavorite={isFavorite(camp.id)}
                    onFavoriteClick={() => toggleFavorite(camp.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('recentlyViewed.empty', 'No recently viewed camps')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('recentlyViewed.emptyDesc', "Camps you view will appear here so you can easily find them again.")}
              </p>
              <Button onClick={() => navigate('/camps')}>
                {t('recentlyViewed.browseCamps', 'Browse Camps')}
              </Button>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default RecentlyViewed;
