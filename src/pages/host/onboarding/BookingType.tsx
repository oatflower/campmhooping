import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const bookingTypes = [
  {
    id: 'instant',
    icon: Zap,
    recommended: true,
  },
  {
    id: 'approve',
    icon: Clock,
    recommended: false,
  },
];

const BookingType = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const handleSelect = (type: string) => {
    updateOnboardingData({ instantBook: type === 'instant' });
  };

  const handleNext = () => {
    setCurrentPage(20);
    navigate('/host/onboarding/pricing');
  };

  const handleBack = () => {
    setCurrentPage(18);
    navigate('/host/onboarding/step3');
  };

  const selectedType = onboardingData.instantBook ? 'instant' : 'approve';

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-2xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 3, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.bookingType.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.bookingType.subtitle')}
          </p>

          {/* Booking Type Options */}
          <div className="space-y-4">
            {bookingTypes.map((type, index) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelect(type.id)}
                  className={cn(
                    "relative w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all",
                    "hover:border-foreground/50",
                    isSelected
                      ? "border-foreground bg-secondary"
                      : "border-border"
                  )}
                >
                  {/* Selected Check */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
                      <Check className="w-4 h-4 text-background" />
                    </div>
                  )}

                  {/* Recommended Badge */}
                  {type.recommended && (
                    <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {t('onboarding.bookingType.recommended')}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pr-8">
                    <h3 className="font-semibold text-foreground mb-1">
                      {t(`onboarding.bookingType.${type.id}.title`)}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {t(`onboarding.bookingType.${type.id}.titleEn`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`onboarding.bookingType.${type.id}.desc`)}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-secondary/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              💡 {t('onboarding.bookingType.tip')}
            </p>
          </motion.div>
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
            {t('onboarding.next')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingType;
