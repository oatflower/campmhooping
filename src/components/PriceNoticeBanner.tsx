import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PriceNoticeBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-background">
      <Tag className="w-4 h-4 text-pink-500" />
      <span className="text-sm text-foreground">
        {t('campList.pricesIncludeAllFees')}
      </span>
    </div>
  );
};

export default PriceNoticeBanner;
