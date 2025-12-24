import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationSettings = () => {
    const { t } = useTranslation();
    const [offersUpdates, setOffersUpdates] = useState(true);
    const [accountActivity, setAccountActivity] = useState(true);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">{t('account.notificationsTitle', 'Notifications')}</h2>

            <div className="space-y-6">
                {/* Offers and Updates Toggle */}
                <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="space-y-1">
                        <Label htmlFor="offers-updates" className="text-base font-medium cursor-pointer">
                            {t('account.offersUpdates', 'Offers and updates')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {t('account.offersUpdatesDesc', 'Receive promotions, special offers, and travel inspiration')}
                        </p>
                    </div>
                    <Switch
                        id="offers-updates"
                        checked={offersUpdates}
                        onCheckedChange={setOffersUpdates}
                    />
                </div>

                {/* Account Activity Toggle */}
                <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="space-y-1">
                        <Label htmlFor="account-activity" className="text-base font-medium cursor-pointer">
                            {t('account.accountActivity', 'Account activity')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {t('account.accountActivityDesc', 'Receive updates about your bookings aand account security')}
                        </p>
                    </div>
                    <Switch
                        id="account-activity"
                        checked={accountActivity}
                        onCheckedChange={setAccountActivity}
                    />
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
