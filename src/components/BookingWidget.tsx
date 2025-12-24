import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, Locale } from 'date-fns';
import { th, enUS, zhCN, ja, ko, de, fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronRight, Minus, Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Camp, AccommodationOption } from '@/types/camp';
import { GuestState } from './search/WhoDropdown';

interface BookingWidgetProps {
    camp: Camp;
    accommodations: AccommodationOption[];
    addons?: string[]; // Simplified for now
}

const BookingWidget = ({ camp, accommodations, addons = [] }: BookingWidgetProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const { formatPrice } = useCurrency();

    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [guests, setGuests] = useState<GuestState>({ adults: 2, children: 0, infants: 0, pets: 0 });
    // Create default accommodation from camp if none provided
    const defaultAccommodation: AccommodationOption | null = accommodations[0] || (camp ? {
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

    const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(
        defaultAccommodation
    );
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    // Date-fns locale
    const getDateLocale = () => {
        const locales: Record<string, Locale> = { th, en: enUS, zh: zhCN, ja, ko, de, fr };
        return locales[i18n.language] || enUS;
    };

    const nights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
    const totalGuests = guests.adults + guests.children;
    const isOverCapacity = selectedAccommodation && totalGuests > selectedAccommodation.maxGuests;

    const calculatePrice = () => {
        if (!selectedAccommodation || nights <= 0) return null;

        const basePrice = selectedAccommodation.pricePerNight * nights;
        const extraAdults = Math.max(0, guests.adults - selectedAccommodation.maxGuests);
        const extraChildren = guests.children;
        const extraAdultPrice = extraAdults * selectedAccommodation.extraAdultPrice * nights;
        const extraChildPrice = extraChildren * selectedAccommodation.extraChildPrice * nights;
        // Addon simplified logic for now
        const addonPrice = 0;

        const subtotal = basePrice + extraAdultPrice + extraChildPrice + addonPrice;
        const vat = subtotal * 0.07;
        const total = subtotal + vat;

        return { basePrice, extraAdultPrice, extraChildPrice, addonPrice, subtotal, vat, total, nights };
    };

    const pricing = calculatePrice();

    const handleBooking = () => {
        // Allow guest booking - proceed to payment directly
        navigate('/payment', {
            state: {
                booking: {
                    campId: camp.id,
                    campName: camp.name,
                    campImage: camp.image,
                    location: camp.province,
                    accommodation: selectedAccommodation,
                    dateRange,
                    guests,
                    addons: selectedAddons,
                    pricing,
                }
            }
        });
    };

    // Button text
    const buttonText = i18n.language === 'th' ? 'จองเลย' : 'Book Now';

    return (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg space-y-5">
            {/* Price Header */}
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                    {formatPrice(pricing?.total || selectedAccommodation?.pricePerNight || 0)}
                </span>
                <span className="text-muted-foreground text-sm">
                    {pricing ? t('campList.forNights', { count: pricing.nights }) : `/${t('common.night')}`}
                </span>
            </div>

            {/* Inputs */}
            <div className="border border-border rounded-xl overflow-hidden">
                {/* Dates */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-full grid grid-cols-2 border-b border-border">
                            <div className="p-3 text-left border-r border-border hover:bg-secondary/50 transition-colors">
                                <p className="text-[10px] font-semibold uppercase tracking-wide">{t('campDetail.checkIn')}</p>
                                <p className="text-sm">
                                    {dateRange.from ? format(dateRange.from, "d/M/yyyy") : t('campDetail.selectDates')}
                                </p>
                            </div>
                            <div className="p-3 text-left hover:bg-secondary/50 transition-colors">
                                <p className="text-[10px] font-semibold uppercase tracking-wide">{t('campDetail.checkOut')}</p>
                                <p className="text-sm">
                                    {dateRange.to ? format(dateRange.to, "d/M/yyyy") : t('campDetail.selectDates')}
                                </p>
                            </div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                            numberOfMonths={1}
                            disabled={(date) => date < new Date()}
                            className="pointer-events-auto"
                        />
                    </PopoverContent>
                </Popover>

                {/* Guests */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-full p-3 text-left hover:bg-secondary/50 transition-colors flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide">{t('campDetail.guestCount')}</p>
                                <p className="text-sm">{totalGuests} {t('common.persons')}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                        <div className="space-y-4 p-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t('guests.adults')}</p>
                                    <p className="text-xs text-muted-foreground">{t('guests.adultsDesc')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))}><Minus className="w-4 h-4" /></Button>
                                    <span className="w-6 text-center font-medium">{guests.adults}</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(g => ({ ...g, adults: g.adults + 1 }))}><Plus className="w-4 h-4" /></Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t('guests.children')}</p>
                                    <p className="text-xs text-muted-foreground">{t('guests.childrenDesc')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) }))}><Minus className="w-4 h-4" /></Button>
                                    <span className="w-6 text-center font-medium">{guests.children}</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(g => ({ ...g, children: g.children + 1 }))}><Plus className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {isOverCapacity && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('campDetail.overCapacity')}</span>
                </div>
            )}

            <Button
                variant="booking"
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl"
                disabled={(!dateRange.from || !dateRange.to)}
                onClick={handleBooking}
            >
                {buttonText}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                {t('campDetail.noChargeYet')}
            </p>

            {/* Breakdown */}
            {pricing && (
                <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground underline">{formatPrice(selectedAccommodation?.pricePerNight || 0)} x {pricing.nights} {t('common.night')}</span>
                        <span>{formatPrice(pricing.basePrice)}</span>
                    </div>
                    {pricing.extraAdultPrice > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground underline">{t('campDetail.extraAdultFee')}</span>
                            <span>{formatPrice(pricing.extraAdultPrice)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold pt-3 border-t border-border">
                        <span>{t('campDetail.total')}</span>
                        <span>{formatPrice(pricing.total)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingWidget;
