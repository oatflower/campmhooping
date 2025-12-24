import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeather } from '@/hooks/useWeather';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

interface WeatherDetailCardProps {
  lat: number;
  lng: number;
  province: string;
}

const WeatherDetailCard = ({ lat, lng, province }: WeatherDetailCardProps) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error } = useWeather(lat, lng);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const dateLocale = i18n.language === 'th' ? th : enUS;

  // Translate date labels from weatherService
  const translateDateLabel = (label: string, date: Date): string => {
    // Handle new placeholder format
    if (label === '__TODAY__') return t('weather.today');
    if (label === '__TOMORROW__') return t('weather.tomorrow');
    if (label.startsWith('__DAY_')) {
      return format(date, 'EEE d', { locale: dateLocale });
    }
    // Handle old cached Thai labels
    if (label === 'วันนี้') return t('weather.today');
    if (label === 'พรุ่งนี้') return t('weather.tomorrow');
    // For other formats like "จ. 22", re-format with correct locale
    if (/^[ก-๙]/.test(label)) {
      return format(date, 'EEE d', { locale: dateLocale });
    }
    return label;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return null;
  }

  const selectedDay = data[selectedDayIndex];

  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">
          {t('weather.title')} · {province}
        </h3>
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {selectedDay.slots.map((slot) => (
          <div
            key={slot.hour}
            className="flex flex-col items-center p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <span className="text-xs text-muted-foreground mb-1">{slot.time}</span>
            <span className="text-2xl mb-1">{slot.icon}</span>
            <span className="text-lg font-semibold text-foreground">{slot.temp}°C</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Wind className="w-3 h-3" />
              <span>{slot.windSpeed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span>{t('weather.humidity')} {selectedDay.avgHumidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-gray-500" />
          <span>{t('weather.rainChance')} {selectedDay.maxRainProbability}%</span>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2">
        {data.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDayIndex(index)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedDayIndex === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            )}
          >
            {translateDateLabel(day.dateLabel, day.date)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeatherDetailCard;
