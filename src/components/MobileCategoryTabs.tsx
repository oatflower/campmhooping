import { Tent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileCategoryTabs = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center px-4 py-2 bg-background">
      <div className="flex flex-col items-center gap-0.5 px-4 py-1.5 relative text-foreground">
        <Tent className="w-5 h-5" strokeWidth={2} />
        <span className="text-[11px] font-medium">{t('nav.escape')}</span>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
      </div>
    </div>
  );
};

export default MobileCategoryTabs;
