import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Phone, MapPin, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();

  const updateContact = (field: keyof typeof onboardingData.contact, value: string | boolean) => {
    updateOnboardingData({
      contact: {
        ...onboardingData.contact,
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    if (onboardingData.contact.phone) {
      setCurrentPage(24);
      navigate('/host/onboarding/review');
    }
  };

  const handleBack = () => {
    setCurrentPage(22);
    navigate('/host/onboarding/discounts');
  };

  const isPhoneValid = /^[0-9]{9,10}$/.test(onboardingData.contact.phone.replace(/[- ]/g, ''));

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 3, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.contact.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.contact.subtitle')}
          </p>

          {/* Contact Form */}
          <div className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('onboarding.contact.phone')} *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('onboarding.contact.phonePlaceholder')}
                value={onboardingData.contact.phone}
                onChange={(e) => updateContact('phone', e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                {t('onboarding.contact.phoneNote')}
              </p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('onboarding.contact.address')}
              </Label>
              <Input
                id="address"
                placeholder={t('onboarding.contact.addressPlaceholder')}
                value={onboardingData.contact.address}
                onChange={(e) => updateContact('address', e.target.value)}
                className="h-12"
              />
            </div>

            {/* Business Toggle */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('onboarding.contact.isBusiness')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('onboarding.contact.isBusinessDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={onboardingData.contact.isBusiness}
                  onCheckedChange={(checked) => updateContact('isBusiness', checked)}
                />
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-secondary/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              🔒 {t('onboarding.contact.privacyNote')}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-16 bg-background border-t border-border">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!isPhoneValid}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {t('onboarding.next')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
