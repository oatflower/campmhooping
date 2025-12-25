import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Calendar,
  Search,
  MessageCircle,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Loader2,
  MoreHorizontal,
  Tent,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { getHostBookings, updateHostBookingStatus, HostBookingRecord } from '@/services/bookingCrud';

// Transformed booking interface for UI
interface HostBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestAvatar?: string;
  campId: string;
  campName: string;
  campImage: string;
  startDate: string;
  endDate: string;
  guestCount: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  specialRequests?: string;
}

// Transform API data to UI format
const transformBooking = (record: HostBookingRecord): HostBooking => ({
  id: record.id,
  guestName: record.guest?.name || 'Guest',
  guestEmail: record.guest?.email || '',
  guestAvatar: record.guest?.avatar_url,
  campId: record.camp_id,
  campName: record.camps?.name || 'Camp',
  campImage: record.camps?.images?.[0] || '/placeholder.svg',
  startDate: record.start_date,
  endDate: record.end_date,
  guestCount: {
    adults: record.guest_count?.adults || 1,
    children: record.guest_count?.children || 0,
  },
  totalPrice: record.total_price,
  status: record.status as HostBooking['status'],
  paymentStatus: record.payment_method === 'pay_at_camp' ? 'pending' : 'paid',
  createdAt: record.created_at,
});

const HostBookings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'confirm' | 'cancel'; booking: HostBooking | null }>({
    open: false,
    type: 'confirm',
    booking: null,
  });

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getHostBookings();
      if (result.success && result.data) {
        setBookings(result.data.map(transformBooking));
      } else {
        console.error('Failed to fetch bookings:', result.error);
        // Show empty state instead of error for new hosts
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmBooking = async (booking: HostBooking) => {
    setIsUpdating(true);
    try {
      const result = await updateHostBookingStatus(booking.id, 'confirmed');
      if (result.success) {
        setBookings(prev =>
          prev.map(b => b.id === booking.id ? { ...b, status: 'confirmed' as const } : b)
        );
        toast.success(t('hostBookings.confirmSuccess', 'Booking confirmed successfully'));
      } else {
        toast.error(result.error || 'Failed to confirm booking');
      }
    } catch (error) {
      toast.error('Failed to confirm booking');
    } finally {
      setActionDialog({ open: false, type: 'confirm', booking: null });
      setIsUpdating(false);
    }
  };

  const handleCancelBooking = async (booking: HostBooking) => {
    setIsUpdating(true);
    try {
      const result = await updateHostBookingStatus(booking.id, 'cancelled');
      if (result.success) {
        setBookings(prev =>
          prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const } : b)
        );
        toast.success(t('hostBookings.cancelSuccess', 'Booking declined'));
      } else {
        toast.error(result.error || 'Failed to decline booking');
      }
    } catch (error) {
      toast.error('Failed to decline booking');
    } finally {
      setActionDialog({ open: false, type: 'cancel', booking: null });
      setIsUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.campName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'pending') return matchesSearch && booking.status === 'pending';
    if (activeTab === 'confirmed') return matchesSearch && booking.status === 'confirmed';
    return matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  const getStatusBadge = (status: HostBooking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />{t('hostBookings.pending', 'Pending')}</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />{t('hostBookings.confirmed', 'Confirmed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />{t('hostBookings.cancelled', 'Cancelled')}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><CheckCircle className="w-3 h-3 mr-1" />{t('hostBookings.completed', 'Completed')}</Badge>;
    }
  };

  const BookingCard = ({ booking }: { booking: HostBooking }) => {
    const nights = differenceInDays(parseISO(booking.endDate), parseISO(booking.startDate));
    const totalGuests = booking.guestCount.adults + booking.guestCount.children;
    const isPending = booking.status === 'pending';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {booking.guestName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{booking.guestName}</p>
                <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/host/messages')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('hostBookings.sendMessage', 'Send Message')}
                </DropdownMenuItem>
                {booking.guestPhone && (
                  <DropdownMenuItem>
                    <Phone className="w-4 h-4 mr-2" />
                    {t('hostBookings.callGuest', 'Call Guest')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Camp Info */}
          <div className="flex gap-3 mb-3 p-3 bg-secondary/30 rounded-lg">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img src={booking.campImage} alt={booking.campName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{booking.campName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>{format(parseISO(booking.startDate), 'd MMM', { locale })} - {format(parseISO(booking.endDate), 'd MMM', { locale })}</span>
                <span>({nights} {t('common.nights', 'nights')})</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Users className="w-3 h-3" />
                <span>{totalGuests} {t('common.guests', 'guests')}</span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <span className="font-medium">{t('hostBookings.specialRequests', 'Special Requests')}:</span> {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              {getStatusBadge(booking.status)}
              <span className="text-lg font-bold">฿{booking.totalPrice.toLocaleString()}</span>
            </div>

            {isPending && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActionDialog({ open: true, type: 'cancel', booking })}
                >
                  {t('hostBookings.decline', 'Decline')}
                </Button>
                <Button
                  size="sm"
                  variant="booking"
                  onClick={() => setActionDialog({ open: true, type: 'confirm', booking })}
                >
                  {t('hostBookings.accept', 'Accept')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('hostBookings.title', 'Bookings')}</h1>
            <p className="text-muted-foreground">{t('hostBookings.subtitle', 'Manage your guest reservations')}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('hostBookings.searchPlaceholder', 'Search by guest name, camp, or booking ID...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              {t('hostBookings.pendingTab', 'Pending')}
              {pendingCount > 0 && <Badge variant="destructive" className="ml-1">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="gap-2">
              {t('hostBookings.confirmedTab', 'Confirmed')}
              {confirmedCount > 0 && <Badge variant="secondary" className="ml-1">{confirmedCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="all">{t('hostBookings.allTab', 'All')}</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {t('hostBookings.loading', 'Loading bookings...')}
                    </p>
                  </CardContent>
                </Card>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Tent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      {activeTab === 'pending'
                        ? t('hostBookings.noPending', 'No pending bookings')
                        : activeTab === 'confirmed'
                        ? t('hostBookings.noConfirmed', 'No confirmed bookings')
                        : t('hostBookings.noBookings', 'No bookings found')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('hostBookings.bookingsWillAppear', 'New bookings will appear here')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Confirm Dialog */}
        <AlertDialog
          open={actionDialog.open && actionDialog.type === 'confirm'}
          onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {t('hostBookings.confirmBookingTitle', 'Confirm this booking?')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('hostBookings.confirmBookingDesc', 'The guest will be notified that their booking is confirmed.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => actionDialog.booking && handleConfirmBooking(actionDialog.booking)}
                className="bg-green-600 hover:bg-green-700"
                disabled={isUpdating}
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t('hostBookings.confirmBooking', 'Confirm Booking')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Dialog */}
        <AlertDialog
          open={actionDialog.open && actionDialog.type === 'cancel'}
          onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                {t('hostBookings.declineBookingTitle', 'Decline this booking?')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('hostBookings.declineBookingDesc', 'The guest will be notified that their booking request was declined. This action cannot be undone.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => actionDialog.booking && handleCancelBooking(actionDialog.booking)}
                className="bg-red-600 hover:bg-red-700"
                disabled={isUpdating}
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t('hostBookings.declineBooking', 'Decline Booking')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </main>
  );
};

export default HostBookings;
