import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, MapPin, Users, Zap, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

const Review = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { onboardingData, publishListing, isPublishing, setCurrentPage } = useHost();
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    setError(null);
    const success = await publishListing();

    if (success) {
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/host?published=true');
      }, 2000);
    }
  };

  const handleBack = () => {
    setCurrentPage(23);
    navigate('/host/onboarding/contact');
  };

  const totalFacilities = Object.values(onboardingData.facilities).flat().length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-2xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t('onboarding.review.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('onboarding.review.subtitle')}
            </p>
          </div>

          {/* Preview Card */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
            {/* Cover Image */}
            {onboardingData.images.length > 0 && (
              <div className="aspect-video bg-secondary relative">
                <img
                  src={onboardingData.images[onboardingData.coverImageIndex]}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {t('onboarding.review.photos', { count: onboardingData.images.length - 1 })}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-xl font-bold">{onboardingData.title}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {onboardingData.location.district}, {onboardingData.location.province}
                </p>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {onboardingData.description}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-secondary rounded-full text-sm">
                  {t(`onboarding.review.campTypes.${onboardingData.campType || 'tent'}`)}
                </span>
                <span className="px-3 py-1 bg-secondary rounded-full text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {t('onboarding.review.maxGuests', { count: onboardingData.capacity.maxCampers })}
                </span>
                <span className="px-3 py-1 bg-secondary rounded-full text-sm">
                  {t('onboarding.review.zones', { count: onboardingData.zones.length })}
                </span>
              </div>

              {/* Price */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatPrice(onboardingData.basePrice)}
                  </span>
                  <span className="text-muted-foreground">{t('onboarding.review.perNight')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Checklist */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t('onboarding.review.summary')}</h3>
            <div className="space-y-2">
              {[
                { label: t('onboarding.review.campType'), value: t(`onboarding.review.campTypes.${onboardingData.campType || 'tent'}`), done: !!onboardingData.campType },
                { label: t('onboarding.review.locationLabel'), value: `${onboardingData.location.province}`, done: !!onboardingData.location.province },
                { label: t('onboarding.review.atmosphere'), value: t('onboarding.review.items', { count: onboardingData.environments.length }), done: onboardingData.environments.length > 0 },
                { label: t('onboarding.review.capacity'), value: `${onboardingData.capacity.maxCampers} ${t('onboarding.review.persons')}`, done: onboardingData.capacity.maxCampers > 0 },
                { label: t('onboarding.review.zonesLabel'), value: t('onboarding.review.zones', { count: onboardingData.zones.length }), done: onboardingData.zones.length > 0 },
                { label: t('onboarding.review.facilitiesLabel'), value: t('onboarding.review.items', { count: totalFacilities }), done: totalFacilities > 0 },
                { label: t('onboarding.review.photosLabel'), value: t('onboarding.review.photos', { count: onboardingData.images.length }), done: onboardingData.images.length >= 5 },
                { label: t('onboarding.review.priceLabel'), value: t('onboarding.review.pricePerNight', { price: formatPrice(onboardingData.basePrice) }), done: onboardingData.basePrice > 0 },
                { label: t('onboarding.review.bookingLabel'), value: onboardingData.instantBook ? t('onboarding.review.instantBook') : t('onboarding.review.requestBook'), done: true, icon: onboardingData.instantBook ? Zap : Clock },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.done ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    {item.icon && <item.icon className="w-3 h-3" />}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-16 bg-background border-t border-border">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            className="gap-2"
            disabled={isPublishing}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.back')}
          </Button>
          <Button
            size="lg"
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
          >
            {isPublishing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('onboarding.review.publish')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Review;
