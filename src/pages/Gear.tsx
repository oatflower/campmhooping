import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GearCard from '@/components/GearCard';
import MobileBottomNav from '@/components/MobileBottomNav';
import BackToTop from '@/components/BackToTop';
import { gearItems, gearCategories } from '@/data/gear';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

const Gear = () => {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems =
    selectedCategory === 'all'
      ? gearItems
      : gearItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-forest text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {t('gear.title')}
              </h1>
              <p className="text-white/80 text-lg">
                {t('gear.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border py-4">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {gearCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-forest text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {i18n.language === 'th' ? category.name : category.nameEn}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {t('gear.found', { count: filteredItems.length })}
              </p>
            </div>

            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GearCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="py-8 bg-cream">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="font-semibold mb-1">{t('gear.freeShipping')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('gear.minOrder', { amount: formatPrice(1000) })}
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold mb-1">{t('gear.qualityGuarantee')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('gear.returnPolicy')}
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold mb-1">{t('gear.supportTeam')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('gear.support24h')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
      <BackToTop />
    </div>
  );
};

export default Gear;
