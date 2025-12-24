import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

const Pricing = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();
  const [hasWeekendPremium, setHasWeekendPremium] = useState(onboardingData.weekendPremium > 0);

  const handleNext = () => {
    if (onboardingData.basePrice > 0) {
      setCurrentPage(22);
      navigate('/host/onboarding/discounts');
    }
  };

  const handleBack = () => {
    setCurrentPage(19);
    navigate('/host/onboarding/booking-type');
  };

  const adjustPrice = (amount: number) => {
    const newPrice = Math.max(0, onboardingData.basePrice + amount);
    updateOnboardingData({ basePrice: newPrice });
  };

  const adjustWeekendPremium = (amount: number) => {
    const newPremium = Math.max(0, onboardingData.weekendPremium + amount);
    updateOnboardingData({ weekendPremium: newPremium });
  };

  const weekendPrice = onboardingData.basePrice + onboardingData.weekendPremium;

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
            {t('onboarding.pricing.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.pricing.subtitle')}
          </p>

          {/* Base Price */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <Label className="text-base font-medium mb-4 block">
              {t('onboarding.pricing.basePrice')}
            </Label>
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => adjustPrice(-50)}
                disabled={onboardingData.basePrice <= 0}
              >
                <Minus className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    {formatPrice(onboardingData.basePrice)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{t('onboarding.pricing.perNight')}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => adjustPrice(50)}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-4">
              <Input
                type="number"
                value={onboardingData.basePrice || ''}
                onChange={(e) =>
                  updateOnboardingData({ basePrice: parseInt(e.target.value) || 0 })
                }
                className="text-center h-12 text-lg"
                placeholder={t('onboarding.pricing.enterPrice')}
              />
            </div>
          </div>

          {/* Weekend Premium */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-medium">{t('onboarding.pricing.weekendPrice')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.pricing.weekendDays')}
                </p>
              </div>
              <Switch
                checked={hasWeekendPremium}
                onCheckedChange={(checked) => {
                  setHasWeekendPremium(checked);
                  if (!checked) {
                    updateOnboardingData({ weekendPremium: 0 });
                  }
                }}
              />
            </div>

            {hasWeekendPremium && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Label className="text-sm text-muted-foreground mb-3 block">
                  {t('onboarding.pricing.addFromBase')}
                </Label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10"
                    onClick={() => adjustWeekendPremium(-50)}
                    disabled={onboardingData.weekendPremium <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-bold">
                    +{formatPrice(onboardingData.weekendPremium)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10"
                    onClick={() => adjustWeekendPremium(50)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  {t('onboarding.pricing.weekendTotal')} <span className="font-semibold text-foreground">{formatPrice(weekendPrice)}</span> {t('onboarding.pricing.perNight')}
                </p>
              </motion.div>
            )}
          </div>

          {/* Pay at Camp Option */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Allow "Pay at Camp"</Label>
                <p className="text-sm text-muted-foreground">
                  Guests can choose to pay in cash upon arrival
                </p>
              </div>
              <Switch
                checked={onboardingData.acceptsPayAtCamp || false}
                onCheckedChange={(checked) => {
                  updateOnboardingData({ acceptsPayAtCamp: checked });
                }}
              />
            </div>
          </div>

          {/* Price Suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-secondary/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              💡 {t('onboarding.pricing.suggestion')}
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
            disabled={onboardingData.basePrice <= 0}
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

export default Pricing;
