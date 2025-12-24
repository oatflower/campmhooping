import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { provinces } from '@/data/camps';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onProvinceSelect: (province: string | null) => void;
  selectedProvince: string | null;
}

const SearchBar = ({ onSearch, onProvinceSelect, selectedProvince }: SearchBarProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
    setShowDropdown(true);
  };

  const handleProvinceClick = (province: string) => {
    setQuery(province);
    onProvinceSelect(province);
    setShowDropdown(false);
  };

  const filteredProvinces = provinces.filter(p => 
    p.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={t('search.searchProvinceOrCamp')}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="input-search pl-14 pr-12"
        />
        {selectedProvince && (
          <button
            onClick={() => {
              setQuery('');
              onProvinceSelect(null);
            }}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && filteredProvinces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground">{t('search.popularProvinces')}</p>
              {filteredProvinces.map((province) => (
                <button
                  key={province}
                  onClick={() => handleProvinceClick(province)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{province}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
