import { X, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface FilterState {
  priceRange: [number, number];
  facilities: string[];
  minRating: number;
  categoryFilters: string[];
}

interface ActiveFiltersBarProps {
  filters: FilterState;
  selectedProvince: string | null;
  selectedCategory: string | null;
  onRemoveFilter: (type: string, value?: string) => void;
  onClearAll: () => void;
}

const categoryLabels: Record<string, string> = {
  'near-bangkok': 'filters.nearBangkok',
  'mountain-view': 'filters.mountainView',
  'sea-of-mist': 'filters.seaOfMist',
  'riverside': 'filters.riverside',
  'beach': 'filters.beach',
  'forest': 'filters.forest',
  'glamping': 'categories.glamping',
  'pet-friendly': 'categories.petFriendly',
  'family': 'categories.family',
};

const facilityLabels: Record<string, string> = {
  'electricity': 'filters.hasElectricity',
  'wifi': 'filters.hasWifi',
  'bathroom': 'filters.hasBathroom',
  'hot-water': 'filters.hotWater',
  'parking': 'filters.hasParking',
  'pet': 'filters.petAllowed',
  'tent-rental': 'filters.tentRental',
  'restaurant': 'filters.restaurant',
};

const MIN_PRICE = 0;
const MAX_PRICE = 5000;

const ActiveFiltersBar = ({
  filters,
  selectedProvince,
  selectedCategory,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersBarProps) => {
  const { t } = useTranslation();

  const activeFilters: Array<{ type: string; value?: string; label: string }> = [];

  // Province filter
  if (selectedProvince) {
    activeFilters.push({
      type: 'province',
      label: selectedProvince,
    });
  }

  // Category filter (from CategoryPills)
  if (selectedCategory) {
    activeFilters.push({
      type: 'category',
      label: t(categoryLabels[selectedCategory] || selectedCategory),
    });
  }

  // Price range
  if (filters.priceRange[0] > MIN_PRICE || filters.priceRange[1] < MAX_PRICE) {
    const minLabel = filters.priceRange[0].toLocaleString();
    const maxLabel = filters.priceRange[1] >= MAX_PRICE
      ? `${MAX_PRICE.toLocaleString()}+`
      : filters.priceRange[1].toLocaleString();
    activeFilters.push({
      type: 'priceRange',
      label: `฿${minLabel} - ฿${maxLabel}`,
    });
  }

  // Min rating
  if (filters.minRating > 0) {
    activeFilters.push({
      type: 'minRating',
      label: `${filters.minRating}+ ★`,
    });
  }

  // Category filters (from advanced filter)
  filters.categoryFilters.forEach((cat) => {
    activeFilters.push({
      type: 'categoryFilter',
      value: cat,
      label: t(categoryLabels[cat] || cat),
    });
  });

  // Facilities
  filters.facilities.forEach((facility) => {
    activeFilters.push({
      type: 'facility',
      value: facility,
      label: t(facilityLabels[facility] || facility),
    });
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-2 flex-nowrap">
        {activeFilters.map((filter, index) => (
          <button
            key={`${filter.type}-${filter.value || index}`}
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm whitespace-nowrap hover:bg-primary/20 transition-colors group"
          >
            <span>{filter.label}</span>
            <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground shrink-0 text-xs"
        >
          {t('filters.clearAll')}
        </Button>
      )}
    </div>
  );
};

export default ActiveFiltersBar;
