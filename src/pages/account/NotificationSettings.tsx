import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface NotificationPreferences {
    offers_updates: boolean;
    account_activity: boolean;
}

const NotificationSettings = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        offers_updates: true,
        account_activity: true,
    });

    // Fetch notification preferences on mount
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('notification_preferences')
                    .eq('id', user.id)
                    .single();

                if (!error && data?.notification_preferences) {
                    setPreferences(data.notification_preferences as NotificationPreferences);
                }
            } catch (error) {
                console.log('Could not fetch notification preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, [user]);

    // Save preferences to Supabase
    const savePreferences = async (newPreferences: NotificationPreferences) => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    notification_preferences: newPreferences,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) {
                console.error('Error saving preferences:', error);
                toast.error(t('account.saveFailed', 'Failed to save preferences'));
            } else {
                toast.success(t('account.preferencesSaved', 'Preferences saved'));
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = (key: keyof NotificationPreferences) => (checked: boolean) => {
        const newPreferences = { ...preferences, [key]: checked };
        setPreferences(newPreferences);
        savePreferences(newPreferences);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                        checked={preferences.offers_updates}
                        onCheckedChange={handleToggle('offers_updates')}
                        disabled={isSaving}
                    />
                </div>

                {/* Account Activity Toggle */}
                <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="space-y-1">
                        <Label htmlFor="account-activity" className="text-base font-medium cursor-pointer">
                            {t('account.accountActivity', 'Account activity')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {t('account.accountActivityDesc', 'Receive updates about your bookings and account security')}
                        </p>
                    </div>
                    <Switch
                        id="account-activity"
                        checked={preferences.account_activity}
                        onCheckedChange={handleToggle('account_activity')}
                        disabled={isSaving}
                    />
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
