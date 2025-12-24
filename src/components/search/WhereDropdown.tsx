import { useState, useRef, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { camps } from '@/data/camps';

export interface ProvinceData {
  name: string;
  nameKey: string;
  icon: string;
  descKey: string;
}

export const provinceData: ProvinceData[] = [
  { name: 'เชียงใหม่', nameKey: 'provinces.chiangMai', icon: '🏔️', descKey: 'provinces.chiangMaiDesc' },
  { name: 'นครราชสีมา', nameKey: 'provinces.nakhonRatchasima', icon: '🌲', descKey: 'provinces.nakhonRatchasimaDesc' },
  { name: 'กาญจนบุรี', nameKey: 'provinces.kanchanaburi', icon: '🌊', descKey: 'provinces.kanchanaburiDesc' },
  { name: 'เพชรบูรณ์', nameKey: 'provinces.phetchabun', icon: '☁️', descKey: 'provinces.phetchabunDesc' },
  { name: 'สระบุรี', nameKey: 'provinces.saraburi', icon: '🌳', descKey: 'provinces.saraburiDesc' },
  { name: 'ระยอง', nameKey: 'provinces.rayong', icon: '🏖️', descKey: 'provinces.rayongDesc' },
  { name: 'ปราจีนบุรี', nameKey: 'provinces.prachinburi', icon: '🌿', descKey: 'provinces.prachinburiDesc' },
];

const MAX_VISIBLE_PROVINCES = 4;

interface WhereDropdownProps {
  searchValue: string;
  onSearchChange?: (value: string) => void;
  onSelect: (province: string) => void;
  onCampSelect?: (campId: string, campName: string) => void;
}

const WhereDropdown = forwardRef<HTMLDivElement, WhereDropdownProps>(({ searchValue, onSearchChange, onSelect, onCampSelect }, ref) => {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showAllProvinces, setShowAllProvinces] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when dropdown opens
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const filteredProvinces = provinceData.filter(p =>
    p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    t(p.nameKey).toLowerCase().includes(localSearch.toLowerCase())
  );

  // When searching, show all results; otherwise limit to MAX_VISIBLE_PROVINCES
  const isSearching = localSearch.length > 0;
  const visibleProvinces = isSearching || showAllProvinces
    ? filteredProvinces
    : filteredProvinces.slice(0, MAX_VISIBLE_PROVINCES);
  const hasMoreProvinces = !isSearching && filteredProvinces.length > MAX_VISIBLE_PROVINCES;

  // Search camps by name
  const filteredCamps = localSearch.length >= 2
    ? camps.filter(camp =>
        camp.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        camp.nameEn?.toLowerCase().includes(localSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div
      ref={ref}
      className="bg-card rounded-3xl shadow-elevated border border-border overflow-hidden z-50 min-w-[380px]"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder={t('search.searchProvinceOrCamp')}
            className="w-full pl-12 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto">
        {/* Nearby option */}
        <button
          onClick={() => onSelect('nearby')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary transition-colors text-left mb-2"
        >
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Navigation className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('search.nearby')}</p>
            <p className="text-sm text-muted-foreground">{t('search.nearbyDesc')}</p>
          </div>
        </button>

        {/* Camp results */}
        {filteredCamps.length > 0 && (
          <>
            <div className="border-t border-border my-2" />
            <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('search.matchingCamps')}
            </p>
            {filteredCamps.map((camp) => (
              <button
                key={camp.id}
                onClick={() => onCampSelect?.(camp.id, camp.name)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img
                    src={camp.image}
                    alt={camp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{camp.name}</p>
                  <p className="text-sm text-muted-foreground">{camp.province}</p>
                </div>
              </button>
            ))}
          </>
        )}

        <div className="border-t border-border my-2" />

        {/* Province list */}
        <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('search.popularProvinces')}
        </p>
        {visibleProvinces.length > 0 ? (
          <>
            {visibleProvinces.map((province) => (
              <button
                key={province.name}
                onClick={() => onSelect(province.name)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                  {province.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{t(province.nameKey)}</p>
                  <p className="text-sm text-muted-foreground">{t(province.descKey)}</p>
                </div>
              </button>
            ))}

            {/* Show more / Show less button */}
            {hasMoreProvinces && (
              <button
                onClick={() => setShowAllProvinces(!showAllProvinces)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl hover:bg-secondary transition-colors text-primary font-medium"
              >
                {showAllProvinces ? (
                  <>
                    <ChevronUp className="w-5 h-5" />
                    <span>แสดงน้อยลง</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    <span>ดูจังหวัดเพิ่มเติม ({filteredProvinces.length - MAX_VISIBLE_PROVINCES})</span>
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <p className="px-4 py-8 text-center text-muted-foreground">
            {t('search.noProvinceMatch')}
          </p>
        )}
      </div>
    </div>
  );
});

WhereDropdown.displayName = 'WhereDropdown';

export default WhereDropdown;
