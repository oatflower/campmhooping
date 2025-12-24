import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type Category = 'bathroom' | 'convenience' | 'rental' | 'food' | 'transport' | 'rules';

const categories: { id: Category; icon: string }[] = [
  { id: 'bathroom', icon: '🚿' },
  { id: 'convenience', icon: '🔌' },
  { id: 'rental', icon: '🎪' },
  { id: 'food', icon: '🍳' },
  { id: 'transport', icon: '🚗' },
  { id: 'rules', icon: '📋' },
];

const facilityOptions: Record<Category, { id: string; icon: string }[]> = {
  bathroom: [
    { id: 'hot_shower', icon: '🚿' },
    { id: 'flush_toilet', icon: '🚽' },
    { id: 'squat_toilet', icon: '🚻' },
    { id: 'private_bathroom', icon: '🛁' },
    { id: 'shared_bathroom', icon: '🚿' },
    { id: 'outdoor_shower', icon: '🌿' },
  ],
  convenience: [
    { id: 'electricity', icon: '🔌' },
    { id: 'wifi', icon: '📶' },
    { id: 'parking', icon: '🅿️' },
    { id: 'charging', icon: '🔋' },
    { id: 'drinking_water', icon: '💧' },
    { id: 'trash', icon: '🗑️' },
    { id: 'first_aid', icon: '🩹' },
    { id: 'security', icon: '🔒' },
  ],
  rental: [
    { id: 'tent_rental', icon: '⛺' },
    { id: 'sleeping_bag', icon: '🛏️' },
    { id: 'mat', icon: '🟫' },
    { id: 'chair', icon: '🪑' },
    { id: 'table', icon: '🪵' },
    { id: 'grill', icon: '🔥' },
    { id: 'lamp', icon: '💡' },
    { id: 'cooker', icon: '🍳' },
  ],
  food: [
    { id: 'breakfast', icon: '🍳' },
    { id: 'lunch', icon: '🍱' },
    { id: 'dinner', icon: '🍽️' },
    { id: 'bbq_set', icon: '🥩' },
    { id: 'drinks', icon: '🥤' },
    { id: 'cafe', icon: '☕' },
    { id: 'mini_mart', icon: '🏪' },
    { id: 'kitchen', icon: '👩‍🍳' },
  ],
  transport: [
    { id: 'pickup_service', icon: '🚐' },
    { id: '4wd_required', icon: '🚙' },
    { id: 'sedan_ok', icon: '🚗' },
    { id: 'bike_rental', icon: '🚲' },
    { id: 'atv_rental', icon: '🏍️' },
  ],
  rules: [
    { id: 'pets_allowed', icon: '🐕' },
    { id: 'no_pets', icon: '🚫' },
    { id: 'alcohol_allowed', icon: '🍺' },
    { id: 'no_alcohol', icon: '🚫' },
    { id: 'music_allowed', icon: '🎵' },
    { id: 'quiet_hours', icon: '🤫' },
    { id: 'campfire_allowed', icon: '🔥' },
    { id: 'no_campfire', icon: '🚫' },
  ],
};

const Facilities = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();
  const [activeCategory, setActiveCategory] = useState<Category>('bathroom');

  const selectedFacilities = onboardingData.facilities || {};

  const toggleFacility = (category: Category, facilityId: string) => {
    const categoryFacilities = selectedFacilities[category] || [];
    const isSelected = categoryFacilities.includes(facilityId);

    updateOnboardingData({
      facilities: {
        ...selectedFacilities,
        [category]: isSelected
          ? categoryFacilities.filter((f: string) => f !== facilityId)
          : [...categoryFacilities, facilityId],
      },
    });
  };

  const handleNext = () => {
    setCurrentPage(15);
    navigate('/host/onboarding/photos');
  };

  const handleBack = () => {
    setCurrentPage(8);
    navigate('/host/onboarding/step2');
  };

  const totalSelected = Object.values(selectedFacilities).flat().length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-3xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 2, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.facilities.title')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('onboarding.facilities.subtitle')}
          </p>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => {
              const count = (selectedFacilities[cat.id] || []).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all",
                    activeCategory === cat.id
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium">{t(`onboarding.facilities.categories.${cat.id}`)}</span>
                  {count > 0 && (
                    <span className={cn(
                      "w-5 h-5 rounded-full text-xs flex items-center justify-center",
                      activeCategory === cat.id
                        ? "bg-background text-foreground"
                        : "bg-foreground text-background"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Facility Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              {facilityOptions[activeCategory].map((facility) => {
                const isSelected = (selectedFacilities[activeCategory] || []).includes(facility.id);
                return (
                  <button
                    key={facility.id}
                    onClick={() => toggleFacility(activeCategory, facility.id)}
                    className={cn(
                      "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      "hover:border-foreground/50",
                      isSelected
                        ? "border-foreground bg-secondary"
                        : "border-border bg-background"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    )}
                    <span className="text-2xl">{facility.icon}</span>
                    <span className="text-sm font-medium">{t(`onboarding.facilities.options.${facility.id}`)}</span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Summary */}
          {totalSelected > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-sm text-muted-foreground text-center"
            >
              {t('onboarding.facilities.selected', { count: totalSelected })}
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

export default Facilities;
