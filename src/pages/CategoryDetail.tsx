import { useState, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { camps, categories } from '@/data/camps';
import CampCard from '@/components/CampCard';
import AdvancedFilterModal from '@/components/AdvancedFilterModal';
import { ChevronLeft, LayoutGrid, Map, List, X, SlidersHorizontal, Loader2 } from 'lucide-react';

// Lazy load the map component (includes large mapbox-gl library)
const CampMapView = lazy(() => import('@/components/CampMapView'));
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

interface FilterState {
  priceRange: [number, number];
  facilities: string[];
  minRating: number;
  categoryFilters: string[];
}

// Category filter functions
const categoryFilters: Record<string, (camp: typeof camps[0]) => boolean> = {
  'near-bangkok': (camp) => 
    ['นครราชสีมา', 'กาญจนบุรี', 'สระบุรี', 'ระยอง', 'ปราจีนบุรี'].includes(camp.province),
  'glamping': (camp) => 
    camp.accommodationType === 'dome' || camp.name?.toLowerCase().includes('glamping'),
  'pet-friendly': (camp) => 
    camp.facilities?.includes('pet') || camp.highlights.some(h => h.includes('สัตว์เลี้ยง')),
  'family': (camp) => 
    camp.isBeginner || camp.highlights.some(h => h.includes('ครอบครัว') || h.includes('family')),
  'forest-mountain': (camp) => 
    camp.highlights.some(h => h.includes('ป่า') || h.includes('เขา') || h.includes('ดอย') || h.includes('ภูเขา')),
  'sea-of-mist': (camp) => 
    camp.highlights.some(h => h.includes('ทะเลหมอก') || h.includes('หมอก')),
  'riverside': (camp) => 
    camp.highlights.some(h => h.includes('ริมแม่น้ำ') || h.includes('แม่น้ำ') || h.includes('ริมน้ำ')),
  'beach': (camp) => 
    camp.highlights.some(h => h.includes('ริมทะเล') || h.includes('ทะเล') || h.includes('ชายหาด')),
  'popular': (camp) => camp.isPopular,
  'beginner': (camp) => camp.isBeginner,
};

const categoryConfig: Record<string, { titleKey: string; icon: string }> = {
  'near-bangkok': { titleKey: 'categoryDetail.nearBangkok', icon: '🌲' },
  'glamping': { titleKey: 'categories.glamping', icon: '🛖' },
  'pet-friendly': { titleKey: 'categoryDetail.petFriendly', icon: '🐶' },
  'family': { titleKey: 'categoryDetail.family', icon: '👨‍👩‍👧‍👦' },
  'forest-mountain': { titleKey: 'categoryDetail.forest', icon: '🌳' },
  'sea-of-mist': { titleKey: 'categoryDetail.seaOfMist', icon: '☁️' },
  'riverside': { titleKey: 'categoryDetail.riverside', icon: '🌊' },
  'beach': { titleKey: 'categoryDetail.beach', icon: '🏖️' },
  'popular': { titleKey: 'categoryDetail.popular', icon: '⭐' },
  'beginner': { titleKey: 'categoryDetail.beginner', icon: '🏕️' },
};

const CategoryDetail = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { categoryId } = useParams<{ categoryId: string }>();
  const isMobile = useIsMobile();
  const [hoveredCampId, setHoveredCampId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    priceRange: [0, 5000],
    facilities: [],
    minRating: 0,
    categoryFilters: [],
  });

  const filteredCamps = useMemo(() => {
    let result = camps;

    // Apply category filter
    if (categoryId && categoryFilters[categoryId]) {
      result = result.filter(categoryFilters[categoryId]);
    }

    // Apply price filter
    if (advancedFilters.priceRange[0] > 0 || advancedFilters.priceRange[1] < 5000) {
      result = result.filter(camp =>
        camp.pricePerNight >= advancedFilters.priceRange[0] &&
        camp.pricePerNight <= advancedFilters.priceRange[1]
      );
    }

    // Apply rating filter
    if (advancedFilters.minRating > 0) {
      result = result.filter(camp => camp.rating >= advancedFilters.minRating);
    }

    // Apply facilities filter
    if (advancedFilters.facilities.length > 0) {
      result = result.filter(camp =>
        advancedFilters.facilities.every(f => camp.facilities?.includes(f))
      );
    }

    return result;
  }, [categoryId, advancedFilters]);

  const categoryConfigItem = categoryId ? categoryConfig[categoryId] : null;
  const categoryInfo = categoryConfigItem
    ? { title: t(categoryConfigItem.titleKey), icon: categoryConfigItem.icon }
    : null;
  const selectedCamp = selectedCampId ? filteredCamps.find(c => c.id === selectedCampId) : null;

  const handleMarkerClick = (campId: string) => {
    if (isMobile) {
      setSelectedCampId(campId);
    } else {
      const element = document.getElementById(`camp-card-${campId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {categoryInfo && (
                <>
                  <span className="text-xl">{categoryInfo.icon}</span>
                  <h1 className="text-base font-semibold">{categoryInfo.title}</h1>
                </>
              )}
              <span className="text-sm text-muted-foreground">({filteredCamps.length})</span>
            </div>
            <AdvancedFilterModal
              onApplyFilters={setAdvancedFilters}
              initialFilters={advancedFilters}
            />
          </div>
        </header>

        {/* Main Content - Toggle between List and Map */}
        {mobileView === 'list' ? (
          <div className="pt-14 pb-20">
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
              {filteredCamps.map((camp, index) => (
                <div key={camp.id} id={`camp-card-${camp.id}`}>
                  <CampCard
                    camp={camp}
                    index={index}
                    onHover={setHoveredCampId}
                    isHighlighted={hoveredCampId === camp.id}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 pt-14">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
              <CampMapView
                camps={filteredCamps}
                hoveredCampId={hoveredCampId}
                onMarkerClick={handleMarkerClick}
              />
            </Suspense>
          </div>
        )}

        {/* Floating Toggle Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
            className="rounded-full shadow-lg px-6 py-3 h-12 gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {mobileView === 'list' ? (
              <>
                <Map className="w-5 h-5" />
                <span>{t('categoryDetail.map')}</span>
              </>
            ) : (
              <>
                <List className="w-5 h-5" />
                <span>{t('categoryDetail.list')}</span>
              </>
            )}
          </Button>
        </div>

        {/* Selected Camp Bottom Sheet */}
        <Sheet open={!!selectedCampId} onOpenChange={(open) => !open && setSelectedCampId(null)}>
          <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-3xl p-0" hideCloseButton>
            {selectedCamp && (
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setSelectedCampId(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <Link to={`/camp/${selectedCamp.id}`}>
                  <div className="flex gap-4">
                    <img
                      src={selectedCamp.image}
                      alt={selectedCamp.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{selectedCamp.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCamp.province}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm">⭐ {selectedCamp.rating}</span>
                        <span className="text-sm text-muted-foreground">({selectedCamp.reviewCount})</span>
                      </div>
                      <p className="text-base font-semibold text-foreground mt-2">
                        {formatPrice(selectedCamp.pricePerNight)}
                        <span className="text-sm font-normal text-muted-foreground">/{t('common.night')}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {categoryInfo && (
                <>
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <h1 className="text-xl font-bold">{categoryInfo.title}</h1>
                </>
              )}
              <span className="text-muted-foreground">({filteredCamps.length} {t('common.camps')})</span>
            </div>
          </div>

          {/* Toggle Map/Grid + Filter */}
          <div className="flex items-center gap-2">
            <AdvancedFilterModal
              onApplyFilters={setAdvancedFilters}
              initialFilters={advancedFilters}
            />
            <Button
              variant={showMap ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMap(true)}
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">{t('categoryDetail.map')}</span>
            </Button>
            <Button
              variant={!showMap ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMap(false)}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('categoryDetail.grid')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Side - Camp List */}
        <div className={`${showMap ? 'w-full lg:w-[55%]' : 'w-full'} overflow-y-auto`}>
          <div className={`p-4 ${showMap ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-6'}`}>
            {filteredCamps.map((camp, index) => (
              <div
                key={camp.id}
                id={`camp-card-${camp.id}`}
              >
                <CampCard
                  camp={camp}
                  index={index}
                  onHover={setHoveredCampId}
                  isHighlighted={hoveredCampId === camp.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Map */}
        {showMap && (
          <div className="hidden lg:block w-[45%] sticky top-[65px] h-[calc(100vh-65px)]">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
              <CampMapView
                camps={filteredCamps}
                hoveredCampId={hoveredCampId}
                onMarkerClick={handleMarkerClick}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
