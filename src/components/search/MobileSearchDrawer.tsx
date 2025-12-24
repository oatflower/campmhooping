import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, Users, X, Navigation, ChevronLeft } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import GuestCounter from './GuestCounter';
import { provinceData } from './WhereDropdown';
import { camps } from '@/data/camps';
import { GuestState } from './WhoDropdown';

const MAX_STAY_NIGHTS = 14;

type Step = 'main' | 'where' | 'when' | 'who';

interface MobileSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (params: {
    location: string | null;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: GuestState;
  }) => void;
  onLocationSelect?: (location: string | null) => void;
}

const MobileSearchDrawer = ({
  open,
  onOpenChange,
  onSearch,
  onLocationSelect,
}: MobileSearchDrawerProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('main');
  const [location, setLocation] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState<GuestState>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const handleLocationSelect = (province: string) => {
    if (province === 'nearby') {
      setSelectedLocation(null);
      setLocation('ใกล้ฉัน');
    } else {
      setSelectedLocation(province);
      setLocation(province);
    }
    onLocationSelect?.(province === 'nearby' ? null : province);
    setStep('when');
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) {
      setCheckIn(undefined);
      setCheckOut(undefined);
      return;
    }

    // If selecting checkout date, validate max stay
    if (range.from && range.to) {
      const nights = differenceInDays(range.to, range.from);
      if (nights > MAX_STAY_NIGHTS) {
        // Limit to max nights
        setCheckIn(range.from);
        setCheckOut(addDays(range.from, MAX_STAY_NIGHTS));
        return;
      }
    }

    setCheckIn(range.from);
    setCheckOut(range.to);
  };

  // Calculate disabled dates for checkout (beyond max stay)
  const getDisabledDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn) {
      const maxCheckout = addDays(checkIn, MAX_STAY_NIGHTS);
      return [
        { before: today },
        { after: maxCheckout }
      ];
    }
    
    return { before: today };
  };

  const getNightsCount = () => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn);
    }
    return 0;
  };

  const handleSearch = () => {
    onSearch({
      location: selectedLocation,
      checkIn,
      checkOut,
      guests,
    });
    onOpenChange(false);
    setStep('main');
  };

  const handleBack = () => {
    if (step === 'where') setStep('main');
    else if (step === 'when') setStep('where');
    else if (step === 'who') setStep('when');
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('main');
  };

  const getTotalGuests = () => {
    const total = guests.adults + guests.children;
    if (total === 0) return 'เพิ่มผู้เข้าพัก';
    let text = `${total} คน`;
    if (guests.infants > 0) text += `, ทารก ${guests.infants}`;
    if (guests.pets > 0) text += `, สัตว์เลี้ยง ${guests.pets}`;
    return text;
  };

  const filteredProvinces = provinceData.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCamps = searchQuery.length >= 2 
    ? camps.filter(camp => 
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        {/* Header */}
        <DrawerHeader className="border-b border-border flex items-center gap-4 px-4 py-3">
          {step !== 'main' ? (
            <button onClick={handleBack} className="p-2 -ml-2 hover:bg-secondary rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : null}
          <DrawerTitle className="flex-1">
            {step === 'main' && 'ค้นหาแคมป์'}
            {step === 'where' && 'ที่ไหน'}
            {step === 'when' && 'เมื่อไหร่'}
            {step === 'who' && 'ใครบ้าง'}
          </DrawerTitle>
          <button onClick={handleClose} className="p-2 -mr-2 hover:bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </DrawerHeader>

        {/* Main selection view */}
        {step === 'main' && (
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {/* Where */}
            <button
              onClick={() => setStep('where')}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">ที่ไหน</p>
                <p className={cn(
                  'font-medium truncate',
                  location ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {location || 'ค้นหาจังหวัด หรือชื่อแคมป์'}
                </p>
              </div>
            </button>

            {/* When */}
            <button
              onClick={() => setStep('when')}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">เมื่อไหร่</p>
                <p className={cn(
                  'font-medium truncate',
                  checkIn ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {checkIn && checkOut 
                    ? `${format(checkIn, 'd MMM', { locale: th })} - ${format(checkOut, 'd MMM', { locale: th })}`
                    : checkIn 
                      ? format(checkIn, 'd MMM yyyy', { locale: th })
                      : 'เลือกวันที่'}
                </p>
              </div>
            </button>

            {/* Who */}
            <button
              onClick={() => setStep('who')}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">ใครบ้าง</p>
                <p className="font-medium text-foreground truncate">
                  {getTotalGuests()}
                </p>
              </div>
            </button>

            {/* Search button */}
            <div className="pt-4">
              <Button
                onClick={handleSearch}
                className="w-full h-14 text-lg gap-2"
                size="lg"
              >
                <Search className="w-5 h-5" />
                ค้นหา
              </Button>
            </div>
          </div>
        )}

        {/* Where step */}
        {step === 'where' && (
          <div className="flex-1 overflow-auto">
            {/* Search input */}
            <div className="p-4 border-b border-border sticky top-0 bg-background">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาจังหวัด หรือชื่อแคมป์..."
                  className="w-full pl-12 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {/* Nearby */}
              <button
                onClick={() => handleLocationSelect('nearby')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">ใกล้ฉัน</p>
                  <p className="text-sm text-muted-foreground">ค้นหาแคมป์ใกล้ตำแหน่งปัจจุบัน</p>
                </div>
              </button>

              {/* Camp results */}
              {filteredCamps.length > 0 && (
                <>
                  <p className="px-4 pt-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    แคมป์ที่ตรงกัน
                  </p>
                  {filteredCamps.map((camp) => (
                    <button
                      key={camp.id}
                      onClick={() => handleLocationSelect(camp.province)}
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

              {/* Provinces */}
              <p className="px-4 pt-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('search.popularProvinces')}
              </p>
              {filteredProvinces.map((province) => (
                <button
                  key={province.name}
                  onClick={() => handleLocationSelect(province.name)}
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
            </div>
          </div>
        )}

        {/* When step */}
        {step === 'when' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <CalendarComponent
                mode="range"
                selected={{ from: checkIn, to: checkOut }}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                disabled={getDisabledDates()}
                locale={th}
                className="pointer-events-auto"
              />
            </div>
            
            {/* Summary & Next */}
            <div className="pt-4 border-t border-border mt-4 space-y-3">
              {(checkIn || checkOut) ? (
                <>
                  <p className="text-center text-foreground font-medium">
                    {checkIn && format(checkIn, 'd MMM yyyy', { locale: th })}
                    {checkIn && checkOut && ' - '}
                    {checkOut && format(checkOut, 'd MMM yyyy', { locale: th })}
                  </p>
                  {getNightsCount() > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      {getNightsCount()} คืน
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setCheckIn(undefined);
                      setCheckOut(undefined);
                    }}
                    className="w-full text-sm text-primary hover:underline font-medium"
                  >
                    ล้างวันที่
                  </button>
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  เลือกวันเข้าพัก - ออก (สูงสุด {MAX_STAY_NIGHTS} คืน)
                </p>
              )}
              <Button
                onClick={() => setStep('who')}
                className="w-full h-12"
                size="lg"
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}

        {/* Who step */}
        {step === 'who' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col">
            <div className="flex-1 space-y-2">
              <GuestCounter
                label="ผู้ใหญ่"
                description="อายุ 13 ปีขึ้นไป"
                value={guests.adults}
                min={1}
                max={16}
                onChange={(value) => setGuests({ ...guests, adults: value })}
              />
              <GuestCounter
                label="เด็ก"
                description="อายุ 2-12 ปี"
                value={guests.children}
                min={0}
                max={16}
                onChange={(value) => setGuests({ ...guests, children: value })}
              />
              <GuestCounter
                label="ทารก"
                description="อายุต่ำกว่า 2 ปี"
                value={guests.infants}
                min={0}
                max={5}
                onChange={(value) => setGuests({ ...guests, infants: value })}
              />
              <GuestCounter
                label="สัตว์เลี้ยง"
                description="พาน้องหมา-แมวมาด้วย"
                value={guests.pets}
                min={0}
                max={5}
                onChange={(value) => setGuests({ ...guests, pets: value })}
              />
            </div>
            
            {/* Search button */}
            <div className="pt-4 border-t border-border mt-4">
              <Button
                onClick={handleSearch}
                className="w-full h-14 text-lg gap-2"
                size="lg"
              >
                <Search className="w-5 h-5" />
                ค้นหา
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSearchDrawer;
