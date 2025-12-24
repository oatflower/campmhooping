import { motion } from 'framer-motion';
import { Shield, Clock, CreditCard, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const badgeConfig = [
  { icon: <Shield className="w-4 h-4" />, key: 'trustBadges.bestPrice' },
  { icon: <Clock className="w-4 h-4" />, key: 'trustBadges.quickConfirm' },
  { icon: <CreditCard className="w-4 h-4" />, key: 'trustBadges.securePayment' },
  { icon: <HeartHandshake className="w-4 h-4" />, key: 'trustBadges.freeCancel' },
];

const TrustBadges = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="flex flex-wrap justify-center gap-3 mt-8"
    >
      {badgeConfig.map((badge, index) => (
        <motion.div
          key={badge.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/5 border border-forest/20 text-forest text-sm font-medium"
        >
          {badge.icon}
          <span>{t(badge.key)}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TrustBadges;
