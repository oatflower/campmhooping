import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StepperProps {
  label: string;
  labelEn: string;
  icon: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const Stepper = ({ label, labelEn, icon, value, min = 0, max = 100, onChange }: StepperProps) => {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center justify-between py-6 border-b border-border last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{labelEn}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-semibold text-lg">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Capacity = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const updateCapacity = (field: keyof typeof onboardingData.capacity, value: number) => {
    updateOnboardingData({
      capacity: {
        ...onboardingData.capacity,
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    if (onboardingData.capacity.maxCampers > 0) {
      setCurrentPage(7);
      navigate('/host/onboarding/zones');
    }
  };

  const handleBack = () => {
    setCurrentPage(5);
    navigate('/host/onboarding/environment');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 1, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.capacity.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.capacity.subtitle')}
          </p>

          {/* Capacity Steppers */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <Stepper
              icon="👥"
              label={t('onboarding.capacity.maxGuests')}
              labelEn={t('onboarding.capacity.maxGuestsEn')}
              value={onboardingData.capacity.maxCampers}
              min={1}
              max={500}
              onChange={(v) => updateCapacity('maxCampers', v)}
            />
            <Stepper
              icon="⛺"
              label={t('onboarding.capacity.tentSpots')}
              labelEn={t('onboarding.capacity.tentSpotsEn')}
              value={onboardingData.capacity.tentSpots}
              min={0}
              max={100}
              onChange={(v) => updateCapacity('tentSpots', v)}
            />
            <Stepper
              icon="🚿"
              label={t('onboarding.capacity.bathrooms')}
              labelEn={t('onboarding.capacity.bathroomsEn')}
              value={onboardingData.capacity.bathrooms}
              min={0}
              max={50}
              onChange={(v) => updateCapacity('bathrooms', v)}
            />
          </div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-secondary/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> {t('onboarding.capacity.tip')}
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
            disabled={onboardingData.capacity.maxCampers < 1}
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

export default Capacity;
