
import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { th, enUS, zhCN, ja, ko, de, fr } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Clock, Star, Minus, Plus, Share, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FacilityIcon from '@/components/FacilityIcon';
import ScrollProgress from '@/components/ScrollProgress';
import ImageLightbox from '@/components/ImageLightbox';
import ReviewSection from '@/components/ReviewSection';
import WeatherDetailCard from '@/components/WeatherDetailCard';
import { accommodationOptions, addons } from '@/data/camps';
import { useCamps } from '@/hooks/useCamps';
import type { AccommodationOption } from '@/types/camp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookingWidget from '@/components/BookingWidget';

const CampDetail = () => {
  const { campId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const { addCamp } = useRecentlyViewed();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [campId, pathname]);

  useEffect(() => {
    if (campId) {
      addCamp(campId);
    }
  }, [campId, addCamp]);

  // Get locale for date-fns
  const getDateLocale = () => {
    const locales: Record<string, Locale> = { th, en: enUS, zh: zhCN, ja, ko, de, fr };
    return locales[i18n.language] || enUS;
  };

  // Mappings for i18n keys
  const provinceKeyMap: Record<string, string> = {
    'นครราชสีมา': 'provinces.nakhonRatchasima',
    'กาญจนบุรี': 'provinces.kanchanaburi',
    'สระบุรี': 'provinces.saraburi',
    'ระยอง': 'provinces.rayong',
    'เชียงใหม่': 'provinces.chiangMai',
    'เพชรบูรณ์': 'provinces.phetchabun',
    'ปราจีนบุรี': 'provinces.prachinburi',
  };

  const locationKeyMap: Record<string, string> = {
    'อ.ปากช่อง': 'locations.pakChong',
    'อ.เมือง': 'locations.mueang',
    'อ.มวกเหล็ก': 'locations.muakLek',
    'อ.แกลง': 'locations.klaeng',
    'อ.จอมทอง': 'locations.chomThong',
    'อ.หล่มเก่า': 'locations.lomKao',
    'อ.วังน้ำเขียว': 'locations.wangNamKhiao',
    'อ.ไทรโยค': 'locations.saiYok',
    'อ.แก่งคอย': 'locations.kaengKhoi',
    'อ.เขาค้อ': 'locations.khaoKho',
    'อ.ศรีสวัสดิ์': 'locations.siSawat',
  };

  // Get localized content
  const lang = i18n.language;
  const isThai = lang === 'th';
  const { camps, loading } = useCamps();

  const getLocalizedName = (camp: typeof camps[0]) => isThai ? camp.name : camp.nameEn;

  const getLocalizedProvince = (province: string) => {
    const key = provinceKeyMap[province];
    return key ? t(key) : province;
  };

  const getLocalizedLocation = (location: string) => {
    const key = locationKeyMap[location];
    return key ? t(key) : location;
  };

  const getLocalizedDescription = (camp: typeof camps[0]) => isThai ? camp.description : (camp.descriptionEn || camp.description);

  const getLocalizedDistance = (distance: string) => {
    const unit = t('distance.unit');
    return distance.replace('ชม.', unit);
  };



  // Find camp
  const camp = camps.find(c => c.id === campId);
  const campAccommodations = accommodationOptions[campId || ''] || [];

  // Create default accommodation from camp if none defined
  const defaultAccommodation: AccommodationOption | null = campAccommodations[0] || (camp ? {
    id: 'default',
    type: camp.accommodationType,
    name: camp.accommodationType === 'tent' ? 'Standard Tent' : 'Standard Room',
    pricePerNight: camp.pricePerNight,
    maxGuests: camp.maxGuests,
    extraAdultPrice: 300,
    extraChildPrice: 150,
    description: '',
    amenities: [],
    available: true,
  } : null);

  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(
    defaultAccommodation
  );
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Computed values
  const nights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const totalGuests = guests.adults + guests.children;
  const isOverCapacity = selectedAccommodation && totalGuests > selectedAccommodation.maxGuests;

  // Calculate price
  const calculatePrice = () => {
    if (!selectedAccommodation || nights <= 0) return null;

    const basePrice = selectedAccommodation.pricePerNight * nights;

    // Extra guests beyond max
    const extraAdults = Math.max(0, guests.adults - selectedAccommodation.maxGuests);
    const extraChildren = guests.children;
    const extraAdultPrice = extraAdults * selectedAccommodation.extraAdultPrice * nights;
    const extraChildPrice = extraChildren * selectedAccommodation.extraChildPrice * nights;

    // Addons
    const addonPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);

    const subtotal = basePrice + extraAdultPrice + extraChildPrice + addonPrice;
    const vat = subtotal * 0.07;
    const total = subtotal + vat;

    return {
      basePrice,
      extraAdultPrice,
      extraChildPrice,
      addonPrice,
      subtotal,
      vat,
      total,
      nights,
    };
  };

  const pricing = calculatePrice();

  // Handlers
  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBooking = () => {
    // Navigate to payment with booking summary
    navigate('/payment', {
      state: {
        booking: {
          campId,
          campName: camp?.name,
          campImage: camp?.image,
          location: camp?.province,
          accommodation: selectedAccommodation,
          dateRange,
          guests,
          addons: selectedAddons,
          pricing,
        }
      }
    });
  };

  // Show loading state while fetching camps
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show "not found" after loading completes
  if (!camp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.campNotFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('common.backToHome')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <ScrollProgress />
      <Header />

      {/* Image Lightbox */}
      <ImageLightbox
        images={camp.images}
        initialIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <main className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div
              className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={camp.images[currentImageIndex]}
                alt={camp.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Navigation */}
              {camp.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => prev === 0 ? camp.images.length - 1 : prev - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => prev === camp.images.length - 1 ? 0 : prev + 1);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {camp.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === currentImageIndex ? "bg-background w-4" : "bg-background/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Camp Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={camp.accommodationType === 'tent' ? 'tent' : 'dome'}>
                  {camp.accommodationType === 'tent' ? `⛺ ${t('campDetail.tent')}` : `🏠 ${t('campDetail.dome')}`}
                </Badge>
                {camp.isPopular && <Badge variant="popular">🔥 {t('campDetail.popular')}</Badge>}
                {camp.isBeginner && <Badge variant="beginner">👋 {t('campDetail.beginner')}</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{getLocalizedName(camp)}</h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{getLocalizedLocation(camp.location)}, {getLocalizedProvince(camp.province)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getLocalizedDistance(camp.distanceFromBangkok)} {t('common.fromBangkok')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-sunrise text-sunrise" />
                  <span className="font-medium text-foreground">{camp.rating}</span>
                  <span>({camp.reviewCount} {t('common.reviews')})</span>
                </div>
              </div>

              <p className="text-foreground leading-relaxed">{getLocalizedDescription(camp)}</p>
            </div>

            {/* Weather */}
            <WeatherDetailCard
              lat={camp.coordinates.lat}
              lng={camp.coordinates.lng}
              province={getLocalizedProvince(camp.province)}
            />

            {/* Facilities */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('campDetail.facilities')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {camp.facilities.map((facility, idx) => (
                  <FacilityIcon key={idx} facility={facility} />
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('campDetail.location')}</h2>
              <div className="aspect-video rounded-2xl bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">{t('campDetail.googleMaps')}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection
              campId={camp.id}
              campRating={camp.rating}
              reviewCount={camp.reviewCount}
            />
          </div>

          {/* Booking Sidebar - Desktop (Airbnb Style) */}
          <div className="hidden lg:block sticky top-28 h-fit">
            <BookingWidget
              camp={camp}
              accommodations={campAccommodations}
              addons={addons}
            />
          </div>
        </div>
      </main>

      {/* Mobile Booking Bar */}
      <div className="booking-bar lg:hidden safe-area-bottom">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                {formatPrice(pricing?.total || selectedAccommodation?.pricePerNight || 0)}
              </span>
              {!pricing && <span className="text-sm text-muted-foreground">/{t('common.night')}</span>}
            </div>
            {dateRange.from && dateRange.to && (
              <p className="text-xs text-muted-foreground">
                {format(dateRange.from, "d MMM", { locale: getDateLocale() })} - {format(dateRange.to, "d MMM", { locale: getDateLocale() })}
              </p>
            )}
          </div>
          <Button
            variant="booking"
            onClick={() => setShowBookingSummary(true)}
          >
            {dateRange.from && dateRange.to ? t('campDetail.bookNow') : t('campDetail.selectDatesFirst')}
          </Button>
        </div>
      </div>

      {/* Mobile Booking Modal */}
      <Dialog open={showBookingSummary} onOpenChange={setShowBookingSummary}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('campDetail.bookingSummary')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Accommodation */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('campDetail.accommodationType')}</label>
              <div className="space-y-2">
                {campAccommodations.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccommodation(acc)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all",
                      selectedAccommodation?.id === acc.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{acc.name}</span>
                      <span className="text-sm text-muted-foreground">{formatPrice(acc.pricePerNight)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('campDetail.stayDates')}</label>
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={1}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('campDetail.guestCount')}</label>
              <div className="space-y-3 p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('guests.adults')}</p>
                    <p className="text-xs text-muted-foreground">{t('guests.adultsDesc')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{guests.adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGuests(g => ({ ...g, adults: g.adults + 1 }))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('guests.children')}</p>
                    <p className="text-xs text-muted-foreground">{t('guests.childrenDesc')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) }))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{guests.children}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGuests(g => ({ ...g, children: g.children + 1 }))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {pricing && (
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('campDetail.accommodation')} x {pricing.nights} {t('common.nights')}</span>
                  <span>{formatPrice(pricing.basePrice)}</span>
                </div>
                {pricing.extraAdultPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('campDetail.extraAdultFee')}</span>
                    <span>{formatPrice(pricing.extraAdultPrice)}</span>
                  </div>
                )}
                {pricing.extraChildPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('campDetail.extraChildFee')}</span>
                    <span>{formatPrice(pricing.extraChildPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('campDetail.vat')}</span>
                  <span>{formatPrice(pricing.vat)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>{t('campDetail.total')}</span>
                  <span className="text-primary">{formatPrice(pricing.total)}</span>
                </div>
              </div>
            )}

            <Button
              variant="booking"
              size="lg"
              className="w-full"
              disabled={!dateRange.from || !dateRange.to}
              onClick={handleBooking}
            >
              {t('campDetail.proceedBooking')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CampDetail;
