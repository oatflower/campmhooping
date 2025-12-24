import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AirbnbSearchBar from '@/components/AirbnbSearchBar';
import CategoryPills from '@/components/CategoryPills';
import CampCard from '@/components/CampCard';
import CampSection from '@/components/CampSection';
import MobileBottomNav from '@/components/MobileBottomNav';
import BackToTop from '@/components/BackToTop';
import EmptyState from '@/components/EmptyState';
import AdvancedFilterModal from '@/components/AdvancedFilterModal';
import ActiveFiltersBar from '@/components/ActiveFiltersBar';
import MobileListHeader from '@/components/MobileListHeader';
import PriceNoticeBanner from '@/components/PriceNoticeBanner';
import FloatingMapButton from '@/components/FloatingMapButton';
import MapListingSheet from '@/components/MapListingSheet';
import CampMapView from '@/components/CampMapView';
import MobileSearchSheet from '@/components/search/MobileSearchSheet';
import { categories } from '@/data/camps';
import { useCamps } from '@/hooks/useCamps';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuestState } from '@/components/search/WhoDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterState {
  priceRange: [number, number];
  facilities: string[];
  minRating: number;
  categoryFilters: string[];
}

const CampList = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState<GuestState>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const { camps, loading } = useCamps({
    province: selectedProvince,
    category: selectedCategory,
    guests: guests.adults + guests.children
  });

  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    priceRange: [0, 5000],
    facilities: [],
    minRating: 0,
    categoryFilters: [],
  });

  // Mobile specific states
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [hoveredCampId, setHoveredCampId] = useState<string | null>(null);

  const totalGuests = guests.adults + guests.children;

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
    setShowMobileSearch(false);
  };

  // Check if any filter is active
  const isFilterActive = selectedProvince || selectedCategory || advancedFilters.categoryFilters.length > 0;

  // Section-based camps (for home view without filters)
  // Optimize: Single pass reduction O(N) instead of 8 filters O(8N)
  const categorizedCamps = useMemo(() => {
    const buckets = {
      nearBangkok: [] as typeof camps,
      glamping: [] as typeof camps,
      petFriendly: [] as typeof camps,
      family: [] as typeof camps,
      forestMountain: [] as typeof camps,
      seaOfMist: [] as typeof camps,
      riverside: [] as typeof camps,
      beach: [] as typeof camps
    };

    camps.forEach(camp => {
      // Near Bangkok
      if (['นครราชสีมา', 'กาญจนบุรี', 'สระบุรี', 'ระยอง', 'ปราจีนบุรี'].includes(camp.province)) {
        buckets.nearBangkok.push(camp);
      }
      // Glamping
      if (camp.accommodationType === 'dome' || camp.name?.toLowerCase().includes('glamping')) {
        buckets.glamping.push(camp);
      }
      // Pet Friendly
      if (camp.facilities?.includes('pet') || camp.highlights.some(h => h.includes('สัตว์เลี้ยง'))) {
        buckets.petFriendly.push(camp);
      }
      // Family
      if (camp.isBeginner || camp.highlights.some(h => h.includes('ครอบครัว') || h.includes('family'))) {
        buckets.family.push(camp);
      }
      // Forest & Mountain
      if (camp.highlights.some(h => h.includes('ป่า') || h.includes('เขา') || h.includes('ดอย') || h.includes('ภูเขา'))) {
        buckets.forestMountain.push(camp);
      }
      // Sea of Mist
      if (camp.highlights.some(h => h.includes('ทะเลหมอก') || h.includes('หมอก'))) {
        buckets.seaOfMist.push(camp);
      }
      // Riverside
      if (camp.highlights.some(h => h.includes('ริมแม่น้ำ') || h.includes('แม่น้ำ') || h.includes('ริมน้ำ'))) {
        buckets.riverside.push(camp);
      }
      // Beach
      if (camp.highlights.some(h => h.includes('ริมทะเล') || h.includes('ทะเล') || h.includes('ชายหาด'))) {
        buckets.beach.push(camp);
      }
    });

    return buckets;
  }, [camps]);

  const filteredCamps = useMemo(() => {
    let result = [...camps];

    if (selectedProvince) {
      result = result.filter(camp => camp.province === selectedProvince);
    }

    // Display category filtering (CategoryPills)
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
        case 'mountain-view':
          result = result.filter(camp =>
            camp.highlights.some(h => h.includes('ภูเขา') || h.includes('วิวภูเขา') || h.includes('mountain'))
          );
          break;
        case 'pet-friendly':
          result = result.filter(camp =>
            camp.facilities?.includes('pet') || camp.highlights.some(h => h.includes('สัตว์เลี้ยง'))
          );
          break;
        case 'family':
          result = result.filter(camp =>
            camp.isBeginner || camp.highlights.some(h => h.includes('ครอบครัว') || h.includes('family'))
          );
          break;
      }
    }

    // Advanced category filters (AdvancedFilterModal)
    if (advancedFilters.categoryFilters.length > 0) {
      result = result.filter(camp => {
        return advancedFilters.categoryFilters.some(filter => {
          switch (filter) {
            case 'near-bangkok-weather':
              return ['นครราชสีมา', 'กาญจนบุรี', 'สระบุรี', 'ระยอง', 'ปราจีนบุรี'].includes(camp.province);
            case 'mountain-view':
              return camp.highlights.some(h => h.includes('ภูเขา') || h.includes('วิวภูเขา'));
            case 'sea-of-mist':
              return camp.highlights.some(h => h.includes('ทะเลหมอก'));
            case 'riverside':
              return camp.highlights.some(h => h.includes('ริมแม่น้ำ') || h.includes('ริมน้ำ'));
            case 'beach':
              return camp.highlights.some(h => h.includes('ทะเล') || h.includes('ชายหาด'));
            case 'forest-mountain':
              return camp.highlights.some(h => h.includes('ป่า') || h.includes('เขา'));
            case 'rice-fields':
              return camp.highlights.some(h => h.includes('ทุ่งนา') || h.includes('ธรรมชาติ'));
            case 'stargazing':
              return camp.highlights.some(h => h.includes('ดาว') || h.includes('ดูดาว'));
            default:
              return true;
          }
        });
      });
    }

    return result;
  }, [camps, selectedProvince, selectedCategory, advancedFilters.categoryFilters]);

  const clearFilters = () => {
    setSelectedProvince(null);
    setSelectedCategory(null);
    setCheckIn(undefined);
    setCheckOut(undefined);
    setAdvancedFilters({
      priceRange: [0, 5000],
      facilities: [],
      minRating: 0,
      categoryFilters: [],
    });
  };

  const handleRemoveFilter = (type: string, value?: string) => {
    switch (type) {
      case 'province':
        setSelectedProvince(null);
        break;
      case 'category':
        setSelectedCategory(null);
        break;
      case 'priceRange':
        setAdvancedFilters(prev => ({ ...prev, priceRange: [0, 5000] }));
        break;
      case 'minRating':
        setAdvancedFilters(prev => ({ ...prev, minRating: 0 }));
        break;
      case 'categoryFilter':
        if (value) {
          setAdvancedFilters(prev => ({
            ...prev,
            categoryFilters: prev.categoryFilters.filter(c => c !== value),
          }));
        }
        break;
      case 'facility':
        if (value) {
          setAdvancedFilters(prev => ({
            ...prev,
            facilities: prev.facilities.filter(f => f !== value),
          }));
        }
        break;
    }
  };

  // Check if any advanced filter is active
  const hasActiveAdvancedFilters =
    advancedFilters.priceRange[0] > 0 ||
    advancedFilters.priceRange[1] < 5000 ||
    advancedFilters.facilities.length > 0 ||
    advancedFilters.minRating > 0 ||
    advancedFilters.categoryFilters.length > 0;

  // Get category label for display
  const getCategoryLabel = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      'near-bangkok': t('categories.nearBangkok'),
      'glamping': t('categories.glamping'),
      'mountain-view': t('categories.mountainView'),
      'pet-friendly': t('categories.petFriendly'),
      'family': t('categories.family'),
    };
    return categoryMap[categoryId] || categories.find(c => c.id === categoryId)?.label;
  };

  const scrollToSearch = () => {
    searchBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleMobileSearch = (location: string | null) => {
    setSelectedProvince(location);
    setShowMobileSearch(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
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

      {/* Mobile Header */}
      <MobileListHeader
        location={selectedProvince}
        checkIn={checkIn}
        checkOut={checkOut}
        guestCount={totalGuests}
        onSearchClick={() => setShowMobileSearch(true)}
        onFilterClick={() => setShowFilterModal(true)}
      />

      {/* Mobile Search Sheet */}
      <MobileSearchSheet
        open={showMobileSearch}
        onOpenChange={setShowMobileSearch}
        onSearch={handleSearch}
        onLocationSelect={handleMobileSearch}
      />

      {/* Search Header - Desktop only */}
      <section ref={searchBarRef} className="bg-background/95 backdrop-blur-xl border-b border-border hidden md:block">
        <div className="container py-4">
          <AirbnbSearchBar
            onSearch={handleSearch}
            onLocationSelect={setSelectedProvince}
          />
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 overflow-hidden">
              <CategoryPills
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>
            <AdvancedFilterModal
              onApplyFilters={setAdvancedFilters}
              initialFilters={advancedFilters}
            />
          </div>

          {/* Active Filters Bar */}
          {(selectedProvince || selectedCategory || hasActiveAdvancedFilters) && (
            <ActiveFiltersBar
              filters={advancedFilters}
              selectedProvince={selectedProvince}
              selectedCategory={selectedCategory}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
            />
          )}
        </div>
      </section>

      {/* Mobile: Map View */}
      {isMobile && viewMode === 'map' && (
        <div className="fixed inset-0 z-30 pt-14">
          <CampMapView
            camps={filteredCamps}
            hoveredCampId={hoveredCampId}
            onMarkerClick={(campId) => {
              // Could scroll to camp or open detail
            }}
          />
          <MapListingSheet
            camps={filteredCamps}
            onCampHover={setHoveredCampId}
          />
        </div>
      )}

      {/* Mobile: Price Notice Banner */}
      {isMobile && viewMode === 'list' && isFilterActive && (
        <PriceNoticeBanner />
      )}

      {/* Results */}
      <section className={`container py-6 md:py-8 ${isMobile && viewMode === 'map' ? 'hidden' : ''}`}>
        {/* Show sections when no filter is active */}
        {!isFilterActive ? (
          <div className="space-y-2">
            <CampSection
              title={t('categories.nearBangkok')}
              icon="🌲"
              camps={categorizedCamps.nearBangkok}
              categoryId="near-bangkok"
            />
            <CampSection
              title={t('categories.glamping')}
              icon="🛖"
              camps={categorizedCamps.glamping}
              categoryId="glamping"
            />
            <CampSection
              title={t('categories.petFriendly')}
              icon="🐶"
              camps={categorizedCamps.petFriendly}
              categoryId="pet-friendly"
            />
            <CampSection
              title={t('categories.family')}
              icon="👨‍👩‍👧‍👦"
              camps={categorizedCamps.family}
              categoryId="family"
            />
            <CampSection
              title={t('categories.forestMountain')}
              icon="🌳"
              camps={categorizedCamps.forestMountain}
              categoryId="forest-mountain"
            />
            <CampSection
              title={t('categories.seaOfMist')}
              icon="☁️"
              camps={categorizedCamps.seaOfMist}
              categoryId="sea-of-mist"
            />
            <CampSection
              title={t('categories.riverside')}
              icon="🌊"
              camps={categorizedCamps.riverside}
              categoryId="riverside"
            />
            <CampSection
              title={t('categories.beach')}
              icon="🏖️"
              camps={categorizedCamps.beach}
              categoryId="beach"
            />
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {selectedProvince
                    ? `${t('common.campsIn')} ${selectedProvince}`
                    : selectedCategory
                      ? getCategoryLabel(selectedCategory)
                      : t('common.allCamps')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('common.found')} {filteredCamps.length} {t('common.camps')}
                </p>
              </div>
              <div className="flex gap-2">
                {(selectedProvince || selectedCategory) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    {t('common.clearFilters')}
                  </Button>
                )}
              </div>
            </div>

            {/* Camp Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredCamps.map((camp, index) => (
                <CampCard
                  key={camp.id}
                  camp={camp}
                  index={index}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onHover={setHoveredCampId}
                />
              ))}
            </div>

            {filteredCamps.length === 0 && (
              <EmptyState type="search" actionLabel={t('common.clearFilters')} onAction={clearFilters} />
            )}
          </>
        )}
      </section>

      {/* Floating Map Button - Mobile only */}
      {isMobile && isFilterActive && (
        <FloatingMapButton
          viewMode={viewMode}
          onToggle={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        />
      )}

      <Footer />
      <MobileBottomNav />
      <BackToTop />
    </div>
  );
};

export default CampList;