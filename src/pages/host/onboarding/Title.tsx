import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Title = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const handleNext = () => {
    if (onboardingData.title.trim()) {
      setCurrentPage(17);
      navigate('/host/onboarding/description');
    }
  };

  const handleBack = () => {
    setCurrentPage(15);
    navigate('/host/onboarding/photos');
  };

  const maxLength = 50;
  const charCount = onboardingData.title.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-2xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 2, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.title.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.title.subtitle')}
          </p>

          {/* Title Input */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={onboardingData.title}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    updateOnboardingData({ title: e.target.value });
                  }
                }}
                placeholder={t('onboarding.title.placeholder')}
                className="h-14 text-lg"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {charCount}/{maxLength}
              </span>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('onboarding.title.ideas')}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  t('onboarding.title.suggestion1'),
                  t('onboarding.title.suggestion2'),
                  t('onboarding.title.suggestion3'),
                  t('onboarding.title.suggestion4'),
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      if (suggestion.length <= maxLength) {
                        updateOnboardingData({ title: suggestion });
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-secondary/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tips:</strong> {t('onboarding.title.tip')}
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
            disabled={!onboardingData.title.trim()}
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

export default Title;
