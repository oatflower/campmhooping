import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AirbnbSearchBar from '@/components/AirbnbSearchBar';
import { GuestState } from '@/components/search/WhoDropdown';
import CampCard from '@/components/CampCard';
import CampSection from '@/components/CampSection';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobilePillSearch from '@/components/MobilePillSearch';
import MobileSearchSheet from '@/components/search/MobileSearchSheet';
import BackToTop from '@/components/BackToTop';
import EmptyState from '@/components/EmptyState';
import AdvancedFilterModal from '@/components/AdvancedFilterModal';
import LanguageCurrencyModal from '@/components/LanguageCurrencyModal';
import { useCamps } from '@/hooks/useCamps';
import { Button } from '@/components/ui/button';
import { Trees, Users, MapPin, Star, ChevronRight, Flame, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchPersistence } from '@/hooks/use-search-persistence';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { cn } from '@/lib/utils';

interface FilterState {
  priceRange: [number, number];
  facilities: string[];
  minRating: number;
  categoryFilters: string[];
}

// Quick filter pills data
const quickFilterIds = [
  { id: 'near-bangkok', icon: '🌲', key: 'nearBangkok' },
  { id: 'glamping', icon: '⛺', key: 'glamping' },
  { id: 'mountain', icon: '🌄', key: 'mountainView' },
  { id: 'pet', icon: '🐶', key: 'petFriendly' },
  { id: 'riverside', icon: '🌊', key: 'riverside' },
  { id: 'family', icon: '👨‍👩‍👧', key: 'family' },
];

// Community stats - real data (fetched from API in production)
const communityStats = {
  activeCampers: 0,
  activeCamps: 0,
  tripTypes: { solo: 0, friends: 0, family: 0 },
  activeJams: 0,
};

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    isLoaded,
    selectedProvince,
    selectedCategory,
    checkIn,
    checkOut,
    guests,
    setSelectedProvince,
    setSelectedCategory,
    setCheckIn,
    setCheckOut,
    setGuests,
    clearSearch,
  } = useSearchPersistence();

  const { camps, loading } = useCamps({
    province: selectedProvince,
    category: selectedCategory,
  });

  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    priceRange: [0, 5000],
    facilities: [],
    minRating: 0,
    categoryFilters: [],
  });
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (params: {
    location: string | null;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: GuestState;
  }) => {
    setSelectedProvince(params.location);
    setCheckIn(params.checkIn);
    setCheckOut(params.checkOut);
    setGuests(params.guests);
  };

  const handleQuickFilter = (filterId: string) => {
    setSelectedCategory(filterId);
  };

  const applyAdvancedFilters = useCallback((campList: typeof camps) => {
    let result = [...campList];
    if (advancedFilters.priceRange[0] > 0 || advancedFilters.priceRange[1] < 5000) {
      result = result.filter(camp =>
        camp.pricePerNight >= advancedFilters.priceRange[0] &&
        camp.pricePerNight <= advancedFilters.priceRange[1]
      );
    }
    if (advancedFilters.minRating > 0) {
      result = result.filter(camp => camp.rating >= advancedFilters.minRating);
    }
    if (advancedFilters.facilities.length > 0) {
      result = result.filter(camp =>
        advancedFilters.facilities.every(f => camp.facilities?.includes(f))
      );
    }
    return result;
  }, [advancedFilters]);

  const filteredCamps = useMemo(() => {
    let result = [...camps];
    if (selectedProvince) {
      result = result.filter(camp => camp.province === selectedProvince);
    }
    if (selectedCategory) {
      switch (selectedCategory) {
        case 'near-bangkok':
          result = result.filter(camp =>
            ['นครราชสีมา', 'กาญจนบุรี', 'สระบุรี', 'ระยอง', 'ปราจีนบุรี'].includes(camp.province)
          );
          break;
        case 'glamping':
          result = result.filter(camp =>
            camp.accommodationType === 'dome' || camp.name?.toLowerCase().includes('glamping')
          );
          break;
        case 'mountain':
          result = result.filter(camp =>
            camp.highlights.some(h => h.includes('ภูเขา') || h.includes('เขา') || h.includes('ดอย'))
          );
          break;
        case 'pet':
          result = result.filter(camp =>
            camp.facilities?.includes('pet') || camp.highlights.some(h => h.includes('สัตว์เลี้ยง'))
          );
          break;
        case 'riverside':
          result = result.filter(camp =>
            camp.highlights.some(h => h.includes('ริมแม่น้ำ') || h.includes('ริมน้ำ'))
          );
          break;
        case 'family':
          result = result.filter(camp => camp.isBeginner);
          break;
      }
    }
    return applyAdvancedFilters(result);
  }, [camps, selectedProvince, selectedCategory, applyAdvancedFilters]);

  // Section camps
  const { recentIds } = useRecentlyViewed();

  const recentlyViewedCamps = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .map(id => camps.find(c => c.id === id))
      .filter((c): c is typeof camps[0] => !!c);
  }, [camps, recentIds]);

  const recommendedCamps = useMemo(() => {
    return applyAdvancedFilters(camps.filter(c => c.isPopular).slice(0, 8));
  }, [camps, applyAdvancedFilters]);

  const nearBangkokCamps = useMemo(() => {
    return applyAdvancedFilters(camps.filter(camp =>
      ['นครราชสีมา', 'กาญจนบุรี', 'สระบุรี', 'ระยอง', 'ปราจีนบุรี'].includes(camp.province)
    ));
  }, [camps, applyAdvancedFilters]);

  const glampingCamps = useMemo(() => {
    return applyAdvancedFilters(camps.filter(camp =>
      camp.accommodationType === 'dome' || camp.name?.toLowerCase().includes('glamping')
    ));
  }, [camps, applyAdvancedFilters]);

  const petFriendlyCamps = useMemo(() => {
    return applyAdvancedFilters(camps.filter(camp =>
      camp.facilities?.includes('pet') || camp.highlights.some(h => h.includes('สัตว์เลี้ยง'))
    ));
  }, [camps, applyAdvancedFilters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-3 py-2.5 flex items-center gap-2">
          <Link to="/" className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-forest flex items-center justify-center">
              <Trees className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <MobilePillSearch
              onClick={() => setMobileSearchOpen(true)}
              location={selectedProvince}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
            />
          </div>
          <AdvancedFilterModal
            onApplyFilters={setAdvancedFilters}
            initialFilters={advancedFilters}
          />
          <LanguageCurrencyModal />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 z-50">
        <Header
          showCompactSearch
          compactSearchLabel={selectedProvince || undefined}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onSearch={handleSearch}
          onLocationSelect={setSelectedProvince}
        />
      </div>

      {/* Hero Section */}
      <section className="relative">
        {/* Search Bar - Desktop */}
        <motion.div
          initial={{ opacity: 1, scaleY: 1 }}
          animate={{ opacity: isScrolled ? 0 : 1, scaleY: isScrolled ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          style={{ transformOrigin: 'top' }}
          className="hidden md:block bg-background border-b border-border/50 shadow-sm"
        >
          <div className="container py-4">
            <AirbnbSearchBar
              onSearch={handleSearch}
              onLocationSelect={setSelectedProvince}
            />
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="container py-12 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
              {t('hero.title1')}
              <br />
              <span className="text-forest">{t('hero.title2')}</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          {/* Quick Filter Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8"
          >
            {quickFilterIds.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all",
                  "hover:border-foreground/50 hover:bg-secondary/50",
                  selectedCategory === filter.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background"
                )}
              >
                <span>{filter.icon}</span>
                <span className="text-sm font-medium">{t(`quickFilters.${filter.key}`)}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community at Camp Section */}
      <section className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-forest/5 to-forest/10 rounded-3xl p-6 md:p-8 border border-forest/20"
        >
          <div className="flex items-start gap-3 mb-6">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">{t('community.atCamp')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('community.todayCampersActive')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-forest">{communityStats.activeCampers}</div>
              <div className="text-sm text-muted-foreground">{t('community.campiiToday')}</div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-forest">{communityStats.activeCamps}</div>
              <div className="text-sm text-muted-foreground">{t('community.campsNationwide')}</div>
            </div>
          </div>

          {/* Trip Types */}
          <div className="flex items-center justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>{communityStats.tripTypes.solo}% Solo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>{communityStats.tripTypes.friends}% Friends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>{communityStats.tripTypes.family}% Family</span>
            </div>
          </div>

          {/* Active Jams */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">
              {t('community.activeJams', { count: communityStats.activeJams })}
            </span>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate('/community')}
            className="w-full bg-forest hover:bg-forest/90 text-white"
          >
            {t('community.viewToday')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('community.availableDuringStay')}
          </p>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="container py-8">
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-4 rounded-2xl bg-secondary/50"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trees className="w-5 h-5 text-forest" />
              <span className="text-2xl font-bold">500+</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('stats.camps')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-4 rounded-2xl bg-secondary/50"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">10,000+</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('stats.reviews')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 rounded-2xl bg-secondary/50"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold">50</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('stats.provinces')}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      {(selectedProvince || selectedCategory) ? (
        <section className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">
              {selectedCategory && t(`quickFilters.${quickFilterIds.find(f => f.id === selectedCategory)?.key}`)}
              {selectedProvince && t('home.campsIn', { province: selectedProvince })}
              <span className="text-muted-foreground font-normal ml-2">
                {t('home.campsCount', { count: filteredCamps.length })}
              </span>
            </h2>
            <Button variant="ghost" onClick={clearSearch}>
              {t('home.clearFilter')}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredCamps.map((camp, index) => (
              <CampCard key={camp.id} camp={camp} index={index} />
            ))}
          </div>
          {filteredCamps.length === 0 && <EmptyState type="search" />}
        </section>
      ) : (
        <>


          {/* Camp Sections */}
          <section className="container py-6">
            <div className="space-y-2">
              {recentlyViewedCamps.length > 0 && (
                <CampSection
                  title={t('home.recentlyViewed')}
                  icon="🕒"
                  camps={recentlyViewedCamps}
                  categoryId="recently-viewed"
                />
              )}
              <CampSection
                title={t('home.nearBangkok')}
                icon="🌲"
                camps={nearBangkokCamps}
                categoryId="near-bangkok"
              />
              <CampSection
                title="Glamping"
                icon="⛺"
                camps={glampingCamps}
                categoryId="glamping"
              />
              <CampSection
                title={t('home.petFriendly')}
                icon="🐶"
                camps={petFriendlyCamps}
                categoryId="pet"
              />
            </div>
          </section>
        </>
      )}

      <Footer />
      <MobileBottomNav />
      <BackToTop />

      <MobileSearchSheet
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        onSearch={handleSearch}
        onLocationSelect={setSelectedProvince}
        initialLocation={selectedProvince || undefined}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
      />
    </div>
  );
};

export default Index;
