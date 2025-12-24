import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Mock reservation data
interface Reservation {
  id: string;
  guestName: string;
  guestAvatar: string;
  campName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: 'confirmed' | 'pending' | 'checked_in' | 'checked_out';
  totalPrice: number;
}

const mockReservations: Reservation[] = [
  // Add mock data when there are listings
];

const HostDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasListings, listings } = useHost();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [showPublishedToast, setShowPublishedToast] = useState(false);

  // Check if just published
  useEffect(() => {
    if (searchParams.get('published') === 'true') {
      setShowPublishedToast(true);
      setTimeout(() => setShowPublishedToast(false), 5000);
    }
  }, [searchParams]);

  // If no listings, show welcome/onboarding CTA
  if (!hasListings) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🏕️</div>
          <h1 className="text-2xl font-bold mb-3">{t('hostDashboard.welcomeTitle')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('hostDashboard.welcomeDesc')}
          </p>
          <Button
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => navigate('/host/onboarding')}
          >
            {t('hostDashboard.createFirstListing')}
          </Button>
        </div>
      </div>
    );
  }

  const todayReservations = mockReservations.filter(r => {
    const today = new Date();
    return r.checkIn.toDateString() === today.toDateString() ||
           r.checkOut.toDateString() === today.toDateString();
  });

  const upcomingReservations = mockReservations.filter(r => {
    const today = new Date();
    return r.checkIn > today && r.status === 'confirmed';
  });

  return (
    <main className="container py-8">
      {/* Published Toast */}
      <AnimatePresence>
        {showPublishedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{t('hostDashboard.publishedToast')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t('hostDashboard.welcomeBack')}</h1>
        <p className="text-muted-foreground">{t('hostDashboard.whatsHappening')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label={t('hostDashboard.upcomingReservations')}
          value={upcomingReservations.length.toString()}
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label={t('hostDashboard.unreadMessages')}
          value="0"
        />
        <StatCard
          icon={<Plus className="w-5 h-5" />}
          label={t('hostDashboard.activeListings')}
          value={listings.filter(l => l.status === 'published').length.toString()}
          onClick={() => navigate('/host/listings')}
        />
      </div>

      {/* Reservations */}
      <div className="bg-card rounded-2xl border border-border p-6">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('today')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'today'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('hostDashboard.today')}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('hostDashboard.upcoming')}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'today' ? (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {todayReservations.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title={t('hostDashboard.noReservationsToday')}
                  description={t('hostDashboard.bookingsAppearHere')}
                />
              ) : (
                <div className="space-y-4">
                  {todayReservations.map(reservation => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {upcomingReservations.length === 0 ? (
                <EmptyState
                  icon="🗓️"
                  title={t('hostDashboard.noUpcomingReservations')}
                  description={t('hostDashboard.futureBookingsHere')}
                />
              ) : (
                <div className="space-y-4">
                  {upcomingReservations.map(reservation => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

// Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="bg-card rounded-xl border border-border p-4 text-left hover:bg-secondary/50 transition-colors"
  >
    <div className="flex items-center gap-3 mb-2 text-muted-foreground">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </button>
);

// Empty State Component
const EmptyState = ({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// Reservation Card Component
const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    checked_in: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    checked_out: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  const statusLabels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
        {reservation.guestAvatar || '👤'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{reservation.guestName}</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)} • {reservation.guests} guests
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>
        {statusLabels[reservation.status]}
      </span>
    </div>
  );
};

export default HostDashboard;
