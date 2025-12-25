import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  MessageCircle,
  Send,
  CheckCircle,
  Loader2,
  StarHalf,
  Tent
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { getHostReviews, addHostResponse, ReviewRecord } from '@/services/reviewsFavoritesCrud';

const HostReviews = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : undefined;

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'responded'>('all');
  const [respondingTo, setRespondingTo] = useState<ReviewRecord | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getHostReviews();
      if (result.success && result.data) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filter reviews by tab
  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'pending') return !review.host_response;
    if (activeTab === 'responded') return !!review.host_response;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.host_response).length;
  const respondedCount = reviews.filter(r => !!r.host_response).length;

  // Handle submit response
  const handleSubmitResponse = async () => {
    if (!respondingTo || response.trim().length < 10) {
      toast.error(t('hostReviews.responseTooShort', 'Response must be at least 10 characters'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addHostResponse(respondingTo.id, response);
      if (result.success && result.data) {
        setReviews(prev =>
          prev.map(r => r.id === respondingTo.id ? { ...r, host_response: response, host_response_at: new Date().toISOString() } : r)
        );
        toast.success(t('hostReviews.responseSuccess', 'Response posted successfully'));
        setRespondingTo(null);
        setResponse('');
      } else {
        toast.error(result.error || 'Failed to post response');
      }
    } catch (error) {
      toast.error('Failed to post response');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalf) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  // Review card component
  const ReviewCard = ({ review }: { review: ReviewRecord }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl p-4 bg-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.profiles?.avatar_url} />
            <AvatarFallback>{review.profiles?.name?.charAt(0) || 'G'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{review.profiles?.name || t('common.guest', 'Guest')}</p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(review.created_at), 'PPP', { locale })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Camp name */}
      {review.camps && (
        <Badge variant="secondary" className="mb-2">
          {(review.camps as { name: string }).name}
        </Badge>
      )}

      {/* Review content */}
      {review.title && <p className="font-medium mb-1">{review.title}</p>}
      <p className="text-muted-foreground">{review.comment}</p>

      {/* Sub-ratings */}
      {(review.rating_cleanliness || review.rating_location || review.rating_value || review.rating_communication) && (
        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          {review.rating_cleanliness && (
            <span className="text-muted-foreground">
              {t('reviews.cleanliness', 'Cleanliness')}: {review.rating_cleanliness}
            </span>
          )}
          {review.rating_location && (
            <span className="text-muted-foreground">
              {t('reviews.location', 'Location')}: {review.rating_location}
            </span>
          )}
          {review.rating_value && (
            <span className="text-muted-foreground">
              {t('reviews.value', 'Value')}: {review.rating_value}
            </span>
          )}
          {review.rating_communication && (
            <span className="text-muted-foreground">
              {t('reviews.communication', 'Communication')}: {review.rating_communication}
            </span>
          )}
        </div>
      )}

      {/* Host response */}
      {review.host_response ? (
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('hostReviews.yourResponse', 'Your Response')}
            </span>
            {review.host_response_at && (
              <span className="text-xs text-muted-foreground">
                {format(parseISO(review.host_response_at), 'PP', { locale })}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{review.host_response}</p>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setRespondingTo(review);
            setResponse('');
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('hostReviews.respond', 'Respond')}
        </Button>
      )}
    </motion.div>
  );

  return (
    <main className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('hostReviews.title', 'Reviews')}</h1>
          <p className="text-muted-foreground">{t('hostReviews.subtitle', 'See what guests are saying and respond to feedback')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{reviews.length}</p>
              <p className="text-sm text-muted-foreground">{t('hostReviews.totalReviews', 'Total Reviews')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">{t('hostReviews.pendingResponse', 'Pending Response')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">
                {reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '-'}
              </p>
              <p className="text-sm text-muted-foreground">{t('hostReviews.avgRating', 'Avg Rating')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              {t('hostReviews.allTab', 'All')} ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              {t('hostReviews.pendingTab', 'Pending')}
              {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="responded">
              {t('hostReviews.respondedTab', 'Responded')} ({respondedCount})
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {t('hostReviews.loading', 'Loading reviews...')}
                    </p>
                  </CardContent>
                </Card>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Tent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      {activeTab === 'pending'
                        ? t('hostReviews.noPending', 'No reviews pending response')
                        : activeTab === 'responded'
                        ? t('hostReviews.noResponded', 'No responded reviews yet')
                        : t('hostReviews.noReviews', 'No reviews yet')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('hostReviews.reviewsWillAppear', 'Guest reviews will appear here after their stay')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Response Dialog */}
      <Dialog open={!!respondingTo} onOpenChange={(open) => !open && setRespondingTo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('hostReviews.respondToReview', 'Respond to Review')}
            </DialogTitle>
            <DialogDescription>
              {t('hostReviews.respondDesc', 'Your response will be visible to all users viewing this review.')}
            </DialogDescription>
          </DialogHeader>

          {respondingTo && (
            <div className="space-y-4">
              {/* Original review preview */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={respondingTo.profiles?.avatar_url} />
                    <AvatarFallback>{respondingTo.profiles?.name?.charAt(0) || 'G'}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{respondingTo.profiles?.name}</span>
                  <div className="flex items-center">
                    {renderStars(respondingTo.rating)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{respondingTo.comment}</p>
              </div>

              {/* Response textarea */}
              <div>
                <Textarea
                  placeholder={t('hostReviews.responsePlaceholder', 'Thank you for your feedback...')}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('hostReviews.minChars', 'Minimum 10 characters')} ({response.length}/10)
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondingTo(null)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSubmitResponse} disabled={isSubmitting || response.trim().length < 10}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('common.sending', 'Sending...')}</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> {t('hostReviews.postResponse', 'Post Response')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default HostReviews;
