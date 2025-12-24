import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, Locale } from 'date-fns';
import { th, enUS, zhCN, ko, ja, de, fr } from 'date-fns/locale';
import { GuestState } from '@/components/search/WhoDropdown';

const localeMap: Record<string, Locale> = {
  th,
  en: enUS,
  zh: zhCN,
  ko,
  ja,
  de,
  fr,
};

interface MobilePillSearchProps {
  onClick: () => void;
  location?: string | null;
  checkIn?: Date;
  checkOut?: Date;
  guests?: GuestState;
}

const MobilePillSearch = ({ 
  onClick, 
  location, 
  checkIn, 
  checkOut, 
  guests 
}: MobilePillSearchProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = localeMap[i18n.language.split('-')[0]] || th;

  const getDisplayText = () => {
    if (location) return location;
    return t('search.startSearch');
  };

  const getSubText = () => {
    const parts: string[] = [];
    
    if (checkIn && checkOut) {
      parts.push(`${format(checkIn, 'd MMM', { locale: currentLocale })} - ${format(checkOut, 'd MMM', { locale: currentLocale })}`);
    } else {
      parts.push(t('search.anytime'));
    }
    
    if (guests) {
      const total = guests.adults + guests.children;
      if (total > 0) {
        parts.push(`${total} ${t('common.persons')}`);
      } else {
        parts.push(t('search.addGuests'));
      }
    }
    
    return parts.join(' • ');
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-card border border-border rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-rose-500 flex items-center justify-center flex-shrink-0">
        <Search className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{getDisplayText()}</p>
        <p className="text-xs text-muted-foreground truncate">{getSubText()}</p>
      </div>
    </button>
  );
};

export default MobilePillSearch;
