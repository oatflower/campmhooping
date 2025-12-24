import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2, GripVertical, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Zone {
  id: string;
  name: string;
  capacity: number;
  price: number | null;
}

const Zones = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();
  const [zones, setZones] = useState<Zone[]>(
    onboardingData.zones.length > 0
      ? onboardingData.zones
      : [{ id: '1', name: 'Zone A', capacity: 10, price: null }]
  );

  const addZone = () => {
    const newZone: Zone = {
      id: Date.now().toString(),
      name: t('onboarding.zones.newZoneName', { letter: String.fromCharCode(65 + zones.length) }),
      capacity: 5,
      price: null,
    };
    setZones([...zones, newZone]);
  };

  const removeZone = (id: string) => {
    if (zones.length > 1) {
      setZones(zones.filter((z) => z.id !== id));
    }
  };

  const updateZone = (id: string, updates: Partial<Zone>) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, ...updates } : z)));
  };

  const handleNext = () => {
    updateOnboardingData({ zones });
    setCurrentPage(8);
    navigate('/host/onboarding/step2');
  };

  const handleBack = () => {
    setCurrentPage(6);
    navigate('/host/onboarding/capacity');
  };

  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);

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
            {t('onboarding.zones.title')}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t('onboarding.zones.subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {t('onboarding.zones.desc')}
          </p>

          {/* Zones List */}
          <div className="space-y-4 mb-6">
            <AnimatePresence mode="popLayout">
              {zones.map((zone, index) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  layout
                  className="bg-card rounded-2xl border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div className="pt-3 cursor-grab text-muted-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Zone Content */}
                    <div className="flex-1 space-y-4">
                      {/* Zone Name */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {t('onboarding.zones.zoneName')}
                        </label>
                        <Input
                          value={zone.name}
                          onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                          placeholder={t('onboarding.zones.zoneNamePlaceholder')}
                          className="h-11"
                        />
                      </div>

                      {/* Capacity Stepper */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">
                          {t('onboarding.zones.capacity')}
                        </label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-9 h-9"
                            onClick={() =>
                              updateZone(zone.id, {
                                capacity: Math.max(1, zone.capacity - 1),
                              })
                            }
                            disabled={zone.capacity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">
                            {zone.capacity} <span className="text-muted-foreground font-normal">{t('onboarding.zones.persons')}</span>
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-9 h-9"
                            onClick={() =>
                              updateZone(zone.id, { capacity: zone.capacity + 1 })
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full text-muted-foreground hover:text-destructive",
                        zones.length === 1 && "invisible"
                      )}
                      onClick={() => removeZone(zone.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add Zone Button */}
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl border-dashed gap-2"
            onClick={addZone}
          >
            <Plus className="w-5 h-5" />
            {t('onboarding.zones.addZone')}
          </Button>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-secondary/50 rounded-xl flex items-center justify-between"
          >
            <span className="text-sm text-muted-foreground">
              {t('onboarding.zones.totalCapacity')}
            </span>
            <span className="font-semibold">
              {totalCapacity} {t('onboarding.zones.persons')}
            </span>
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
            disabled={zones.length === 0 || zones.some((z) => !z.name.trim())}
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

export default Zones;
