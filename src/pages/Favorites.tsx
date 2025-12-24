import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CampCard from '@/components/CampCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import BackToTop from '@/components/BackToTop';
import EmptyState from '@/components/EmptyState';
import { useFavorites } from '@/contexts/FavoritesContext';
import { camps } from '@/data/camps';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites } = useFavorites();
  const favoriteCamps = camps.filter(camp => favorites.includes(camp.id));

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
            {favoriteCamps.length > 0
              ? t('favorites.youHave', { count: favoriteCamps.length })
              : t('favorites.noCamps')}
          </p>
        </motion.div>

        {favoriteCamps.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriteCamps.map((camp, index) => (
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
