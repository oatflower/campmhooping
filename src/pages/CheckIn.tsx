import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  MapPin,
  Users,
  Camera,
  CheckCircle,
  Loader2,
  Share2,
  Tent,
  Calendar,
  X
} from 'lucide-react';
import { getBookingById, BookingRecord, updateBookingStatus } from '@/services/bookingCrud';
import { supabase } from '@/lib/supabase';
import { format, parseISO, isToday, isBefore, isAfter } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

const CheckIn = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const fetchBooking = async () => {
    if (!bookingId) return;
    setIsLoading(true);
    const result = await getBookingById(bookingId);
    if (result.success && result.data) {
      setBooking(result.data);
      // Check if already checked in
      if (result.data.checked_in_at) {
        setIsCheckedIn(true);
      }
    } else {
      toast.error(t('checkIn.bookingNotFound', 'Booking not found'));
      navigate('/trips');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      toast.error(t('checkIn.maxPhotos', 'Maximum 3 photos'));
      return;
    }

    setPhotos(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload photos to Supabase Storage
  const uploadPhotos = async (bookingId: string): Promise<string[]> => {
    if (photos.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${bookingId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('check-in-photos')
        .upload(fileName, photo, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Photo upload error:', error);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('check-in-photos')
        .getPublicUrl(data.path);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleCheckIn = async () => {
    if (!booking || !bookingId) return;

    setIsSubmitting(true);

    try {
      // 1. Upload photos if any
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos(bookingId);
      }

      // 2. Update booking with check-in timestamp
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          checked_in_at: new Date().toISOString(),
          check_in_photos: photoUrls.length > 0 ? photoUrls : null,
          check_in_message: statusMessage || null,
        })
        .eq('id', bookingId);

      if (bookingError) {
        throw bookingError;
      }

      // 3. Create community post if message or photos provided
      if (statusMessage || photoUrls.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('community_posts').insert({
            user_id: userData.user.id,
            camp_id: booking.camp_id,
            booking_id: bookingId,
            message: statusMessage || `Just checked in at ${booking.camps?.name}! 🏕️`,
            photos: photoUrls,
            post_type: 'check_in',
          }).catch(() => {
            // Community posts table might not exist, ignore error
            console.log('Community posts feature not available');
          });
        }
      }

      setIsCheckedIn(true);
      toast.success(t('checkIn.success', 'Checked in successfully!'));
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(t('checkIn.error', 'Failed to check in. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!booking) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Camping at ${booking.camps?.name}`,
          text: statusMessage || `I'm camping at ${booking.camps?.name}! 🏕️`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
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
    return null;
  }

  const camp = booking.camps;
  const imageUrl = camp?.images?.[0] || '/placeholder.svg';

  // Check if can check in (must be on or after start date, before end date)
  const today = new Date();
  const startDate = parseISO(booking.start_date);
  const endDate = parseISO(booking.end_date);
  const canCheckIn = (isToday(startDate) || isBefore(startDate, today)) &&
                      (isToday(endDate) || isAfter(endDate, today)) &&
                      booking.status !== 'cancelled';

  if (isCheckedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold mb-2">{t('checkIn.checkedIn', "You're checked in!")}</h2>
          <p className="text-muted-foreground mb-6">
            {t('checkIn.enjoyStay', 'Enjoy your stay at')} {camp?.name}
          </p>

          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img src={imageUrl} alt={camp?.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{camp?.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {camp?.location}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(startDate, 'd MMM', { locale })} - {format(endDate, 'd MMM', { locale })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleShare} variant="outline" className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              {t('checkIn.shareOnSocial', 'Share on social media')}
            </Button>

            <Link to={`/camp-today/${camp?.id}`} className="block">
              <Button variant="booking" className="w-full gap-2">
                <Users className="w-4 h-4" />
                {t('checkIn.seeWhosHere', "See who's camping here")}
              </Button>
            </Link>

            <Link to="/trips" className="block">
              <Button variant="ghost" className="w-full">
                {t('checkIn.backToTrips', 'Back to My Trips')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('checkIn.title', 'Check In')}</h1>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6 max-w-lg mx-auto"
      >
        {/* Camp Info */}
        <div className="flex gap-4 mb-6 p-4 bg-card rounded-xl border border-border">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img src={imageUrl} alt={camp?.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-semibold">{camp?.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {camp?.location}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(startDate, 'd MMM', { locale })} - {format(endDate, 'd MMM', { locale })}
            </p>
          </div>
        </div>

        {!canCheckIn ? (
          <div className="text-center py-8">
            <Tent className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{t('checkIn.notYet', 'Not time to check in yet')}</h3>
            <p className="text-muted-foreground">
              {t('checkIn.comeBackOn', 'Come back on')} {format(startDate, 'd MMMM yyyy', { locale })}
            </p>
          </div>
        ) : (
          <>
            {/* Status Message */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">
                {t('checkIn.statusMessage', 'Status message')} <span className="text-muted-foreground">({t('checkIn.optional', 'optional')})</span>
              </label>
              <Textarea
                placeholder={t('checkIn.statusPlaceholder', "What are you up to? Share with other campers!")}
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">
                {t('checkIn.addPhoto', 'Add a photo')} <span className="text-muted-foreground">({t('checkIn.optional', 'optional')})</span>
              </label>

              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}

                {photos.length < 3 && (
                  <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{t('checkIn.add', 'Add')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Privacy Note */}
            <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{t('checkIn.note', 'Note')}:</strong> {t('checkIn.privacyNote', 'Your check-in will be visible to other campers at this location today.')}
              </p>
            </div>

            {/* Check In Button */}
            <Button
              onClick={handleCheckIn}
              variant="booking"
              size="lg"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('checkIn.checkingIn', 'Checking in...')}
                </>
              ) : (
                <>
                  <Tent className="w-5 h-5" />
                  {t('checkIn.checkInNow', 'Check In Now')}
                </>
              )}
            </Button>
          </>
        )}
      </motion.main>
    </div>
  );
};

export default CheckIn;
