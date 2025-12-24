import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface FavoriteButtonProps {
  campId: string;
  className?: string;
  size?: 'sm' | 'default';
}

const FavoriteButton = ({ campId, className, size = 'default' }: FavoriteButtonProps) => {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(campId);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(campId);
    toast.success(isFav ? t('favorites.removed') : t('favorites.added'));
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        "bg-background/80 backdrop-blur-sm hover:bg-background transition-all relative overflow-hidden",
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        className
      )}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            "transition-all",
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
            isFav ? 'fill-destructive text-destructive' : 'text-foreground'
          )}
        />
      </motion.div>
      <AnimatePresence>
        {isAnimating && isFav && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: Math.cos(i * 60 * (Math.PI / 180)) * 20,
                  y: Math.sin(i * 60 * (Math.PI / 180)) * 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute w-1.5 h-1.5 rounded-full bg-destructive"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </Button>
  );
};

export default FavoriteButton;
