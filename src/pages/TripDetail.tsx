import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Phone,
  MessageCircle,
  Navigation,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Tent,
  CreditCard,
  Receipt,
  AlertTriangle,
  Star,
  Share2,
  Download,
  Edit
} from 'lucide-react';
import { getBookingById, BookingRecord } from '@/services/bookingCrud';
import { cancelBooking } from '@/services/bookingCrud';
import { format, parseISO, isAfter, isBefore, isToday, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

type TripStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const TripDetail = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBooking = async () => {
    if (!bookingId) return;
    setIsLoading(true);
    const result = await getBookingById(bookingId);
    if (result.success && result.data) {
      setBooking(result.data);
    } else {
      toast.error(t('trips.bookingNotFound', 'Booking not found'));
      navigate('/trips');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const getTripStatus = (booking: BookingRecord): TripStatus => {
    if (booking.status === 'cancelled') return 'cancelled';

    const today = new Date();
    const startDate = parseISO(booking.start_date);
    const endDate = parseISO(booking.end_date);

    if (isBefore(endDate, today)) return 'completed';
    if (isAfter(startDate, today)) return 'upcoming';
    if ((isToday(startDate) || isBefore(startDate, today)) &&
        (isToday(endDate) || isAfter(endDate, today))) return 'ongoing';

    return 'upcoming';
  };

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />{t('trips.upcoming', 'Upcoming')}</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><Tent className="w-3 h-3 mr-1" />{t('trips.ongoing', 'Ongoing')}</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200"><CheckCircle className="w-3 h-3 mr-1" />{t('trips.completed', 'Completed')}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />{t('trips.cancelled', 'Cancelled')}</Badge>;
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;

    setIsCancelling(true);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success(t('trips.cancelSuccess', 'Booking cancelled successfully'));
        fetchBooking(); // Refresh data
      } else {
        toast.error(result.error || t('trips.cancelFailed', 'Failed to cancel booking'));
      }
    } catch {
      toast.error(t('trips.cancelFailed', 'Failed to cancel booking'));
    } finally {
      setIsCancelling(false);
    }
  };

  const copyBookingId = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      toast.success(t('common.copied', 'Copied to clipboard'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (booking && navigator.share) {
      try {
        await navigator.share({
          title: `Trip to ${booking.camps?.name}`,
          text: `Check out my upcoming trip to ${booking.camps?.name}!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('trips.bookingNotFound', 'Booking not found')}</h2>
        <Link to="/trips">
          <Button variant="outline">{t('trips.backToTrips', 'Back to My Trips')}</Button>
        </Link>
      </div>
    );
  }

  const status = getTripStatus(booking);
  const camp = booking.camps;
  const imageUrl = camp?.images?.[0] || '/placeholder.svg';
  const nights = differenceInDays(parseISO(booking.end_date), parseISO(booking.start_date));
  const canCancel = status === 'upcoming' && booking.status !== 'cancelled';
  const canModify = status === 'upcoming' && booking.status !== 'cancelled';
  const canReview = status === 'completed';

  // Calculate days until trip
  const daysUntil = differenceInDays(parseISO(booking.start_date), new Date());

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header Image */}
      <div className="relative h-56">
        <img
          src={imageUrl}
          alt={camp?.name || 'Camp'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
        >
          <Share2 className="w-5 h-5" />
        </Button>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 -mt-4 relative"
      >
        <div className="bg-card rounded-xl shadow-lg border border-border p-4">
          {/* Camp Name & Location */}
          <Link to={`/camps/${camp?.id}`}>
            <h1 className="text-xl font-bold text-foreground mb-1 hover:text-primary transition-colors">
              {camp?.name || t('trips.unknownCamp', 'Unknown Camp')}
            </h1>
          </Link>
          <div className="flex items-center gap-1 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{camp?.location || '-'}</span>
          </div>

          {/* Days Until Trip */}
          {status === 'upcoming' && daysUntil > 0 && (
            <div className="bg-primary/10 rounded-lg p-3 mb-4 text-center">
              <p className="text-sm text-muted-foreground">{t('trips.startsIn', 'Your trip starts in')}</p>
              <p className="text-2xl font-bold text-primary">
                {daysUntil} {daysUntil === 1 ? t('common.day', 'day') : t('common.days', 'days')}
              </p>
            </div>
          )}

          {/* Ongoing Banner */}
          {status === 'ongoing' && (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mb-4 text-center">
              <p className="text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                <Tent className="w-5 h-5" />
                {t('trips.enjoyYourTrip', 'Enjoy your camping trip!')}
              </p>
            </div>
          )}

          <Separator className="my-4" />

          {/* Trip Details */}
          <div className="space-y-4">
            {/* Dates */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('trips.dates', 'Dates')}</p>
                <p className="text-muted-foreground">
                  {format(parseISO(booking.start_date), 'EEEE, d MMMM yyyy', { locale })}
                </p>
                <p className="text-muted-foreground">
                  {t('common.to', 'to')} {format(parseISO(booking.end_date), 'EEEE, d MMMM yyyy', { locale })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ({nights} {nights === 1 ? t('common.night', 'night') : t('common.nights', 'nights')})
                </p>
              </div>
            </div>

            {/* Guests */}
            {booking.guest_count && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('trips.guests', 'Guests')}</p>
                  <p className="text-muted-foreground">
                    {booking.guest_count.adults || 0} {t('common.adults', 'Adults')}
                    {booking.guest_count.children > 0 && `, ${booking.guest_count.children} ${t('common.children', 'Children')}`}
                  </p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('trips.payment', 'Payment')}</p>
                <p className="text-muted-foreground capitalize">
                  {booking.payment_method?.replace('_', ' ') || t('trips.notSpecified', 'Not specified')}
                </p>
              </div>
            </div>

            {/* Booking ID */}
            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{t('trips.bookingId', 'Booking ID')}</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {booking.id.slice(0, 8)}...
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyBookingId}>
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Price Summary */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{t('trips.total', 'Total')}</span>
            <span className="text-2xl font-bold text-primary">฿{booking.total_price?.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          {/* Contact Host */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t('trips.callHost', 'Call Host')}
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/messages')}>
              <MessageCircle className="w-4 h-4" />
              {t('trips.messageHost', 'Message')}
            </Button>
          </div>

          {/* Get Directions */}
          {status !== 'cancelled' && (
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              {t('trips.getDirections', 'Get Directions')}
            </Button>
          )}

          {/* Download Receipt */}
          {booking.receipt_url && (
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t('trips.downloadReceipt', 'Download Receipt')}
            </Button>
          )}

          {/* Write Review */}
          {canReview && (
            <Link to={`/review/${booking.id}`} className="block">
              <Button variant="booking" className="w-full flex items-center gap-2">
                <Star className="w-4 h-4" />
                {t('trips.writeReview', 'Write a Review')}
              </Button>
            </Link>
          )}

          {/* Book Again - for completed or cancelled bookings */}
          {(status === 'completed' || status === 'cancelled') && booking.camp_id && (
            <Link to={`/camps/${booking.camp_id}`} className="block">
              <Button variant="outline" className="w-full flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
                <Tent className="w-4 h-4" />
                {t('trips.bookAgain', 'Book Again')}
              </Button>
            </Link>
          )}

          {/* Share Trip */}
          {status !== 'cancelled' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 flex items-center gap-2"
                onClick={() => {
                  const url = window.location.href;
                  const text = t('trips.shareText', 'Check out my camping trip at {{campName}}!', { campName: booking.camps?.name || 'Camp' });
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex items-center gap-2"
                onClick={() => {
                  const url = window.location.href;
                  const text = t('trips.shareText', 'Check out my camping trip at {{campName}}!', { campName: booking.camps?.name || 'Camp' });
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(t('trips.linkCopied', 'Link copied to clipboard'));
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Modify Booking */}
          {canModify && (
            <Link to={`/trips/${booking.id}/modify`} className="block">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Edit className="w-4 h-4" />
                {t('trips.modifyBooking', 'Modify Booking')}
              </Button>
            </Link>
          )}

          {/* Cancel Booking */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  {t('trips.cancelBooking', 'Cancel Booking')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {t('trips.cancelConfirmTitle', 'Cancel this booking?')}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <span className="block font-medium text-red-600">
                      {t('trips.nonRefundableWarning', 'This booking is non-refundable.')}
                    </span>
                    <span className="block">
                      {t('trips.cancelConfirmDesc', 'This action cannot be undone. No refund will be issued. Please contact the host if you need to discuss special circumstances.')}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelBooking}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {t('trips.confirmCancel', 'Yes, Cancel Booking')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Cancellation Policy */}
        {canCancel && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('trips.cancellationPolicy', 'Cancellation Policy')}
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t('trips.cancellationPolicyDesc', 'This booking is non-refundable. Cancellation will not result in a refund. Please contact the host directly if you need to discuss special circumstances.')}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TripDetail;
