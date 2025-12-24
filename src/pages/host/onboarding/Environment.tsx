import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const environments = [
  { id: 'mountain', icon: '⛰️' },
  { id: 'forest', icon: '🌲' },
  { id: 'waterfall', icon: '💧' },
  { id: 'river', icon: '🏞️' },
  { id: 'lake', icon: '🏊' },
  { id: 'sea', icon: '🏖️' },
  { id: 'ricefield', icon: '🌾' },
  { id: 'garden', icon: '🌻' },
  { id: 'cliff', icon: '🪨' },
  { id: 'cave', icon: '🕳️' },
  { id: 'hotspring', icon: '♨️' },
  { id: 'stargazing', icon: '⭐' },
  { id: 'sunrise', icon: '🌅' },
  { id: 'sunset', icon: '🌇' },
  { id: 'foggy', icon: '🌫️' },
  { id: 'quiet', icon: '🤫' },
];

const Environment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const handleToggle = (envId: string) => {
    const currentEnvs = onboardingData.environments || [];
    const isSelected = currentEnvs.includes(envId);

    if (isSelected) {
      updateOnboardingData({
        environments: currentEnvs.filter((e) => e !== envId),
      });
    } else {
      updateOnboardingData({
        environments: [...currentEnvs, envId],
      });
    }
  };

  const handleNext = () => {
    if (onboardingData.environments.length > 0) {
      setCurrentPage(6);
      navigate('/host/onboarding/capacity');
    }
  };

  const handleBack = () => {
    setCurrentPage(4);
    navigate('/host/onboarding/location-confirm');
  };

  const selectedCount = onboardingData.environments?.length || 0;

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
            {t('onboarding.environment.title')}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t('onboarding.environment.subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {t('onboarding.environment.selectMultiple')}
          </p>

          {/* Environment Pills */}
          <div className="flex flex-wrap gap-3">
            {environments.map((env, index) => {
              const isSelected = onboardingData.environments?.includes(env.id);
              return (
                <motion.button
                  key={env.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleToggle(env.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all",
                    "hover:border-foreground/50 hover:bg-secondary/50",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground"
                  )}
                >
                  <span className="text-lg">{env.icon}</span>
                  <span className="font-medium text-sm">{t(`onboarding.environment.types.${env.id}`)}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 ml-1" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Count */}
          {selectedCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-sm text-muted-foreground"
            >
              {t('onboarding.environment.selected', { count: selectedCount })}
            </motion.p>
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
            disabled={selectedCount === 0}
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

export default Environment;
