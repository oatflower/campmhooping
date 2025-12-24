import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { clearWeatherCache } from '@/services/weatherService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

const currencies: Currency[] = [
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭' },
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', flag: '🇺🇸' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China', flag: '🇨🇳' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won', country: 'South Korea', flag: '🇰🇷' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'Germany / France', flag: '🇪🇺' },
];

const LanguageCurrencyModal = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'th');
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'THB';
  });

  useEffect(() => {
    // Sync with i18n language
    setSelectedLanguage(i18n.language.split('-')[0]);
  }, [i18n.language]);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    // Clear weather cache to ensure fresh data with new language format
    clearWeatherCache();
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('currency', currencyCode);
  };

  const currentLanguage = languages.find(l => l.code === selectedLanguage);
  const currentCurrency = currencies.find(c => c.code === selectedCurrency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative shrink-0 rounded-xl w-10 h-10 bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600">
          <Globe className="w-5 h-5" />
          <span className="absolute -bottom-1 -right-1 bg-white text-amber-600 text-[10px] font-bold px-1 rounded-full shadow-sm border border-amber-200">
            {selectedLanguage.toUpperCase()}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="language" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="language">{t('settings.language')}</TabsTrigger>
            <TabsTrigger value="currency">{t('settings.currency')}</TabsTrigger>
          </TabsList>

          <TabsContent value="language" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left relative',
                    selectedLanguage === language.code
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-secondary'
                  )}
                >
                  <span className="text-xl shrink-0">{language.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{language.nativeName}</p>
                    <p className="text-xs text-muted-foreground truncate">{language.name}</p>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="currency" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left relative',
                    selectedCurrency === currency.code
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-secondary'
                  )}
                >
                  <span className="text-xl shrink-0">{currency.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {currency.code} <span className="text-muted-foreground font-normal">({currency.symbol})</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{currency.name}</p>
                  </div>
                  {selectedCurrency === currency.code && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Current selection summary */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {currentLanguage?.flag} {currentLanguage?.nativeName} • {currentCurrency?.symbol} {currentCurrency?.code}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageCurrencyModal;
