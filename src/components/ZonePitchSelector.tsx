import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Zap, Droplets, Trees, Sun, Check } from 'lucide-react';
import type { CampZone, CampPitch } from '@/types/camp';

interface ZonePitchSelectorProps {
  zones: CampZone[];
  selectedZoneId?: string;
  selectedPitchId?: string;
  onSelect: (zoneId: string, pitchId: string) => void;
  basePrice: number;
}

// Feature icons mapping
const featureIcons: Record<string, React.ReactNode> = {
  'riverside': <Droplets className="w-3 h-3" />,
  'shaded': <Trees className="w-3 h-3" />,
  'power-hookup': <Zap className="w-3 h-3" />,
  'water-nearby': <Droplets className="w-3 h-3" />,
  'sunrise-view': <Sun className="w-3 h-3" />,
};

const ZonePitchSelector = ({
  zones,
  selectedZoneId,
  selectedPitchId,
  onSelect,
  basePrice,
}: ZonePitchSelectorProps) => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language === 'th';
  const [isOpen, setIsOpen] = useState(false);
  const [tempZoneId, setTempZoneId] = useState<string | undefined>(selectedZoneId);
  const [tempPitchId, setTempPitchId] = useState<string | undefined>(selectedPitchId);

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const selectedPitch = selectedZone?.pitches.find(p => p.id === selectedPitchId);

  const handleConfirm = () => {
    if (tempZoneId && tempPitchId) {
      onSelect(tempZoneId, tempPitchId);
      setIsOpen(false);
    }
  };

  const getZoneName = (zone: CampZone) => isThai ? zone.name : zone.nameEn;
  const getZoneDesc = (zone: CampZone) => isThai ? zone.description : zone.descriptionEn;

  const getPitchStatusColor = (status: CampPitch['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'booked': return 'bg-red-400';
      case 'maintenance': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getPitchSizeLabel = (size: CampPitch['size']) => {
    switch (size) {
      case 'small': return t('zonePitch.sizeSmall', 'S');
      case 'medium': return t('zonePitch.sizeMedium', 'M');
      case 'large': return t('zonePitch.sizeLarge', 'L');
      default: return size;
    }
  };

  const calculateZonePrice = (zone: CampZone) => {
    const modifier = zone.priceModifier / 100;
    return Math.round(basePrice * (1 + modifier));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-3 px-4"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">
                {selectedPitch
                  ? `${getZoneName(selectedZone!)} - ${t('zonePitch.pitch')} ${selectedPitch.name}`
                  : t('zonePitch.selectPitch', 'Select your pitch')
                }
              </p>
              {selectedPitch && (
                <p className="text-xs text-muted-foreground">
                  {selectedPitch.features.slice(0, 2).join(', ')}
                </p>
              )}
            </div>
          </div>
          {selectedPitch && (
            <Badge variant="secondary" className="ml-2">
              {getPitchSizeLabel(selectedPitch.size)}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('zonePitch.title', 'Select Your Camping Spot')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zone Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('zonePitch.selectZone', 'Select Zone')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zones.map(zone => {
                const isSelected = tempZoneId === zone.id;
                const zonePrice = calculateZonePrice(zone);
                const priceDiff = zonePrice - basePrice;

                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setTempZoneId(zone.id);
                      setTempPitchId(undefined);
                    }}
                    className={cn(
                      "relative p-4 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <h4 className="font-semibold text-base mb-1">{getZoneName(zone)}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {getZoneDesc(zone)}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {zone.features.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs gap-1">
                          {featureIcons[feature]}
                          {t(`zonePitch.features.${feature}`, feature)}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {zone.pitches.filter(p => p.status === 'available').length} {t('zonePitch.available', 'available')}
                      </span>
                      {priceDiff !== 0 && (
                        <span className={cn(
                          "text-xs font-medium",
                          priceDiff > 0 ? "text-orange-600" : "text-green-600"
                        )}>
                          {priceDiff > 0 ? '+' : ''}{priceDiff.toLocaleString()} THB
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pitch Selection */}
          {tempZoneId && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('zonePitch.selectPitchIn', 'Select Pitch in')} {getZoneName(zones.find(z => z.id === tempZoneId)!)}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {zones
                  .find(z => z.id === tempZoneId)
                  ?.pitches.map(pitch => {
                    const isSelected = tempPitchId === pitch.id;
                    const isAvailable = pitch.status === 'available';

                    return (
                      <button
                        key={pitch.id}
                        onClick={() => isAvailable && setTempPitchId(pitch.id)}
                        disabled={!isAvailable}
                        className={cn(
                          "relative p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : isAvailable
                            ? "border-border hover:border-primary/50"
                            : "border-border bg-muted/50 cursor-not-allowed opacity-50"
                        )}
                      >
                        {/* Status indicator */}
                        <div className={cn(
                          "absolute top-1 right-1 w-2 h-2 rounded-full",
                          getPitchStatusColor(pitch.status)
                        )} />

                        <span className="font-bold text-lg">{pitch.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {getPitchSizeLabel(pitch.size)}
                        </Badge>
                        <div className="flex gap-0.5 mt-1">
                          {pitch.features.slice(0, 2).map(feature => (
                            <span key={feature} className="text-muted-foreground">
                              {featureIcons[feature]}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{t('zonePitch.statusAvailable', 'Available')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span>{t('zonePitch.statusBooked', 'Booked')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>{t('zonePitch.statusMaintenance', 'Maintenance')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleConfirm}
              disabled={!tempZoneId || !tempPitchId}
              className="w-full"
            >
              {t('zonePitch.confirm', 'Confirm Selection')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZonePitchSelector;
