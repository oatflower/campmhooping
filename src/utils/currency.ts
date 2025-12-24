// Currency conversion rates (base: THB)
export const exchangeRates: Record<string, number> = {
  THB: 1,
  USD: 0.028,    // 1 THB = 0.028 USD
  EUR: 0.026,    // 1 THB = 0.026 EUR
  CNY: 0.20,     // 1 THB = 0.20 CNY
  JPY: 4.2,      // 1 THB = 4.2 JPY
  KRW: 37.5,     // 1 THB = 37.5 KRW
};

export const currencySymbols: Record<string, string> = {
  THB: '฿',
  USD: '$',
  EUR: '€',
  CNY: '¥',
  JPY: '¥',
  KRW: '₩',
};

export const currencyLocales: Record<string, string> = {
  THB: 'th-TH',
  USD: 'en-US',
  EUR: 'de-DE',
  CNY: 'zh-CN',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
};

// Convert THB to target currency
export const convertCurrency = (amountTHB: number, targetCurrency: string): number => {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountTHB * rate;
};

// Format price with currency symbol and locale
export const formatPrice = (
  amountTHB: number,
  currency: string = 'THB',
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string => {
  const { showDecimals = false, compact = false } = options || {};

  const convertedAmount = convertCurrency(amountTHB, currency);
  const symbol = currencySymbols[currency] || currency;
  const locale = currencyLocales[currency] || 'en-US';

  // Determine decimal places based on currency
  const decimals = currency === 'THB' || currency === 'JPY' || currency === 'KRW'
    ? 0
    : showDecimals ? 2 : 0;

  // Format number
  let formattedNumber: string;

  if (compact && convertedAmount >= 1000) {
    // Compact format: 1.5K, 2.3M
    if (convertedAmount >= 1000000) {
      formattedNumber = (convertedAmount / 1000000).toFixed(1) + 'M';
    } else if (convertedAmount >= 1000) {
      formattedNumber = (convertedAmount / 1000).toFixed(1) + 'K';
    } else {
      formattedNumber = convertedAmount.toFixed(decimals);
    }
  } else {
    formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(convertedAmount);
  }

  // Return formatted price
  return `${symbol}${formattedNumber}`;
};

// Format price range
export const formatPriceRange = (
  minTHB: number,
  maxTHB: number,
  currency: string = 'THB'
): string => {
  const minFormatted = formatPrice(minTHB, currency);
  const maxFormatted = formatPrice(maxTHB, currency);
  return `${minFormatted} - ${maxFormatted}`;
};

// Get currency info
export const getCurrencyInfo = (currency: string) => {
  return {
    code: currency,
    symbol: currencySymbols[currency] || currency,
    rate: exchangeRates[currency] || 1,
    locale: currencyLocales[currency] || 'en-US',
  };
};
