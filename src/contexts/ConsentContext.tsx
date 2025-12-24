import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface ConsentPreferences {
  essential: boolean; // Always true, required for site operation
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface ConsentRecord {
  preferences: ConsentPreferences;
  timestamp: string;
  version: string;
  ipAddress?: string;
}

interface ConsentContextType {
  consent: ConsentPreferences | null;
  hasConsented: boolean;
  isConsentBannerVisible: boolean;
  showConsentBanner: () => void;
  hideConsentBanner: () => void;
  updateConsent: (preferences: Partial<ConsentPreferences>) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  getConsentHistory: () => ConsentRecord[];
  withdrawConsent: (type: keyof Omit<ConsentPreferences, 'essential'>) => void;
}

const CONSENT_STORAGE_KEY = 'campii_consent';
const CONSENT_HISTORY_KEY = 'campii_consent_history';
const CONSENT_VERSION = '1.0';

const defaultConsent: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isConsentBannerVisible, setIsConsentBannerVisible] = useState(false);

  // Load consent from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: ConsentRecord = JSON.parse(stored);
        setConsent(parsed.preferences);
        setHasConsented(true);
        setIsConsentBannerVisible(false);
      } catch (e) {
        console.error('Failed to parse consent data', e);
        setIsConsentBannerVisible(true);
      }
    } else {
      // No consent given yet, show banner
      setIsConsentBannerVisible(true);
    }
  }, []);

  const saveConsent = useCallback((preferences: ConsentPreferences) => {
    const record: ConsentRecord = {
      preferences,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    // Save current consent
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));

    // Add to consent history for audit trail
    const historyStr = localStorage.getItem(CONSENT_HISTORY_KEY);
    const history: ConsentRecord[] = historyStr ? JSON.parse(historyStr) : [];
    history.push(record);
    localStorage.setItem(CONSENT_HISTORY_KEY, JSON.stringify(history));

    setConsent(preferences);
    setHasConsented(true);
    setIsConsentBannerVisible(false);
  }, []);

  const updateConsent = useCallback((preferences: Partial<ConsentPreferences>) => {
    const newConsent: ConsentPreferences = {
      ...defaultConsent,
      ...consent,
      ...preferences,
      essential: true, // Always required
    };
    saveConsent(newConsent);
  }, [consent, saveConsent]);

  const acceptAll = useCallback(() => {
    const fullConsent: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    saveConsent(fullConsent);
  }, [saveConsent]);

  const rejectOptional = useCallback(() => {
    const minimalConsent: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    saveConsent(minimalConsent);
  }, [saveConsent]);

  const withdrawConsent = useCallback((type: keyof Omit<ConsentPreferences, 'essential'>) => {
    if (consent) {
      const newConsent: ConsentPreferences = {
        ...consent,
        [type]: false,
      };
      saveConsent(newConsent);
    }
  }, [consent, saveConsent]);

  const getConsentHistory = useCallback((): ConsentRecord[] => {
    const historyStr = localStorage.getItem(CONSENT_HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  }, []);

  const showConsentBanner = useCallback(() => {
    setIsConsentBannerVisible(true);
  }, []);

  const hideConsentBanner = useCallback(() => {
    setIsConsentBannerVisible(false);
  }, []);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasConsented,
        isConsentBannerVisible,
        showConsentBanner,
        hideConsentBanner,
        updateConsent,
        acceptAll,
        rejectOptional,
        getConsentHistory,
        withdrawConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
