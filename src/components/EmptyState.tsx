import { motion } from 'framer-motion';
import { LucideIcon, Tent, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  type: 'favorites' | 'search' | 'camps';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const emptyStateConfig = {
  favorites: {
    icon: Heart,
    titleKey: 'emptyStates.favoritesTitle',
    descKey: 'emptyStates.favoritesDesc',
    actionKey: 'emptyStates.favoritesAction',
    actionHref: '/camps',
  },
  search: {
    icon: Search,
    titleKey: 'emptyStates.searchTitle',
    descKey: 'emptyStates.searchDesc',
    actionKey: 'emptyStates.searchAction',
    actionHref: '/',
  },
  camps: {
    icon: Tent,
    titleKey: 'emptyStates.campsTitle',
    descKey: 'emptyStates.campsDesc',
    actionKey: 'emptyStates.campsAction',
    actionHref: '/',
  },
};

const EmptyState = ({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) => {
  const { t } = useTranslation();
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center"
        >
          <Tent className="w-4 h-4 text-forest" />
        </motion.div>
      </motion.div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title || t(config.titleKey)}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description || t(config.descKey)}
      </p>

      {onAction ? (
        <Button variant="forest" onClick={onAction}>
          {actionLabel || t(config.actionKey)}
        </Button>
      ) : (
        <Link to={actionHref || config.actionHref}>
          <Button variant="forest">
            {actionLabel || t(config.actionKey)}
          </Button>
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
