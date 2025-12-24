import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useConsent, ConsentPreferences } from '@/contexts/ConsentContext';
import { Shield, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConsentBanner = () => {
  const { t } = useTranslation();
  const { isConsentBannerVisible, acceptAll, rejectOptional, updateConsent, hideConsentBanner } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [customPreferences, setCustomPreferences] = useState<Omit<ConsentPreferences, 'essential'>>({
    analytics: false,
    marketing: false,
    personalization: false,
  });

  if (!isConsentBannerVisible) {
    return null;
  }

  const handleCustomSave = () => {
    updateConsent({
      essential: true,
      ...customPreferences,
    });
  };

  const consentOptions = [
    {
      key: 'analytics' as const,
      label: t('consent.analytics', 'Analytics'),
      description: t('consent.analyticsDesc', 'Help us improve by analyzing how you use our platform. This data is anonymized.'),
    },
    {
      key: 'marketing' as const,
      label: t('consent.marketing', 'Marketing'),
      description: t('consent.marketingDesc', 'Receive personalized offers, promotions, and updates about camping experiences.'),
    },
    {
      key: 'personalization' as const,
      label: t('consent.personalization', 'Personalization'),
      description: t('consent.personalizationDesc', 'Get personalized recommendations based on your browsing history and preferences.'),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        {!showDetails ? (
          // Simple view
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Shield className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">
                  {t('consent.title', 'Your Privacy Matters')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('consent.description', 'We use cookies and similar technologies to provide our services. You can customize your preferences or accept all.')}
                  {' '}
                  <Link to="/privacy" className="underline hover:text-primary">
                    {t('consent.learnMore', 'Learn more')}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                {t('consent.customize', 'Customize')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectOptional}
              >
                {t('consent.rejectOptional', 'Essential Only')}
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
              >
                {t('consent.acceptAll', 'Accept All')}
              </Button>
            </div>
          </div>
        ) : (
          // Detailed view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {t('consent.customizeTitle', 'Customize Privacy Settings')}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Essential - Always on */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1 pr-4">
                  <p className="font-medium">{t('consent.essential', 'Essential')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('consent.essentialDesc', 'Required for the website to function. Cannot be disabled.')}
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              {/* Optional consents */}
              {consentOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 pr-4">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Switch
                    checked={customPreferences[option.key]}
                    onCheckedChange={(checked) =>
                      setCustomPreferences((prev) => ({ ...prev, [option.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {t('consent.pdpaNotice', 'Compliant with Thailand PDPA. You can change preferences anytime in Privacy Settings.')}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button size="sm" onClick={handleCustomSave}>
                  {t('consent.savePreferences', 'Save Preferences')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentBanner;
