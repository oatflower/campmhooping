import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, Locale } from 'date-fns';
import { th, enUS, zhCN, ko, ja, de, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import WhereDropdown from './search/WhereDropdown';
import WhenDropdown from './search/WhenDropdown';
import WhoDropdown, { GuestState } from './search/WhoDropdown';
import MobileSearchDrawer from './search/MobileSearchDrawer';

type ActiveSection = 'where' | 'when' | 'who' | null;

const localeMap: Record<string, Locale> = {
  th,
  en: enUS,
  zh: zhCN,
  ko,
  ja,
  de,
  fr,
};

interface AirbnbSearchBarProps {
  onSearch: (params: {
    location: string | null;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: GuestState;
  }) => void;
  onLocationSelect?: (location: string | null) => void;
}

const AirbnbSearchBar = ({ onSearch, onLocationSelect }: AirbnbSearchBarProps) => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [location, setLocation] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState<GuestState>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const currentLocale = localeMap[i18n.language.split('-')[0]] || th;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (province: string) => {
    if (province === 'nearby') {
      setSelectedLocation(null);
      setLocation(t('search.nearby'));
    } else {
      setSelectedLocation(province);
      setLocation(province);
    }
    onLocationSelect?.(province === 'nearby' ? null : province);
    setActiveSection('when');
  };

  const handleDateChange = (newCheckIn: Date | undefined, newCheckOut: Date | undefined) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleSearch = () => {
    onSearch({
      location: selectedLocation,
      checkIn,
      checkOut,
      guests,
    });
    setActiveSection(null);
  };

  const getTotalGuests = () => {
    const total = guests.adults + guests.children;
    if (total === 0) return t('search.addGuests');
    let text = `${total} ${t('common.persons')}`;
    if (guests.infants > 0) text += `, ${t('common.infants')} ${guests.infants}`;
    if (guests.pets > 0) text += `, ${t('common.pets')} ${guests.pets}`;
    return text;
  };

  const getDateDisplay = () => {
    if (!checkIn && !checkOut) return t('search.selectDate');
    if (checkIn && !checkOut) return format(checkIn, 'd MMM', { locale: currentLocale });
    if (checkIn && checkOut) {
      return `${format(checkIn, 'd MMM', { locale: currentLocale })} - ${format(checkOut, 'd MMM', { locale: currentLocale })}`;
    }
    return t('search.selectDate');
  };

  // Mobile: Compact search bar that opens drawer
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="w-full flex items-center gap-3 bg-card rounded-full border border-border shadow-md p-3 hover:shadow-lg transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-foreground text-sm truncate">
              {location || t('search.searchCamps')}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {checkIn ? getDateDisplay() : `${t('search.where')} • ${t('search.when')} • ${t('search.who')}`}
            </p>
          </div>
        </button>

        <MobileSearchDrawer
          open={mobileDrawerOpen}
          onOpenChange={setMobileDrawerOpen}
          onSearch={onSearch}
          onLocationSelect={onLocationSelect}
        />
      </>
    );
  }

  // Desktop: Full search bar
  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-50">
      {/* Main Search Bar */}
      <div
        className={cn(
          'flex items-center bg-card rounded-full border shadow-md transition-all duration-300',
          activeSection ? 'shadow-elevated border-border' : 'border-border/50 hover:shadow-lg'
        )}
      >
        {/* Where Section */}
        <button
          onClick={() => setActiveSection(activeSection === 'where' ? null : 'where')}
          className={cn(
            'flex-[1.2] flex items-center gap-3 px-5 py-4 rounded-full transition-all text-left',
            activeSection === 'where' ? 'bg-secondary' : 'hover:bg-secondary/50'
          )}
        >
          <MapPin className={cn("w-5 h-5 shrink-0", location ? "text-accent" : "text-muted-foreground")} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{t('search.where')}</p>
            <p className={cn(
              'text-sm truncate',
              location ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {location || t('search.searchProvince')}
            </p>
          </div>
        </button>

        <div className="w-px h-8 bg-border/60" />

        {/* When Section */}
        <button
          onClick={() => setActiveSection(activeSection === 'when' ? null : 'when')}
          className={cn(
            'flex-[1.5] flex items-center gap-3 px-5 py-4 rounded-full transition-all text-left',
            activeSection === 'when' ? 'bg-secondary' : 'hover:bg-secondary/50'
          )}
        >
          <Calendar className={cn("w-5 h-5 shrink-0", checkIn ? "text-accent" : "text-muted-foreground")} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{t('search.when')}</p>
            <p className={cn(
              'text-sm truncate',
              checkIn ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {getDateDisplay()}
            </p>
          </div>
        </button>

        <div className="w-px h-8 bg-border/60" />

        {/* Who Section */}
        <button
          onClick={() => setActiveSection(activeSection === 'who' ? null : 'who')}
          className={cn(
            'flex-1 flex items-center gap-3 px-5 py-4 rounded-full transition-all text-left',
            activeSection === 'who' ? 'bg-secondary' : 'hover:bg-secondary/50'
          )}
        >
          <Users className={cn("w-5 h-5 shrink-0", (guests.adults > 1 || guests.children > 0) ? "text-accent" : "text-muted-foreground")} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{t('search.who')}</p>
            <p className={cn(
              'text-sm truncate',
              guests.adults > 1 || guests.children > 0 ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {getTotalGuests()}
            </p>
          </div>
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="m-2 p-3 bg-accent hover:bg-accent/90 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          <Search className="w-5 h-5 text-accent-foreground" />
        </button>
      </div>

      {/* Dropdowns */}
      <AnimatePresence>
        {activeSection === 'where' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-3 z-50"
          >
            <WhereDropdown
              searchValue={location}
              onSearchChange={setLocation}
              onSelect={handleLocationSelect}
            />
          </motion.div>
        )}
        {activeSection === 'when' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 z-50 flex justify-center"
          >
            <WhenDropdown
              checkIn={checkIn}
              checkOut={checkOut}
              onDateChange={handleDateChange}
            />
          </motion.div>
        )}
        {activeSection === 'who' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 z-50"
          >
            <WhoDropdown
              guests={guests}
              onGuestsChange={setGuests}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AirbnbSearchBar;
