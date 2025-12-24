import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DiscountItemProps {
  icon: string;
  title: string;
  description: string;
  value: number;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onValueChange: (value: number) => void;
}

const DiscountItem = ({
  icon,
  title,
  description,
  value,
  enabled,
  onToggle,
  onValueChange,
}: DiscountItemProps) => (
  <div className={cn(
    "p-4 rounded-xl border transition-all",
    enabled ? "border-foreground bg-secondary/50" : "border-border"
  )}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
    {enabled && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="flex items-center justify-center gap-4 pt-2"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8"
          onClick={() => onValueChange(Math.max(5, value - 5))}
          disabled={value <= 5}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-xl font-bold w-16 text-center">{value}%</span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8"
          onClick={() => onValueChange(Math.min(50, value + 5))}
          disabled={value >= 50}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </motion.div>
    )}
  </div>
);

const Discounts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const [discounts, setDiscounts] = useState({
    firstTimer: { enabled: onboardingData.discounts.firstTimer > 0, value: onboardingData.discounts.firstTimer || 20 },
    weekly: { enabled: onboardingData.discounts.weekly > 0, value: onboardingData.discounts.weekly || 10 },
    monthly: { enabled: onboardingData.discounts.monthly > 0, value: onboardingData.discounts.monthly || 20 },
    lastMinute: { enabled: onboardingData.discounts.lastMinute > 0, value: onboardingData.discounts.lastMinute || 10 },
  });

  const updateDiscount = (key: keyof typeof discounts, updates: Partial<typeof discounts.firstTimer>) => {
    setDiscounts(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const handleNext = () => {
    updateOnboardingData({
      discounts: {
        firstTimer: discounts.firstTimer.enabled ? discounts.firstTimer.value : 0,
        weekly: discounts.weekly.enabled ? discounts.weekly.value : 0,
        monthly: discounts.monthly.enabled ? discounts.monthly.value : 0,
        lastMinute: discounts.lastMinute.enabled ? discounts.lastMinute.value : 0,
      }
    });
    setCurrentPage(23);
    navigate('/host/onboarding/contact');
  };

  const handleBack = () => {
    setCurrentPage(20);
    navigate('/host/onboarding/pricing');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 3, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.discounts.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.discounts.subtitle')}
          </p>

          {/* Discount Options */}
          <div className="space-y-4">
            <DiscountItem
              icon="🎉"
              title={t('onboarding.discounts.firstTimer.title')}
              description={t('onboarding.discounts.firstTimer.desc')}
              value={discounts.firstTimer.value}
              enabled={discounts.firstTimer.enabled}
              onToggle={(enabled) => updateDiscount('firstTimer', { enabled })}
              onValueChange={(value) => updateDiscount('firstTimer', { value })}
            />

            <DiscountItem
              icon="📅"
              title={t('onboarding.discounts.weekly.title')}
              description={t('onboarding.discounts.weekly.desc')}
              value={discounts.weekly.value}
              enabled={discounts.weekly.enabled}
              onToggle={(enabled) => updateDiscount('weekly', { enabled })}
              onValueChange={(value) => updateDiscount('weekly', { value })}
            />

            <DiscountItem
              icon="🗓️"
              title={t('onboarding.discounts.monthly.title')}
              description={t('onboarding.discounts.monthly.desc')}
              value={discounts.monthly.value}
              enabled={discounts.monthly.enabled}
              onToggle={(enabled) => updateDiscount('monthly', { enabled })}
              onValueChange={(value) => updateDiscount('monthly', { value })}
            />

            <DiscountItem
              icon="⚡"
              title={t('onboarding.discounts.lastMinute.title')}
              description={t('onboarding.discounts.lastMinute.desc')}
              value={discounts.lastMinute.value}
              enabled={discounts.lastMinute.enabled}
              onToggle={(enabled) => updateDiscount('lastMinute', { enabled })}
              onValueChange={(value) => updateDiscount('lastMinute', { value })}
            />
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-secondary/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              💡 {t('onboarding.discounts.tip')}
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

export default Discounts;
