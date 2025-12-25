import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Users,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  MessageCircle
} from 'lucide-react';
import { getBookingById, BookingRecord } from '@/services/bookingCrud';
import { supabase } from '@/lib/supabase';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const ModifyBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Modification state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch booking
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      setIsLoading(true);
      const result = await getBookingById(bookingId);
      if (result.success && result.data) {
        setBooking(result.data);
        // Initialize form with current booking data
        setDateRange({
          from: parseISO(result.data.start_date),
          to: parseISO(result.data.end_date),
        });
        setGuests({
          adults: result.data.guest_count?.adults || 1,
          children: result.data.guest_count?.children || 0,
        });
      } else {
        toast.error(t('trips.bookingNotFound', 'Booking not found'));
        navigate('/trips');
      }
      setIsLoading(false);
    };
    fetchBooking();
  }, [bookingId, navigate, t]);

  // Check for changes
  useEffect(() => {
    if (!booking) return;
    const originalStart = parseISO(booking.start_date).toDateString();
    const originalEnd = parseISO(booking.end_date).toDateString();
    const newStart = dateRange?.from?.toDateString();
    const newEnd = dateRange?.to?.toDateString();

    const datesChanged = originalStart !== newStart || originalEnd !== newEnd;
    const guestsChanged =
      guests.adults !== (booking.guest_count?.adults || 1) ||
      guests.children !== (booking.guest_count?.children || 0);

    setHasChanges(datesChanged || guestsChanged);
  }, [booking, dateRange, guests]);

  const handleGuestChange = (type: 'adults' | 'children', delta: number) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta),
    }));
  };

  const calculateNewPrice = () => {
    if (!booking || !dateRange?.from || !dateRange?.to) return 0;
    const nights = differenceInDays(dateRange.to, dateRange.from);
    const pricePerNight = booking.camps?.price_per_night || 0;
    return nights * pricePerNight;
  };

  const handleSubmitModification = async () => {
    if (!booking || !dateRange?.from || !dateRange?.to) return;

    setIsSaving(true);
    try {
      // Update booking in database
      const { error } = await supabase
        .from('bookings')
        .update({
          start_date: format(dateRange.from, 'yyyy-MM-dd'),
          end_date: format(dateRange.to, 'yyyy-MM-dd'),
          guest_count: guests,
          total_price: calculateNewPrice(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast.success(t('modifyBooking.success', 'Booking updated successfully'));
      navigate(`/trips/${booking.id}`);
    } catch (error) {
      console.error('Modification error:', error);
      toast.error(t('modifyBooking.error', 'Failed to update booking. Please contact the host.'));
    } finally {
      setIsSaving(false);
      setShowConfirmDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('trips.bookingNotFound', 'Booking not found')}</h1>
          <Button onClick={() => navigate('/trips')}>{t('common.backToTrips', 'Back to Trips')}</Button>
        </div>
      </div>
    );
  }

  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const newTotal = calculateNewPrice();
  const priceDifference = newTotal - (booking.total_price || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('modifyBooking.title', 'Modify Booking')}</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-200">
                    {t('modifyBooking.notice', 'Modification Request')}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t('modifyBooking.noticeDesc', 'Changes are subject to availability and host approval. Price differences may apply. For significant changes, we recommend contacting the host directly.')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camp Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{booking.camps?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {booking.camps?.images?.[0] && (
                  <img
                    src={booking.camps.images[0]}
                    alt={booking.camps.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-muted-foreground">{booking.camps?.location}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('modifyBooking.currentBooking', 'Current booking')}:
                    {' '}{format(parseISO(booking.start_date), 'MMM d', { locale })} - {format(parseISO(booking.end_date), 'MMM d, yyyy', { locale })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {t('modifyBooking.selectDates', 'Select New Dates')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
                locale={locale}
                className="rounded-md border"
              />
              {dateRange?.from && dateRange?.to && (
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('modifyBooking.selectedDates', 'Selected dates')}</span>
                    <span className="font-medium">
                      {format(dateRange.from, 'MMM d', { locale })} - {format(dateRange.to, 'MMM d, yyyy', { locale })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">{t('common.nights', 'Nights')}</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest Count */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('modifyBooking.guests', 'Guests')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('common.adults', 'Adults')}</p>
                  <p className="text-sm text-muted-foreground">{t('modifyBooking.age13Plus', 'Age 13+')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange('adults', -1)}
                    disabled={guests.adults <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{guests.adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange('adults', 1)}
                    disabled={guests.adults >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('common.children', 'Children')}</p>
                  <p className="text-sm text-muted-foreground">{t('modifyBooking.age2to12', 'Age 2-12')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange('children', -1)}
                    disabled={guests.children <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{guests.children}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange('children', 1)}
                    disabled={guests.children >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('modifyBooking.priceSummary', 'Price Summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('modifyBooking.originalPrice', 'Original price')}</span>
                <span>฿{(booking.total_price || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('modifyBooking.newPrice', 'New price')} ({nights} {t('common.nights', 'nights')})</span>
                <span>฿{newTotal.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t('modifyBooking.difference', 'Difference')}</span>
                <span className={priceDifference > 0 ? 'text-red-600' : priceDifference < 0 ? 'text-green-600' : ''}>
                  {priceDifference > 0 ? '+' : ''}฿{priceDifference.toLocaleString()}
                </span>
              </div>
              {priceDifference > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('modifyBooking.additionalPayment', 'Additional payment will be required for the price difference.')}
                </p>
              )}
              {priceDifference < 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('modifyBooking.refundNote', 'Note: Refunds are not available. Please contact host for credit options.')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact Host */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('modifyBooking.needHelp', 'Need help with your changes?')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('modifyBooking.contactHost', 'Contact the host directly for special requests')}
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/messages')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('trips.messageHost', 'Message Host')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              className="flex-1"
              disabled={!hasChanges || isSaving}
              onClick={() => setShowConfirmDialog(true)}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('common.saving', 'Saving...')}</>
              ) : (
                t('modifyBooking.requestChanges', 'Request Changes')
              )}
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              {t('modifyBooking.confirmTitle', 'Confirm Changes')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{t('modifyBooking.confirmDesc', 'You are about to modify your booking:')}</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  {t('modifyBooking.newDates', 'New dates')}: {dateRange?.from && format(dateRange.from, 'MMM d', { locale })} - {dateRange?.to && format(dateRange.to, 'MMM d, yyyy', { locale })}
                </li>
                <li>
                  {t('modifyBooking.guestsCount', 'Guests')}: {guests.adults} {t('common.adults', 'adults')}, {guests.children} {t('common.children', 'children')}
                </li>
                {priceDifference !== 0 && (
                  <li>
                    {t('modifyBooking.priceDiff', 'Price difference')}: {priceDifference > 0 ? '+' : ''}฿{priceDifference.toLocaleString()}
                  </li>
                )}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitModification} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('modifyBooking.confirm', 'Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModifyBooking;
