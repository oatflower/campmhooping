import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Step3Intro = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentPage } = useHost();

  const handleNext = () => {
    setCurrentPage(19);
    navigate('/host/onboarding/booking-type');
  };

  const handleBack = () => {
    setCurrentPage(17);
    navigate('/host/onboarding/description');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg text-center"
        >
          <div className="text-6xl mb-6">🚀</div>
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.step', { number: 3 })}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('onboarding.step3Intro.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('onboarding.step3Intro.subtitle')}
          </p>
          <p className="text-muted-foreground mt-4">
            {t('onboarding.step3Intro.desc')}
          </p>
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

export default Step3Intro;
