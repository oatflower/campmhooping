import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWeather, DayWeather } from '@/services/weatherService';

interface UseWeatherResult {
  data: DayWeather[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWeather = (lat: number, lng: number): UseWeatherResult => {
  const { i18n } = useTranslation();
  const [data, setData] = useState<DayWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!lat || !lng) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWeather(lat, lng);
      setData(result);
    } catch (err) {
      setError('Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchData();
  }, [fetchData, i18n.language]);

  return { data, isLoading, error, refetch: fetchData };
};
