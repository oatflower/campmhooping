const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export interface WeatherSlot {
  time: string;
  hour: number;
  temp: number;
  icon: string;
  description: string;
  windSpeed: number;
  humidity: number;
  rainProbability: number;
}

export interface DayWeather {
  date: Date;
  dateLabel: string;
  slots: WeatherSlot[];
  avgHumidity: number;
  maxRainProbability: number;
}

interface CacheEntry {
  data: DayWeather[];
  timestamp: number;
}

const weatherIconMap: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '🌤️', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

const getCacheKey = (lat: number, lng: number) => `weather_${lat.toFixed(2)}_${lng.toFixed(2)}`;

// Cache version - increment to invalidate old cache
const CACHE_VERSION = 2;
const CACHE_VERSION_KEY = 'weather_cache_version';

// Clear all weather cache entries
export const clearWeatherCache = () => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('weather_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Auto-clear old cache on app load
(() => {
  try {
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (storedVersion !== String(CACHE_VERSION)) {
      clearWeatherCache();
      localStorage.setItem(CACHE_VERSION_KEY, String(CACHE_VERSION));
    }
  } catch {
    // Ignore errors
  }
})();

const getFromCache = (lat: number, lng: number): DayWeather[] | null => {
  try {
    const key = getCacheKey(lat, lng);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data.map(day => ({
      ...day,
      date: new Date(day.date)
    }));
  } catch {
    return null;
  }
};

const saveToCache = (lat: number, lng: number, data: DayWeather[]) => {
  try {
    const key = getCacheKey(lat, lng);
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Cache full or disabled
  }
};

const TARGET_HOURS = [8, 12, 18, 21]; // 8am, 12pm, 6pm, 9pm

const findClosestHour = (forecastHour: number, targetHours: number[]): number | null => {
  for (const target of targetHours) {
    if (Math.abs(forecastHour - target) <= 1) {
      return target;
    }
  }
  return null;
};

const formatTimeLabel = (hour: number): string => {
  if (hour === 8) return '8am';
  if (hour === 12) return '12pm';
  if (hour === 18) return '6pm';
  if (hour === 21) return '9pm';
  return `${hour}:00`;
};

// Returns a key for translation or a formatted date string
const formatDateLabel = (date: Date, index: number): string => {
  if (index === 0) return '__TODAY__';
  if (index === 1) return '__TOMORROW__';

  // For other days, return abbreviated weekday and date (will be formatted by component)
  return `__DAY_${date.getDay()}_${date.getDate()}__`;
};

export const fetchWeather = async (lat: number, lng: number): Promise<DayWeather[]> => {
  // Check cache first
  const cached = getFromCache(lat, lng);
  if (cached) return cached;

  if (!API_KEY) {
    console.warn('OpenWeather API key not configured');
    return generateMockWeather();
  }

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Weather API error');
    }

    const data = await response.json();
    const result = processWeatherData(data.list);

    saveToCache(lat, lng, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return generateMockWeather();
  }
};

interface WeatherItem {
  dt: number;
  main: { temp: number; humidity: number };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number };
  pop?: number;
}

const processWeatherData = (list: WeatherItem[]): DayWeather[] => {
  const dayMap = new Map<string, WeatherSlot[]>();

  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();
    const hour = date.getHours();

    const targetHour = findClosestHour(hour, TARGET_HOURS);
    if (targetHour === null) continue;

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, []);
    }

    const slots = dayMap.get(dateKey)!;

    // Avoid duplicates for same time slot
    if (slots.some(s => s.hour === targetHour)) continue;

    slots.push({
      time: formatTimeLabel(targetHour),
      hour: targetHour,
      temp: Math.round(item.main.temp),
      icon: weatherIconMap[item.weather[0].icon] || '☀️',
      description: item.weather[0].description,
      windSpeed: Math.round(item.wind.speed * 3.6), // m/s to km/h
      humidity: item.main.humidity,
      rainProbability: Math.round((item.pop || 0) * 100),
    });
  }

  const result: DayWeather[] = [];
  let index = 0;

  for (const [dateKey, slots] of dayMap.entries()) {
    if (index >= 4) break; // Max 4 days

    // Sort slots by hour
    slots.sort((a, b) => a.hour - b.hour);

    const date = new Date(dateKey);
    result.push({
      date,
      dateLabel: formatDateLabel(date, index),
      slots,
      avgHumidity: Math.round(slots.reduce((a, b) => a + b.humidity, 0) / slots.length),
      maxRainProbability: Math.max(...slots.map(s => s.rainProbability)),
    });

    index++;
  }

  return result;
};

const generateMockWeather = (): DayWeather[] => {
  const result: DayWeather[] = [];
  const baseTemp = 25 + Math.random() * 5;

  for (let i = 0; i < 4; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    result.push({
      date,
      dateLabel: formatDateLabel(date, i),
      slots: [
        { time: '8am', hour: 8, temp: Math.round(baseTemp - 3), icon: '🌤️', description: 'อากาศดี', windSpeed: 8, humidity: 70, rainProbability: 10 },
        { time: '12pm', hour: 12, temp: Math.round(baseTemp + 5), icon: '☀️', description: 'แดดจัด', windSpeed: 12, humidity: 55, rainProbability: 15 },
        { time: '6pm', hour: 18, temp: Math.round(baseTemp + 2), icon: '🌅', description: 'อากาศดี', windSpeed: 10, humidity: 60, rainProbability: 20 },
        { time: '9pm', hour: 21, temp: Math.round(baseTemp - 2), icon: '🌙', description: 'อากาศเย็น', windSpeed: 6, humidity: 75, rainProbability: 5 },
      ],
      avgHumidity: 65,
      maxRainProbability: 20,
    });
  }

  return result;
};
