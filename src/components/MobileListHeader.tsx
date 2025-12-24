import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MobileListHeaderProps {
  location?: string | null;
  checkIn?: Date;
  checkOut?: Date;
  guestCount?: number;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
}

const MobileListHeader = ({
  location,
  checkIn,
  checkOut,
  guestCount = 1,
  onSearchClick,
  onFilterClick,
}: MobileListHeaderProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'th' ? th : enUS;

  const formatDateRange = () => {
    if (checkIn && checkOut) {
      return `${format(checkIn, 'd MMM', { locale })} - ${format(checkOut, 'd MMM', { locale })}`;
    }
    return t('search.anytime');
  };

  const getGuestText = () => {
    if (guestCount === 1) return `1 ${t('common.person')}`;
    return `${guestCount} ${t('common.persons')}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border md:hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      {/* Search Pill */}
      <button
        onClick={onSearchClick}
        className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-background border border-border rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground truncate">
            {location || t('search.anywhere')}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateRange()} • {getGuestText()}
          </p>
        </div>
      </button>

      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-full border border-border",
          "hover:bg-muted transition-colors"
        )}
      >
        <SlidersHorizontal className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default MobileListHeader;
