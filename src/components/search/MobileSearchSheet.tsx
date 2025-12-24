import { useState, useEffect } from 'react';
import { Search, X, Tent, Sparkles, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, Locale } from 'date-fns';
import { th, enUS, zhCN, ko, ja, de, fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WhenDropdown from './WhenDropdown';
import WhoDropdown, { GuestState } from './WhoDropdown';
import { camps } from '@/data/camps';

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

// Province data with colors and descriptions (Airbnb style)
const destinations = [
  { id: 'nearby', nameKey: 'destinations.nearby', descKey: 'destinations.nearbyDesc', color: 'bg-gradient-to-br from-cyan-400 to-cyan-500', icon: MapPin },
  { id: 'flexible', nameKey: 'destinations.flexible', descKey: 'destinations.flexibleDesc', color: 'bg-gradient-to-br from-purple-400 to-purple-500', icon: Sparkles },
  { id: 'กาญจนบุรี', nameKey: 'destinations.kanchanaburi', descKey: 'destinations.kanchanaburiDesc', color: 'bg-gradient-to-br from-amber-400 to-orange-500', icon: MapPin },
  { id: 'เชียงใหม่', nameKey: 'destinations.chiangmai', descKey: 'destinations.chiangmaiDesc', color: 'bg-gradient-to-br from-emerald-400 to-emerald-500', icon: MapPin },
  { id: 'เชียงราย', nameKey: 'destinations.chiangrai', descKey: 'destinations.chiangraiDesc', color: 'bg-gradient-to-br from-violet-400 to-violet-500', icon: MapPin },
  { id: 'นครราชสีมา', nameKey: 'destinations.korat', descKey: 'destinations.koratDesc', color: 'bg-gradient-to-br from-rose-400 to-rose-500', icon: MapPin },
];

interface MobileSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const MobileSearchSheet = ({
  open,
  onOpenChange,
  onSearch,
  onLocationSelect,
  initialLocation,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: MobileSearchSheetProps) => {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState<ActiveSection>('where');
  const [location, setLocation] = useState<string>(initialLocation || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialLocation || null);
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
  const [guests, setGuests] = useState<GuestState>(initialGuests || {
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const currentLocale = localeMap[i18n.language.split('-')[0]] || th;

  // Sync with initial props
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

  // Reset to first section when opening
  useEffect(() => {
    if (open) {
      setActiveSection('where');
      setSearchQuery('');
    }
  }, [open]);

  // Filter camps based on search
  const filteredCamps = searchQuery.length >= 2
    ? camps.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

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

  const handleCampSelect = (campName: string) => {
    setSelectedLocation(campName);
    setLocation(campName);
    setActiveSection('when');
  };

  const handleDateChange = (newCheckIn: Date | undefined, newCheckOut: Date | undefined) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    if (newCheckIn && newCheckOut) {
      setActiveSection('who');
    }
  };

  const handleSearch = () => {
    onSearch({
      location: selectedLocation,
      checkIn,
      checkOut,
      guests,
    });
    onOpenChange(false);
  };

  const handleClearAll = () => {
    setLocation('');
    setSearchQuery('');
    setSelectedLocation(null);
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests({ adults: 1, children: 0, infants: 0, pets: 0 });
    setActiveSection('where');
  };

  const getTotalGuests = () => {
    const total = guests.adults + guests.children;
    if (total === 0) return t('search.addGuests');
    return `${total} ${t('common.persons')}`;
  };

  const getDateDisplay = () => {
    if (!checkIn && !checkOut) return t('search.addDates');
    if (checkIn && !checkOut) return format(checkIn, 'd MMM', { locale: currentLocale });
    if (checkIn && checkOut) {
      return `${format(checkIn, 'd MMM', { locale: currentLocale })} - ${format(checkOut, 'd MMM', { locale: currentLocale })}`;
    }
    return t('search.addDates');
  };

  const toggleSection = (section: ActiveSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl p-0 flex flex-col bg-background" hideCloseButton>
        {/* Header with Escape tab */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-foreground text-background">
            <Tent className="w-4 h-4" />
            <span>{t('nav.escape')}</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accordion Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {/* Where Section */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('where')}
              className="w-full px-5 py-4 flex items-center justify-between"
            >
              <span className={cn(
                "text-sm",
                activeSection === 'where' ? 'text-muted-foreground' : 'font-medium text-foreground'
              )}>
                {t('search.where')}
              </span>
              <span className={cn(
                "text-sm",
                activeSection === 'where' ? 'text-muted-foreground' : 'font-medium text-foreground'
              )}>
                {location || t('search.anywhere')}
              </span>
            </button>
            
            <AnimatePresence>
              {activeSection === 'where' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder={t('search.searchDestination')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-border bg-muted/50"
                      />
                    </div>

                    {/* Search Results */}
                    {filteredCamps.length > 0 && (
                      <div className="space-y-1">
                        {filteredCamps.map((camp) => (
                          <button
                            key={camp.id}
                            onClick={() => handleCampSelect(camp.name)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">{camp.name}</p>
                              <p className="text-xs text-muted-foreground">{camp.province}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Destinations List (Airbnb style) */}
                    {filteredCamps.length === 0 && (
                      <div className="space-y-1">
                        {destinations.map((dest) => {
                          const Icon = dest.icon;
                          return (
                            <button
                              key={dest.id}
                              onClick={() => handleLocationSelect(dest.id)}
                              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-muted transition-colors"
                            >
                              <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center',
                                dest.color
                              )}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left flex-1">
                                <p className="font-medium text-foreground">{t(dest.nameKey)}</p>
                                <p className="text-sm text-muted-foreground">{t(dest.descKey)}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* When Section */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('when')}
              className="w-full px-5 py-4 flex items-center justify-between"
            >
              <span className={cn(
                "text-sm",
                activeSection === 'when' ? 'text-muted-foreground' : 'font-medium text-foreground'
              )}>
                {t('search.when')}
              </span>
              <span className={cn(
                "text-sm",
                activeSection === 'when' ? 'text-muted-foreground' : 'font-medium text-foreground'
              )}>
                {getDateDisplay()}
              </span>
            </button>
            
            <AnimatePresence>
              {activeSection === 'when' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-2 pb-4 flex justify-center overflow-x-auto [&>div]:relative [&>div]:shadow-none [&>div]:border-0">
                    <WhenDropdown
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onDateChange={handleDateChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Who Section */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('who')}
              className="w-full px-5 py-4 flex items-center justify-between"
            >
              <span className={cn(
                "text-sm",
                activeSection === 'who' ? 'text-muted-foreground' : 'font-medium text-foreground'
              )}>
                {t('search.who')}
              </span>
              <span className={cn(
                "text-sm",
                activeSection === 'who' ? 'text-muted-foreground' : 'font-medium text-foreground'
              )}>
                {getTotalGuests()}
              </span>
            </button>
            
            <AnimatePresence>
              {activeSection === 'who' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 [&>div]:relative [&>div]:shadow-none [&>div]:border-0 [&>div]:w-full">
                    <WhoDropdown
                      guests={guests}
                      onGuestsChange={setGuests}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex-shrink-0 flex items-center justify-between gap-4">
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-foreground underline underline-offset-2"
          >
            {t('common.clearAll')}
          </button>
          <Button
            onClick={handleSearch}
            className="h-12 px-6 text-base font-medium gap-2 rounded-xl bg-gradient-to-r from-accent to-rose-500 hover:from-accent/90 hover:to-rose-500/90"
          >
            <Search className="w-5 h-5" />
            {t('search.search')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSearchSheet;
