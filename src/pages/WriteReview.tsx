import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Star,
  Loader2,
  CheckCircle,
  Camera,
  X,
  AlertTriangle
} from 'lucide-react';
import { getBookingById, BookingRecord } from '@/services/bookingCrud';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

interface ReviewRating {
  overall: number;
  cleanliness: number;
  location: number;
  facilities: number;
  value: number;
  communication: number;
}

const WriteReview = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [ratings, setRatings] = useState<ReviewRating>({
    overall: 0,
    cleanliness: 0,
    location: 0,
    facilities: 0,
    value: 0,
    communication: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const fetchBooking = async () => {
    if (!bookingId) return;
    setIsLoading(true);
    const result = await getBookingById(bookingId);
    if (result.success && result.data) {
      setBooking(result.data);
    } else {
      toast.error(t('reviews.bookingNotFound', 'Booking not found'));
      navigate('/trips');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleRating = (category: keyof ReviewRating, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error(t('reviews.maxPhotos', 'Maximum 5 photos allowed'));
      return;
    }

    setPhotos(prev => [...prev, ...files]);

    // Create previews
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

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      toast.error(t('reviews.rateRequired', 'Please provide an overall rating'));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here you would call your review API
    // await submitReview({ bookingId, ratings, reviewText, photos });

    setIsSuccess(true);
    toast.success(t('reviews.submitSuccess', 'Review submitted successfully'));

    // Redirect after delay
    setTimeout(() => {
      navigate('/trips');
    }, 2000);

    setIsSubmitting(false);
  };

  const StarRating = ({ category, label }: { category: keyof ReviewRating; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRating(category, star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= ratings[category]
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

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
        <h2 className="text-xl font-semibold mb-2">{t('reviews.bookingNotFound', 'Booking not found')}</h2>
        <Link to="/trips">
          <Button variant="outline">{t('reviews.backToTrips', 'Back to My Trips')}</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </motion.div>
        <h2 className="text-xl font-semibold mb-2">{t('reviews.thankYou', 'Thank you for your review!')}</h2>
        <p className="text-muted-foreground text-center mb-4">
          {t('reviews.reviewHelps', 'Your feedback helps other campers find great places')}
        </p>
        <Link to="/trips">
          <Button variant="outline">{t('reviews.backToTrips', 'Back to My Trips')}</Button>
        </Link>
      </div>
    );
  }

  const camp = booking.camps;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('reviews.writeReview', 'Write a Review')}</h1>
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
            <img
              src={camp?.images?.[0] || '/placeholder.svg'}
              alt={camp?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold">{camp?.name}</h2>
            <p className="text-sm text-muted-foreground">{camp?.location}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(parseISO(booking.start_date), 'd MMM', { locale })} - {format(parseISO(booking.end_date), 'd MMM yyyy', { locale })}
            </p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="mb-6">
          <Label className="text-base font-semibold">{t('reviews.overallRating', 'Overall Rating')}</Label>
          <p className="text-sm text-muted-foreground mb-3">
            {t('reviews.howWasStay', 'How was your stay at this camp?')}
          </p>
          <div className="flex justify-center gap-2 py-4 bg-secondary/30 rounded-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating('overall', star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= ratings.overall
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {ratings.overall > 0 && (
            <p className="text-center mt-2 text-sm text-muted-foreground">
              {ratings.overall === 5 && t('reviews.excellent', 'Excellent!')}
              {ratings.overall === 4 && t('reviews.great', 'Great!')}
              {ratings.overall === 3 && t('reviews.good', 'Good')}
              {ratings.overall === 2 && t('reviews.fair', 'Fair')}
              {ratings.overall === 1 && t('reviews.poor', 'Poor')}
            </p>
          )}
        </div>

        {/* Category Ratings */}
        <div className="mb-6 bg-card rounded-xl border border-border p-4">
          <Label className="text-base font-semibold mb-2 block">{t('reviews.rateCategories', 'Rate each category')}</Label>
          <div className="divide-y divide-border">
            <StarRating category="cleanliness" label={t('reviews.cleanliness', 'Cleanliness')} />
            <StarRating category="location" label={t('reviews.location', 'Location')} />
            <StarRating category="facilities" label={t('reviews.facilities', 'Facilities')} />
            <StarRating category="value" label={t('reviews.value', 'Value for money')} />
            <StarRating category="communication" label={t('reviews.communication', 'Host communication')} />
          </div>
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <Label htmlFor="review" className="text-base font-semibold">{t('reviews.yourReview', 'Your Review')}</Label>
          <p className="text-sm text-muted-foreground mb-3">
            {t('reviews.shareExperience', 'Share your experience with other campers')}
          </p>
          <Textarea
            id="review"
            placeholder={t('reviews.placeholder', 'What did you like about this place? Any tips for future guests?')}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {reviewText.length}/500
          </p>
        </div>

        {/* Photo Upload */}
        <div className="mb-8">
          <Label className="text-base font-semibold">{t('reviews.addPhotos', 'Add Photos')} <span className="text-muted-foreground font-normal">({t('reviews.optional', 'Optional')})</span></Label>
          <p className="text-sm text-muted-foreground mb-3">
            {t('reviews.photosHelp', 'Photos help others see what to expect')}
          </p>

          <div className="flex flex-wrap gap-3">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}

            {photos.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">{t('reviews.addPhoto', 'Add')}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          variant="booking"
          size="lg"
          className="w-full"
          disabled={isSubmitting || ratings.overall === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {t('reviews.submitting', 'Submitting...')}
            </>
          ) : (
            t('reviews.submitReview', 'Submit Review')
          )}
        </Button>
      </motion.main>
    </div>
  );
};

export default WriteReview;
