import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Loader2,
  ChevronRight,
  Tent,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getBookings, BookingRecord } from '@/services/bookingCrud';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import MobileBottomNav from '@/components/MobileBottomNav';

type TripStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const Trips = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    const result = await getBookings();
    if (result.success && result.data) {
      setBookings(result.data);
    }
    setIsLoading(false);
  };

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
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />{t('trips.upcoming', 'Upcoming')}</Badge>;
      case 'ongoing':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Tent className="w-3 h-3 mr-1" />{t('trips.ongoing', 'Ongoing')}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><CheckCircle2 className="w-3 h-3 mr-1" />{t('trips.completed', 'Completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />{t('trips.cancelled', 'Cancelled')}</Badge>;
    }
  };

  const upcomingTrips = bookings.filter(b => {
    const status = getTripStatus(b);
    return status === 'upcoming' || status === 'ongoing';
  });

  const pastTrips = bookings.filter(b => {
    const status = getTripStatus(b);
    return status === 'completed' || status === 'cancelled';
  });

  const TripCard = ({ booking }: { booking: BookingRecord }) => {
    const status = getTripStatus(booking);
    const camp = booking.camps;
    const imageUrl = camp?.images?.[0] || '/placeholder.svg';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/trips/${booking.id}`)}
        className="bg-card rounded-xl overflow-hidden shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex">
          {/* Image */}
          <div className="w-28 h-28 flex-shrink-0">
            <img
              src={imageUrl}
              alt={camp?.name || 'Camp'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {camp?.name || t('trips.unknownCamp', 'Unknown Camp')}
                </h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{camp?.location || '-'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(booking.start_date), 'd MMM', { locale })} - {format(parseISO(booking.end_date), 'd MMM yyyy', { locale })}
                </span>
                {booking.guest_count && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(booking.guest_count.adults || 0) + (booking.guest_count.children || 0)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              {getStatusBadge(status)}
              <span className="text-sm font-semibold text-foreground">
                ฿{booking.total_price?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        {type === 'upcoming' ? (
          <Tent className="w-10 h-10 text-muted-foreground" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === 'upcoming'
          ? t('trips.noUpcoming', 'No Upcoming Trips')
          : t('trips.noPast', 'No Past Trips')}
      </h3>
      <p className="text-muted-foreground text-center mb-6">
        {type === 'upcoming'
          ? t('trips.noUpcomingDesc', 'Start planning your next adventure!')
          : t('trips.noPastDesc', 'Your completed trips will appear here')}
      </p>
      {type === 'upcoming' && (
        <Link to="/camps">
          <Button variant="booking">
            {t('trips.exploreCamps', 'Explore Camps')}
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('trips.title', 'My Trips')}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                {t('trips.upcomingTab', 'Upcoming')}
                {upcomingTrips.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{upcomingTrips.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                {t('trips.pastTab', 'Past')}
                {pastTrips.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{pastTrips.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <AnimatePresence mode="popLayout">
                {upcomingTrips.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTrips.map((booking) => (
                      <TripCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="upcoming" />
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="past">
              <AnimatePresence mode="popLayout">
                {pastTrips.length > 0 ? (
                  <div className="space-y-3">
                    {pastTrips.map((booking) => (
                      <TripCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="past" />
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Trips;
