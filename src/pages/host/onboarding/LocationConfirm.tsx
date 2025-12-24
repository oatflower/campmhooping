import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Move } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LocationConfirm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const handleNext = () => {
    setCurrentPage(5);
    navigate('/host/onboarding/environment');
  };

  const handleBack = () => {
    setCurrentPage(3);
    navigate('/host/onboarding/location');
  };

  // Simulated coordinates for demo (in real app, use geocoding API)
  const handlePinDrag = () => {
    // In production, this would update lat/lng from map interaction
    updateOnboardingData({
      location: {
        ...onboardingData.location,
        lat: 18.7883,
        lng: 98.9853,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-3xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 1, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.locationConfirm.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.locationConfirm.subtitle')}
          </p>

          {/* Location Summary */}
          <div className="bg-secondary/50 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {onboardingData.location.province}
                  {onboardingData.location.district && `, ${onboardingData.location.district}`}
                </p>
                {onboardingData.location.address && (
                  <p className="text-sm text-muted-foreground">
                    {onboardingData.location.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div
            className="relative w-full h-80 bg-secondary rounded-2xl overflow-hidden border-2 border-dashed border-border"
            onClick={handlePinDrag}
          >
            {/* Map Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10">
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Center Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="relative"
              >
                <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 text-background" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rounded-full" />
              </motion.div>
            </div>

            {/* Drag Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              <div className="flex items-center gap-2 text-sm">
                <Move className="w-4 h-4" />
                <span>{t('onboarding.locationConfirm.dragToAdjust')}</span>
              </div>
            </div>

            {/* Note about Mapbox */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-background/90 backdrop-blur-sm rounded-xl p-3 text-xs text-muted-foreground">
                💡 {t('onboarding.locationConfirm.mapNote')}
              </div>
            </div>
          </div>

          {/* Coordinates Display */}
          {onboardingData.location.lat && onboardingData.location.lng && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              📍 {onboardingData.location.lat.toFixed(4)}, {onboardingData.location.lng.toFixed(4)}
            </div>
          )}
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
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {t('onboarding.locationConfirm.confirmLocation')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirm;
