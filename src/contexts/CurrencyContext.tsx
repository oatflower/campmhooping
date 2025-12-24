import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatPrice, formatPriceRange, getCurrencyInfo, convertCurrency } from '@/utils/currency';

export type CurrencyCode = 'THB' | 'USD' | 'EUR' | 'CNY' | 'JPY' | 'KRW';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountTHB: number, options?: { showDecimals?: boolean; compact?: boolean }) => string;
  formatPriceRange: (minTHB: number, maxTHB: number) => string;
  convertPrice: (amountTHB: number) => number;
  currencyInfo: {
    code: string;
    symbol: string;
    rate: number;
    locale: string;
  };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as CurrencyCode) || 'THB';
  });

  // Sync with localStorage (cross-tab and same-tab via custom event)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== currency) {
        setCurrencyState(saved as CurrencyCode);
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen for same-tab changes via custom event
    window.addEventListener('currencyChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currencyChange', handleStorageChange);
    };
  }, [currency]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new Event('currencyChange'));
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatPrice: (amountTHB, options) => formatPrice(amountTHB, currency, options),
    formatPriceRange: (minTHB, maxTHB) => formatPriceRange(minTHB, maxTHB, currency),
    convertPrice: (amountTHB) => convertCurrency(amountTHB, currency),
    currencyInfo: getCurrencyInfo(currency),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
