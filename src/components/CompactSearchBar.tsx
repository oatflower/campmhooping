import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, Locale } from 'date-fns';
import { th, enUS, zhCN, ko, ja, de, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import WhereDropdown from './search/WhereDropdown';
import WhenDropdown from './search/WhenDropdown';
import WhoDropdown, { GuestState } from './search/WhoDropdown';
import MobileSearchSheet from './search/MobileSearchSheet';

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

interface CompactSearchBarProps {
  onSearch: (params: {
    location: string | null;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: GuestState;
  }) => void;
  onLocationSelect?: (location: string | null) => void;
  initialLocation?: string;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
  initialGuests?: GuestState;
}

const CompactSearchBar = ({ 
  onSearch, 
  onLocationSelect,
  initialLocation,
  initialCheckIn,
  initialCheckOut,
  initialGuests
}: CompactSearchBarProps) => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [location, setLocation] = useState<string>(initialLocation || '');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialLocation || null);
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
  const [guests, setGuests] = useState<GuestState>(initialGuests || {
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const currentLocale = localeMap[i18n.language.split('-')[0]] || th;

  // Update state when initial props change
  useEffect(() => {
    if (initialLocation !== undefined) {
      setLocation(initialLocation);
      setSelectedLocation(initialLocation || null);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (initialCheckIn !== undefined) setCheckIn(initialCheckIn);
  }, [initialCheckIn]);

  useEffect(() => {
    if (initialCheckOut !== undefined) setCheckOut(initialCheckOut);
  }, [initialCheckOut]);

  useEffect(() => {
    if (initialGuests !== undefined) setGuests(initialGuests);
  }, [initialGuests]);

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

  const handleSearch = useCallback(() => {
    onSearch({
      location: selectedLocation,
      checkIn,
      checkOut,
      guests,
    });
    setActiveSection(null);
  }, [onSearch, selectedLocation, checkIn, checkOut, guests]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!activeSection) return;

    const sections: ActiveSection[] = ['where', 'when', 'who'];
    const currentIndex = sections.indexOf(activeSection);

    switch (event.key) {
      case 'Escape':
        setActiveSection(null);
        break;
      case 'ArrowRight':
      case 'Tab':
        if (!event.shiftKey && currentIndex < sections.length - 1) {
          event.preventDefault();
          setActiveSection(sections[currentIndex + 1]);
        }
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          event.preventDefault();
          setActiveSection(sections[currentIndex - 1]);
        }
        break;
      case 'Enter':
        if (activeSection === 'who') {
          handleSearch();
        } else {
          const nextIndex = currentIndex + 1;
          if (nextIndex < sections.length) {
            setActiveSection(sections[nextIndex]);
          }
        }
        break;
    }
  }, [activeSection, handleSearch]);

  useEffect(() => {
    if (activeSection) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeSection, handleKeyDown]);

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
    if (newCheckIn && newCheckOut) {
      setActiveSection('who');
    }
  };

  const getTotalGuests = () => {
    const total = guests.adults + guests.children;
    if (total === 0) return t('search.addGuests');
    return `${total} ${t('common.persons')}`;
  };

  const getDateDisplay = () => {
    if (!checkIn && !checkOut) return t('search.anytime');
    if (checkIn && !checkOut) return format(checkIn, 'd MMM', { locale: currentLocale });
    if (checkIn && checkOut) {
      return `${format(checkIn, 'd MMM', { locale: currentLocale })} - ${format(checkOut, 'd MMM', { locale: currentLocale })}`;
    }
    return t('search.anytime');
  };

  const handleSectionClick = (section: ActiveSection) => {
    if (isMobile) {
      setMobileSheetOpen(true);
    } else {
      setActiveSection(activeSection === section ? null : section);
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Compact Search Bar */}
        <div className="flex items-center bg-card rounded-full border border-border shadow-md hover:shadow-lg transition-all">
        {/* Where Section */}
          <button
            onClick={() => handleSectionClick('where')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-l-full transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary/50',
              activeSection === 'where' ? 'bg-secondary' : 'hover:bg-secondary/50'
            )}
          >
          <span className="text-lg">🏕️</span>
          <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
            {location || t('search.anywhere')}
          </span>
        </button>

          <span className="w-px h-5 bg-border" />

          {/* When Section */}
          <button
            onClick={() => handleSectionClick('when')}
            className={cn(
              'flex items-center px-3 py-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary/50',
              activeSection === 'when' ? 'bg-secondary' : 'hover:bg-secondary/50'
            )}
          >
          <span className={cn(
            'text-sm truncate max-w-[120px]',
            checkIn ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {getDateDisplay()}
          </span>
        </button>

          <span className="w-px h-5 bg-border" />

          {/* Who Section */}
          <button
            onClick={() => handleSectionClick('who')}
            className={cn(
              'flex items-center px-3 py-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary/50',
              activeSection === 'who' ? 'bg-secondary' : 'hover:bg-secondary/50'
            )}
          >
          <span className={cn(
            'text-sm truncate max-w-[80px]',
            guests.adults > 1 || guests.children > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {getTotalGuests()}
          </span>
        </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="m-1 p-2 bg-accent hover:bg-accent/90 rounded-full transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <Search className="w-4 h-4 text-accent-foreground" />
          </button>
        </div>

        {/* Desktop Dropdowns - Fixed position centered */}
        {!isMobile && (
          <AnimatePresence mode="wait">
        {activeSection === 'where' && (
          <motion.div
            key="where"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-24 inset-x-0 z-50 flex justify-center"
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
            key="when"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-24 inset-x-0 z-50 flex justify-center"
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
            key="who"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-24 inset-x-0 z-50 flex justify-center"
          >
            <WhoDropdown
              guests={guests}
              onGuestsChange={setGuests}
            />
          </motion.div>
          )}
        </AnimatePresence>
      )}
      </div>

      {/* Mobile Search Sheet */}
      <MobileSearchSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        onSearch={onSearch}
        onLocationSelect={onLocationSelect}
        initialLocation={initialLocation}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialGuests={initialGuests}
      />
    </>
  );
};

export default CompactSearchBar;
