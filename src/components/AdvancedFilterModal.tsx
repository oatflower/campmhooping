import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import PriceHistogram from './PriceHistogram';
import { camps } from '@/data/camps';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterState {
  priceRange: [number, number];
  facilities: string[];
  minRating: number;
  categoryFilters: string[];
  accommodationType: string;
  // Camping-specific filters
  signalStrength: string[];
  petSize: string[];
  bathroomType: string[];
  groundCondition: string[];
}

interface AdvancedFilterModalProps {
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

// Category/Environment filters
const categoryOptions = [
  { id: 'near-bangkok', labelKey: 'filters.nearBangkok', icon: '🚗' },
  { id: 'mountain-view', labelKey: 'filters.mountainView', icon: '🏔️' },
  { id: 'sea-of-mist', labelKey: 'filters.seaOfMist', icon: '☁️' },
  { id: 'riverside', labelKey: 'filters.riverside', icon: '🌊' },
  { id: 'beach', labelKey: 'filters.beach', icon: '🏖️' },
  { id: 'forest', labelKey: 'filters.forest', icon: '🌲' },
];

// Simple facility filters - combined all into one section
const facilityOptions = [
  { id: 'electricity', icon: '🔌', labelKey: 'filters.hasElectricity' },
  { id: 'wifi', icon: '📶', labelKey: 'filters.hasWifi' },
  { id: 'bathroom', icon: '🚿', labelKey: 'filters.hasBathroom' },
  { id: 'hot-water', icon: '♨️', labelKey: 'filters.hotWater' },
  { id: 'parking', icon: '🅿️', labelKey: 'filters.hasParking' },
  { id: 'pet', icon: '🐕', labelKey: 'filters.petAllowed' },
  { id: 'tent-rental', icon: '⛺', labelKey: 'filters.tentRental' },
  { id: 'restaurant', icon: '🍽️', labelKey: 'filters.restaurant' },
];

// Mobile signal strength options (specific for Thai carriers)
const signalOptions = [
  { id: 'ais', labelKey: 'filters.signalAIS', icon: '📶' },
  { id: 'true', labelKey: 'filters.signalTrue', icon: '📶' },
  { id: 'dtac', labelKey: 'filters.signalDTAC', icon: '📶' },
  { id: 'no-signal', labelKey: 'filters.noSignal', icon: '📵' },
];

// Pet size options (Thai camps often have size restrictions)
const petSizeOptions = [
  { id: 'small-pet', labelKey: 'filters.petSmall', icon: '🐕' },
  { id: 'large-pet', labelKey: 'filters.petLarge', icon: '🦮' },
  { id: 'exotic-pet', labelKey: 'filters.petExotic', icon: '🦎' },
];

// Bathroom type options
const bathroomTypeOptions = [
  { id: 'private-bathroom', labelKey: 'filters.bathroomPrivate', icon: '🚿' },
  { id: 'shared-bathroom', labelKey: 'filters.bathroomShared', icon: '🚻' },
];

// Ground condition options (important for tent campers)
const groundConditionOptions = [
  { id: 'grass', labelKey: 'filters.groundGrass', icon: '🌿' },
  { id: 'gravel', labelKey: 'filters.groundGravel', icon: '🪨' },
  { id: 'soil', labelKey: 'filters.groundSoil', icon: '🟤' },
  { id: 'concrete', labelKey: 'filters.groundConcrete', icon: '⬜' },
];

// Accommodation types
const accommodationTypes = [
  { id: 'all', labelKey: 'filters.anyType' },
  { id: 'tent', labelKey: 'accommodation.tent' },
  { id: 'dome', labelKey: 'accommodation.dome' },
];

// Rating options
const ratingOptions = [4.5, 4, 3.5, 3];

const MIN_PRICE = 0;
const MAX_PRICE = 5000;

const AdvancedFilterModal = ({ onApplyFilters, initialFilters }: AdvancedFilterModalProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || [MIN_PRICE, MAX_PRICE]
  );
  const [facilities, setFacilities] = useState<string[]>(
    initialFilters?.facilities || []
  );
  const [minRating, setMinRating] = useState<number>(
    initialFilters?.minRating || 0
  );
  const [categoryFilters, setCategoryFilters] = useState<string[]>(
    initialFilters?.categoryFilters || []
  );
  const [accommodationType, setAccommodationType] = useState<string>(
    initialFilters?.accommodationType || 'all'
  );
  const [signalStrength, setSignalStrength] = useState<string[]>(
    initialFilters?.signalStrength || []
  );
  const [petSize, setPetSize] = useState<string[]>(
    initialFilters?.petSize || []
  );
  const [bathroomType, setBathroomType] = useState<string[]>(
    initialFilters?.bathroomType || []
  );
  const [groundCondition, setGroundCondition] = useState<string[]>(
    initialFilters?.groundCondition || []
  );

  const handleFacilityToggle = (facilityId: string) => {
    setFacilities(prev =>
      prev.includes(facilityId)
        ? prev.filter(f => f !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setCategoryFilters(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSignalToggle = (signalId: string) => {
    setSignalStrength(prev =>
      prev.includes(signalId)
        ? prev.filter(s => s !== signalId)
        : [...prev, signalId]
    );
  };

  const handlePetSizeToggle = (petId: string) => {
    setPetSize(prev =>
      prev.includes(petId)
        ? prev.filter(p => p !== petId)
        : [...prev, petId]
    );
  };

  const handleBathroomTypeToggle = (bathroomId: string) => {
    setBathroomType(prev =>
      prev.includes(bathroomId)
        ? prev.filter(b => b !== bathroomId)
        : [...prev, bathroomId]
    );
  };

  const handleGroundConditionToggle = (groundId: string) => {
    setGroundCondition(prev =>
      prev.includes(groundId)
        ? prev.filter(g => g !== groundId)
        : [...prev, groundId]
    );
  };

  const handleMinPriceChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || MIN_PRICE;
    const clampedValue = Math.min(Math.max(numValue, MIN_PRICE), priceRange[1]);
    setPriceRange([clampedValue, priceRange[1]]);
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || MAX_PRICE;
    const clampedValue = Math.min(Math.max(numValue, priceRange[0]), MAX_PRICE);
    setPriceRange([priceRange[0], clampedValue]);
  };

  const handleApply = () => {
    onApplyFilters({
      priceRange,
      facilities,
      minRating,
      categoryFilters,
      accommodationType,
      signalStrength,
      petSize,
      bathroomType,
      groundCondition,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setFacilities([]);
    setMinRating(0);
    setCategoryFilters([]);
    setAccommodationType('all');
    setSignalStrength([]);
    setPetSize([]);
    setBathroomType([]);
    setGroundCondition([]);
  };

  const activeFiltersCount =
    (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE ? 1 : 0) +
    (facilities.length > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (categoryFilters.length > 0 ? 1 : 0) +
    (accommodationType !== 'all' ? 1 : 0) +
    (signalStrength.length > 0 ? 1 : 0) +
    (petSize.length > 0 ? 1 : 0) +
    (bathroomType.length > 0 ? 1 : 0) +
    (groundCondition.length > 0 ? 1 : 0);

  const TriggerButton = (
    <Button variant="outline" size="icon" className="relative shrink-0 rounded-xl w-10 h-10">
      <SlidersHorizontal className="w-5 h-5" />
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );

  const FilterContent = (
    <div className="space-y-6">
      {/* 1. Type of place (Segmented Control) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.typeOfPlace')}</Label>
        <div className="flex rounded-full bg-secondary p-1">
          {accommodationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setAccommodationType(type.id)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all",
                accommodationType === type.id
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(type.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Environment (Pill buttons) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.environment')}</Label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                categoryFilters.includes(category.id)
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span>{category.icon}</span>
              <span>{t(category.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.priceRange')}</Label>

        <div className="relative pt-2">
          <PriceHistogram
            camps={camps}
            minPrice={MIN_PRICE}
            maxPrice={MAX_PRICE}
            selectedRange={priceRange}
          />
          <div className="absolute bottom-0 left-0 right-0 -mb-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={100}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <span className="text-sm text-muted-foreground">฿</span>
            <Input
              type="text"
              inputMode="numeric"
              value={priceRange[0].toLocaleString()}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="border-0 p-0 h-auto text-sm font-medium bg-transparent focus-visible:ring-0"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <span className="text-sm text-muted-foreground">฿</span>
            <Input
              type="text"
              inputMode="numeric"
              value={priceRange[1].toLocaleString()}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="border-0 p-0 h-auto text-sm font-medium bg-transparent focus-visible:ring-0"
            />
            {priceRange[1] >= MAX_PRICE && <span className="text-sm font-medium">+</span>}
          </div>
        </div>
      </div>

      {/* 4. Rating */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.minRating')}</Label>
        <div className="flex gap-2">
          {ratingOptions.map(rating => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all",
                minRating === rating
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{rating}+</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Facilities (Simple grid) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.amenities')}</Label>
        <div className="grid grid-cols-2 gap-2">
          {facilityOptions.map(facility => (
            <button
              key={facility.id}
              onClick={() => handleFacilityToggle(facility.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all",
                facilities.includes(facility.id)
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span className="text-base">{facility.icon}</span>
              <span className="truncate">{t(facility.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Mobile Signal Strength (Thai Carriers) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.signalStrength')}</Label>
        <div className="flex flex-wrap gap-2">
          {signalOptions.map(signal => (
            <button
              key={signal.id}
              onClick={() => handleSignalToggle(signal.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                signalStrength.includes(signal.id)
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span>{signal.icon}</span>
              <span>{t(signal.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Pet Size */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.petSize')}</Label>
        <div className="flex flex-wrap gap-2">
          {petSizeOptions.map(pet => (
            <button
              key={pet.id}
              onClick={() => handlePetSizeToggle(pet.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                petSize.includes(pet.id)
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span>{pet.icon}</span>
              <span>{t(pet.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 8. Bathroom Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.bathroomType')}</Label>
        <div className="flex flex-wrap gap-2">
          {bathroomTypeOptions.map(bathroom => (
            <button
              key={bathroom.id}
              onClick={() => handleBathroomTypeToggle(bathroom.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                bathroomType.includes(bathroom.id)
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span>{bathroom.icon}</span>
              <span>{t(bathroom.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 9. Ground Condition (for tent campers) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">{t('filters.groundCondition')}</Label>
        <div className="flex flex-wrap gap-2">
          {groundConditionOptions.map(ground => (
            <button
              key={ground.id}
              onClick={() => handleGroundConditionToggle(ground.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                groundCondition.includes(ground.id)
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span>{ground.icon}</span>
              <span>{t(ground.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ActionButtons = (
    <div className="flex gap-3 pt-4 border-t">
      <Button
        variant="ghost"
        className="flex-1 h-11 text-sm underline underline-offset-2"
        onClick={handleReset}
      >
        {t('filters.clearAll')}
      </Button>
      <Button
        className="flex-1 h-11 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90"
        onClick={handleApply}
      >
        {t('filters.showResults')}
      </Button>
    </div>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <button onClick={() => setIsOpen(false)} className="p-2 -ml-2">
                <X className="w-5 h-5" />
              </button>
              <DrawerTitle className="text-base font-semibold">{t('filters.filters')}</DrawerTitle>
              <div className="w-9" />
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {FilterContent}
          </div>
          <div className="px-4 pb-6 pt-2">
            {ActionButtons}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-base font-semibold">
            {t('filters.filters')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {FilterContent}
        </div>
        {ActionButtons}
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilterModal;
