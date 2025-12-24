import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const campTypes = [
  { id: 'tent', icon: '⛺', key: 'tent' },
  { id: 'glamping', icon: '🏕️', key: 'glamping' },
  { id: 'cabin', icon: '🏠', key: 'cabin' },
  { id: 'rv', icon: '🚐', key: 'rv' },
  { id: 'treehouse', icon: '🌳', key: 'treehouse' },
  { id: 'mixed', icon: '✨', key: 'mixed' },
];

const CampType = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const handleSelect = (typeId: string) => {
    updateOnboardingData({ campType: typeId });
  };

  const handleNext = () => {
    if (onboardingData.campType) {
      setCurrentPage(3);
      navigate('/host/onboarding/location');
    }
  };

  const handleBack = () => {
    setCurrentPage(1);
    navigate('/host/onboarding/step1');
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
            {t('onboarding.campType.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.campType.subtitle')}
          </p>

          {/* Camp Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(type.id)}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                  "hover:border-foreground/50 hover:bg-secondary/50",
                  onboardingData.campType === type.id
                    ? "border-foreground bg-secondary"
                    : "border-border"
                )}
              >
                {/* Selected Check */}
                {onboardingData.campType === type.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
                    <Check className="w-4 h-4 text-background" />
                  </div>
                )}

                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {type.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-0.5">
                    {t(`onboarding.campType.types.${type.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {t(`onboarding.campType.types.${type.key}.desc`)}
                  </p>
                </div>
              </motion.button>
            ))}
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
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!onboardingData.campType}
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

export default CampType;
