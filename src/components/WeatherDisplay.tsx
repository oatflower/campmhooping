import { useWeather } from '@/hooks/useWeather';
import { Wind, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface WeatherDisplayProps {
  lat: number;
  lng: number;
  checkIn?: Date;
}

const WeatherDisplay = ({ lat, lng, checkIn }: WeatherDisplayProps) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useWeather(lat, lng);
  const dateLocale = i18n.language === 'th' ? th : enUS;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs mt-2">
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const today = data[0];
  if (!today || today.slots.length === 0) return null;

  // Get midday slot (12pm) for representative temp, or first available
  const middaySlot = today.slots.find(s => s.hour === 12) || today.slots[0];
  const avgWind = Math.round(today.slots.reduce((a, b) => a + b.windSpeed, 0) / today.slots.length);

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
      {checkIn ? (
        <>
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(checkIn, 'd MMM', { locale: dateLocale })}</span>
        </>
      ) : (
        <span className="text-xs">{t('weather.today')}</span>
      )}
      <span className="text-base">{middaySlot.icon}</span>
      <span className="font-medium">{middaySlot.temp}°C</span>
      <Wind className="w-3.5 h-3.5 ml-1" />
      <span>{avgWind} km/h</span>
    </div>
  );
};

export default WeatherDisplay;
