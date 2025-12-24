import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const GetStarted = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      titleKey: 'onboarding.getStarted.step1Title',
      descKey: 'onboarding.getStarted.step1Desc',
      icon: '🏕️',
    },
    {
      number: 2,
      titleKey: 'onboarding.getStarted.step2Title',
      descKey: 'onboarding.getStarted.step2Desc',
      icon: '✨',
    },
    {
      number: 3,
      titleKey: 'onboarding.getStarted.step3Title',
      descKey: 'onboarding.getStarted.step3Desc',
      icon: '🚀',
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('onboarding.getStarted.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('onboarding.getStarted.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                {step.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('onboarding.step', { number: step.number })}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            onClick={() => navigate('/host/onboarding/step1')}
          >
            {t('onboarding.getStarted.button')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default GetStarted;
