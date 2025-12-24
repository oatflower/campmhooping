import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tent, Star, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  labelKey: string;
}

const statsConfig: StatItem[] = [
  { icon: <Tent className="w-5 h-5" />, value: 500, suffix: '+', labelKey: 'stats.campsThailand' },
  { icon: <Star className="w-5 h-5" />, value: 10000, suffix: '+', labelKey: 'stats.realReviews' },
  { icon: <MapPin className="w-5 h-5" />, value: 50, suffix: '+', labelKey: 'stats.provinces' },
  { icon: <Users className="w-5 h-5" />, value: 50000, suffix: '+', labelKey: 'stats.activeCampers' },
];

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsCounter = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-10"
    >
      {statsConfig.map((stat, index) => (
        <motion.div
          key={stat.labelKey}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
          className="flex flex-col items-center text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
        >
          <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-2">
            {stat.icon}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-foreground">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </div>
          <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCounter;
