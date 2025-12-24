import { Camp } from '@/types/camp';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FavoriteButton from '@/components/FavoriteButton';
import WeatherDisplay from '@/components/WeatherDisplay';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CampCardProps {
  camp: Camp;
  index?: number;
  onHover?: (campId: string | null) => void;
  isHighlighted?: boolean;
  variant?: 'grid' | 'list';
  checkIn?: Date;
  checkOut?: Date;
}

const CampCard = ({
  camp,
  index = 0,
  onHover,
  isHighlighted,
  variant = 'grid',
  checkIn,
  checkOut
}: CampCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const images = camp.images && camp.images.length > 0 ? camp.images : [camp.image];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setImageError(false);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setImageError(false);
  };

  // Calculate nights for price display
  const getNights = () => {
    if (checkIn && checkOut && checkOut > checkIn) {
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(nights, 1); // Ensure at least 1 night
    }
    return 2; // Default to 2 nights
  };

  const nights = getNights();
  const totalPrice = camp.pricePerNight * nights;

  // Format date range
  const getDateRange = () => {
    if (checkIn && checkOut) {
      return `${format(checkIn, 'MMM d')} – ${format(checkOut, 'd')}`;
    }
    return null;
  };

  // Review count (simulated based on rating)
  const reviewCount = Math.floor(camp.rating * 50 + 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={() => onHover?.(camp.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link to={`/camps/${camp.id}`} className="block">
        <div className="card-camp group cursor-pointer">
          {/* Image Carousel */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl group/image bg-muted">
            {!imageError ? (
              <img
                src={images[currentImageIndex]}
                alt={camp.name}
                className="w-full h-full object-cover transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                <Trophy className="h-16 w-16 mb-2 text-muted-foreground/50" />
                <span className="text-sm font-medium text-muted-foreground/50">No Image</span>
              </div>
            )}

            {/* Navigation Arrows - show on hover (desktop only) */}
            {images.length > 1 && !imageError && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 shadow-md items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-background hover:scale-110 hidden md:flex"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 shadow-md items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-background hover:scale-110 hidden md:flex"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {images.length > 1 && !imageError && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      idx === currentImageIndex
                        ? "bg-background w-2"
                        : "bg-background/60"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Guest Favorite Badge - Airbnb style with trophy */}
            {camp.isPopular && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-background text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm border-0 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>{t('campList.guestFavorite')}</span>
                </Badge>
              </div>
            )}

            {/* Favorite Button - Airbnb style with white circle */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <FavoriteButton campId={camp.id} size="sm" className="[&>svg]:w-4 [&>svg]:h-4" />
              </div>
            </div>
          </div>

          {/* Content - Mobile optimized */}
          <div className="pt-2 md:pt-3 space-y-0.5 md:space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm md:text-[15px] leading-tight line-clamp-1">
                {camp.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-foreground text-foreground" />
                <span className="text-xs md:text-sm font-medium">
                  {camp.rating}
                  <span className="text-muted-foreground font-normal"> ({reviewCount})</span>
                </span>
              </div>
            </div>

            {/* Location - Property type style */}
            <div className="text-muted-foreground text-xs md:text-sm">
              <span className="line-clamp-1">{camp.accommodationType === 'dome' ? t('accommodation.dome') : t('accommodation.tent')} • {camp.location}, {camp.province}</span>
            </div>

            {/* Date Range - if available */}
            {getDateRange() && (
              <p className="text-muted-foreground text-xs md:text-sm">
                {getDateRange()}
              </p>
            )}

            {/* Price - Airbnb style with total */}
            <div className="pt-1">
              <span className="font-semibold text-foreground text-sm md:text-base">
                {formatPrice(totalPrice)}
              </span>
              <span className="text-muted-foreground text-xs md:text-sm">
                {' '}{t('campList.forNights', { count: nights })}
              </span>
            </div>

            {/* Highlights - Hidden on mobile for cleaner look */}
            <div className="hidden md:flex flex-wrap gap-1.5 pt-1">
              {camp.highlights.slice(0, 3).map((highlight, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full transition-colors hover:bg-primary hover:text-primary-foreground cursor-default"
                >
                  {highlight}
                </span>
              ))}
            </div>

            {/* Weather Display - Below highlights */}
            <WeatherDisplay
              lat={camp.coordinates.lat}
              lng={camp.coordinates.lng}
              checkIn={checkIn}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CampCard;