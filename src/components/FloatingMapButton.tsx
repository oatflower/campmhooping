import { Map, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface FloatingMapButtonProps {
  viewMode: 'list' | 'map';
  onToggle: () => void;
}

const FloatingMapButton = ({ viewMode, onToggle }: FloatingMapButtonProps) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-5 py-3",
        "bg-foreground text-background",
        "rounded-full shadow-lg",
        "font-medium text-sm",
        "hover:scale-105 active:scale-95 transition-transform",
        "md:hidden"
      )}
    >
      {viewMode === 'list' ? (
        <>
          <span>{t('campList.map')}</span>
          <Map className="w-4 h-4" />
        </>
      ) : (
        <>
          <span>{t('campList.list')}</span>
          <List className="w-4 h-4" />
        </>
      )}
    </button>
  );
};

export default FloatingMapButton;
