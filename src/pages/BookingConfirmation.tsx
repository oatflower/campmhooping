import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Calendar, 
  Users, 
  MapPin, 
  Download, 
  Share2, 
  Mail,
  Phone,
  MessageCircle,
  Home,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { th, enUS, zhCN, ja, ko, de, fr } from 'date-fns/locale';
import { toast } from 'sonner';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { booking, paymentMethod, transactionId } = location.state || {};

  const getDateLocale = () => {
    const locales: Record<string, typeof th> = { th, en: enUS, zh: zhCN, ja, ko, de, fr };
    return locales[i18n.language] || enUS;
  };

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(transactionId || '');
    toast.success(t('booking.copied'));
  };

  const handleDownload = () => {
    toast.success(t('booking.downloading'));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('booking.shareTitle'),
        text: t('booking.shareText', { id: transactionId }),
      });
    } else {
      handleCopyBookingId();
    }
  };

  // Validate booking has required data (handles refresh where location.state is lost)
  if (!booking || typeof booking !== 'object' || !booking.campName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.bookingNotFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('common.backToHome')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <main className="container py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('booking.success')}
            </h1>
            <p className="text-muted-foreground">
              {t('booking.thankYou')}
            </p>
          </motion.div>

          {/* Booking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg"
          >
            {/* Booking ID Header */}
            <div className="bg-primary/5 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('booking.bookingNumber')}</p>
                <p className="font-mono font-semibold text-lg">{transactionId}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopyBookingId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Camp Info */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
                  {booking.campImage && (
                    <img src={booking.campImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{booking.campName || 'แคมป์ปิ้ง'}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {booking.location || 'ประเทศไทย'}
                  </p>
                  {booking.accommodation && (
                    <p className="text-sm text-primary mt-2">{booking.accommodation.name}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{t('booking.checkIn')}</span>
                  </div>
                  <p className="font-medium">
                    {booking.dateRange?.from
                      ? format(new Date(booking.dateRange.from), 'd MMMM yyyy', { locale: getDateLocale() })
                      : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('booking.afterTime', { time: '14:00' })}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{t('booking.checkOut')}</span>
                  </div>
                  <p className="font-medium">
                    {booking.dateRange?.to
                      ? format(new Date(booking.dateRange.to), 'd MMMM yyyy', { locale: getDateLocale() })
                      : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('booking.beforeTime', { time: '12:00' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {t('booking.guestsTotal', { count: (booking.guests?.adults || 0) + (booking.guests?.children || 0) })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('booking.guestBreakdown', { adults: booking.guests?.adults || 0, children: booking.guests?.children || 0 })}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('booking.paymentMethod')}</span>
                  <span>
                    {paymentMethod === 'card' && t('payment.creditDebit')}
                    {paymentMethod === 'promptpay' && t('payment.promptpay')}
                    {paymentMethod === 'bank' && t('payment.bankTransfer')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('booking.status')}</span>
                  <span className="text-primary font-medium">{t('booking.paid')}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('booking.totalPaid')}</span>
                  <span className="text-primary">฿{(booking.pricing?.total ?? 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('booking.download')}
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {t('booking.share')}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-semibold mb-4">{t('booking.needHelp')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="mailto:support@campthai.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{t('booking.email')}</p>
                  <p className="text-xs text-muted-foreground">support@campthai.com</p>
                </div>
              </a>
              <a href="tel:0891234567" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{t('booking.phone')}</p>
                  <p className="text-xs text-muted-foreground">089-123-4567</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">LINE</p>
                  <p className="text-xs text-muted-foreground">@campthai</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-8">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <Home className="w-4 h-4" />
                {t('common.backToHome')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;
