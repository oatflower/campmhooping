import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useReviews, Review } from '@/contexts/ReviewsContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface ReviewSectionProps {
  campId: string;
  campRating: number;
  reviewCount: number;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  interactive = false,
  size = 'default'
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'default';
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={cn(
            "transition-transform",
            interactive && "hover:scale-110 cursor-pointer"
          )}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => onRatingChange?.(star)}
        >
          <Star
            className={cn(
              "transition-colors",
              size === 'sm' ? 'w-4 h-4' : 'w-6 h-6',
              (hoverRating || rating) >= star
                ? 'fill-sunrise text-sunrise'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onHelpful }: { review: Review; onHelpful: () => void }) => {
  const { t, i18n } = useTranslation();
  const [hasVoted, setHasVoted] = useState(false);
  const dateLocale = i18n.language === 'th' ? th : enUS;

  const handleHelpful = () => {
    if (hasVoted) return;
    onHelpful();
    setHasVoted(true);
    toast.success(t('reviews.thanksFeedback'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-forest" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="font-medium text-foreground">{review.userName}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: dateLocale })}
              </p>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="text-foreground mt-2 text-sm leading-relaxed">
            {review.comment}
          </p>
          <button
            onClick={handleHelpful}
            disabled={hasVoted}
            className={cn(
              "flex items-center gap-1.5 mt-3 text-sm transition-colors",
              hasVoted
                ? "text-primary cursor-default"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4", hasVoted && "fill-primary")} />
            <span>{t('reviews.helpful')} ({review.helpful})</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ReviewSection = ({ campId, campRating, reviewCount }: ReviewSectionProps) => {
  const { t } = useTranslation();
  const { getReviewsByCamp, addReview, markHelpful, fetchReviewsByCamp, hasReviewed } = useReviews();
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    rating: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Fetch reviews from Supabase on mount
  useEffect(() => {
    fetchReviewsByCamp(campId);
    // Check if user has already reviewed
    hasReviewed(campId).then(setAlreadyReviewed);
  }, [campId, fetchReviewsByCamp, hasReviewed]);

  const reviews = getReviewsByCamp(campId);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName.trim()) {
      toast.error(t('reviews.enterName'));
      return;
    }
    if (formData.rating === 0) {
      toast.error(t('reviews.giveRating'));
      return;
    }
    if (!formData.comment.trim()) {
      toast.error(t('reviews.writeReview'));
      return;
    }
    if (formData.comment.length < 10) {
      toast.error(t('reviews.minChars'));
      return;
    }

    setIsSubmitting(true);

    // Submit to Supabase
    const result = await addReview({
      campId,
      userId: '',  // Will use MOCK_USER_ID in service
      userName: formData.userName.trim(),
      rating: formData.rating,
      comment: formData.comment.trim(),
    });

    if (result.success) {
      setFormData({ userName: '', rating: 0, comment: '' });
      setShowForm(false);
      setAlreadyReviewed(true);
      toast.success(t('reviews.thanksReview'));
    } else {
      // Show user-friendly error
      toast.error(result.error || t('reviews.submitError', 'Failed to submit review'));
    }

    setIsSubmitting(false);
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t('reviews.title')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          disabled={alreadyReviewed && !showForm}
          title={alreadyReviewed ? t('reviews.alreadyReviewed', 'You have already reviewed this camp') : undefined}
        >
          {alreadyReviewed && !showForm
            ? t('reviews.alreadyReviewed', 'Already reviewed')
            : showForm
            ? t('reviews.cancel')
            : t('reviews.writeReview')}
        </Button>
      </div>

      {/* Rating Overview */}
      <div className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl bg-secondary/50">
        <div className="flex flex-col items-center justify-center md:w-40">
          <span className="text-4xl font-bold text-foreground">{campRating}</span>
          <StarRating rating={campRating} size="sm" />
          <span className="text-sm text-muted-foreground mt-1">{reviewCount} {t('reviews.reviewsCount')}</span>
        </div>
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-3">{rating}</span>
              <Star className="w-3 h-3 fill-sunrise text-sunrise" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.1 * (5 - rating) }}
                  className="h-full bg-sunrise rounded-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border border-border bg-card space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {t('reviews.yourName')}
                </label>
                <Input
                  placeholder={t('reviews.namePlaceholder')}
                  value={formData.userName}
                  onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {t('reviews.yourRating')}
                </label>
                <StarRating
                  rating={formData.rating}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                  interactive
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {t('reviews.yourReview')}
                </label>
                <Textarea
                  placeholder={t('reviews.reviewPlaceholder')}
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.comment.length}/500
                </p>
              </div>

              <Button
                type="submit"
                variant="forest"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('reviews.submitting') : t('reviews.submitReview')}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review}
            onHelpful={() => markHelpful(review.id)}
          />
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('reviews.noReviews')}</p>
          </div>
        )}

        {reviews.length > 3 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? t('reviews.showLess') : t('reviews.showAll', { count: reviews.length })}
            <ChevronDown className={cn(
              "w-4 h-4 ml-1 transition-transform",
              showAll && "rotate-180"
            )} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
