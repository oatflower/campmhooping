import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GearItem } from '@/data/gear';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

interface GearCardProps {
  item: GearItem;
}

const GearCard = ({ item }: GearCardProps) => {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.nameTh}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.badge && (
          <Badge
            variant={
              item.badge === 'ขายดี'
                ? 'popular'
                : item.badge === 'Premium'
                ? 'dome'
                : 'secondary'
            }
            className="absolute top-3 left-3"
          >
            {item.badge === 'ขายดี' ? t('gear.bestSeller') : item.badge}
          </Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            -{discount}%
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">
          {i18n.language === 'th' ? item.categoryTh : item.categoryEn}
        </p>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {i18n.language === 'th' ? item.nameTh : item.nameEn}
        </h3>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.features.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-sunrise text-sunrise" />
          <span className="text-sm font-medium">{item.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({item.reviewCount} {t('gear.reviews')})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-forest">
            {formatPrice(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(item.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GearCard;
