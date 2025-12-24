import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Description = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const handleNext = () => {
    if (onboardingData.description.trim()) {
      setCurrentPage(18);
      navigate('/host/onboarding/step3');
    }
  };

  const handleBack = () => {
    setCurrentPage(16);
    navigate('/host/onboarding/title');
  };

  const minLength = 50;
  const maxLength = 500;
  const charCount = onboardingData.description.length;
  const isValid = charCount >= minLength && charCount <= maxLength;

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
            {t('onboarding.description.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.description.subtitle')}
          </p>

          {/* Description Input */}
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={onboardingData.description}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    updateOnboardingData({ description: e.target.value });
                  }
                }}
                placeholder={t('onboarding.description.placeholder')}
                className="min-h-[200px] text-base resize-none"
                autoFocus
              />
            </div>

            {/* Character Count */}
            <div className="flex items-center justify-between text-sm">
              <span className={`${charCount < minLength ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {charCount < minLength
                  ? t('onboarding.description.needMore', { count: minLength - charCount })
                  : t('onboarding.description.charCount', { current: charCount, max: maxLength })}
              </span>
              {isValid && (
                <span className="text-green-500">{t('onboarding.description.great')}</span>
              )}
            </div>

            {/* Prompts */}
            <div className="space-y-3 pt-4">
              <p className="text-sm font-medium">{t('onboarding.description.prompts')}</p>
              <div className="space-y-2">
                {[
                  `🌄 ${t('onboarding.description.prompt1')}`,
                  `✨ ${t('onboarding.description.prompt2')}`,
                  `👨‍👩‍👧‍👦 ${t('onboarding.description.prompt3')}`,
                  `🎯 ${t('onboarding.description.prompt4')}`,
                ].map((prompt) => (
                  <div
                    key={prompt}
                    className="px-4 py-2 bg-secondary/50 rounded-xl text-sm text-muted-foreground"
                  >
                    {prompt}
                  </div>
                ))}
              </div>
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
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!isValid}
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

export default Description;
