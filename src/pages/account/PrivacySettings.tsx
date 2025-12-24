import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/contexts/ConsentContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Shield,
    Download,
    Trash2,
    Clock,
    FileText,
    AlertTriangle,
} from 'lucide-react';

interface ToggleRowProps {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

const ToggleRow = ({ label, description, checked, onCheckedChange, disabled }: ToggleRowProps) => (
    <div className="flex items-center justify-between py-4">
        <div className="flex-1 pr-4">
            <p className="font-medium">{label}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
);

const PrivacySettings = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user, logout } = useAuth();
    const { consent, updateConsent, showConsentBanner, getConsentHistory } = useConsent();

    const [settings, setSettings] = useState({
        readReceipts: true,
        listingsInSearch: true,
        showCity: true,
        showTripType: false,
        showLengthOfStay: true,
        showBookedServices: false,
    });

    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const updateSetting = (key: keyof typeof settings) => (checked: boolean) => {
        setSettings((prev) => ({ ...prev, [key]: checked }));
    };

    // Handle data export request
    const handleExportData = async () => {
        if (!user) return;

        setIsExporting(true);
        try {
            // Create export request in database
            const { error: requestError } = await supabase
                .from('data_export_requests')
                .insert({
                    user_id: user.id,
                    status: 'pending',
                    format: 'json',
                });

            if (requestError) throw requestError;

            // Fetch user data for immediate download
            const [profileRes, bookingsRes, favoritesRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('bookings').select('*').eq('user_id', user.id),
                supabase.from('favorites').select('*').eq('user_id', user.id),
            ]);

            const exportData = {
                exportDate: new Date().toISOString(),
                userId: user.id,
                profile: profileRes.data,
                bookings: bookingsRes.data || [],
                favorites: favoritesRes.data || [],
                consentHistory: getConsentHistory(),
                localData: {
                    favorites: localStorage.getItem('camp-favorites'),
                    recentlyViewed: localStorage.getItem('recently_viewed_camps'),
                },
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campii-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Log the export
            await supabase.from('data_access_log').insert({
                user_id: user.id,
                accessed_by: user.id,
                access_type: 'export',
                data_category: 'all',
                reason: 'User data portability request',
            });

            toast({
                title: t('privacy.exportSuccess', 'Data exported successfully'),
                description: t('privacy.exportSuccessDesc', 'Your data has been downloaded as a JSON file.'),
            });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                title: t('privacy.exportError', 'Export failed'),
                description: t('privacy.exportErrorDesc', 'There was an error exporting your data. Please try again.'),
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (!user || deleteConfirmation !== 'DELETE') return;

        setIsDeleting(true);
        try {
            // Schedule deletion (soft delete)
            const { error } = await supabase
                .from('profiles')
                .update({
                    deletion_requested_at: new Date().toISOString(),
                    deletion_scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    deletion_reason: 'User requested account deletion',
                })
                .eq('id', user.id);

            if (error) throw error;

            // Log the deletion request
            await supabase.from('data_access_log').insert({
                user_id: user.id,
                accessed_by: user.id,
                access_type: 'delete',
                data_category: 'all',
                reason: 'Account deletion requested',
            });

            toast({
                title: t('privacy.deleteScheduled', 'Account deletion scheduled'),
                description: t('privacy.deleteScheduledDesc', 'Your account will be permanently deleted in 30 days. You can cancel this in your account settings.'),
            });

            // Log out the user
            await logout();
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: t('privacy.deleteError', 'Deletion failed'),
                description: t('privacy.deleteErrorDesc', 'There was an error processing your request. Please try again.'),
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Clear local storage data
    const handleClearLocalData = () => {
        localStorage.removeItem('camp-favorites');
        localStorage.removeItem('recently_viewed_camps');
        localStorage.removeItem('searchCriteria');
        toast({
            title: t('privacy.localDataCleared', 'Local data cleared'),
            description: t('privacy.localDataClearedDesc', 'Your browsing data has been removed from this device.'),
        });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6">{t('account.privacyTitle', 'Privacy')}</h2>

            {/* PDPA Consent Management */}
            <section className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">{t('privacy.consentManagement', 'Consent Management')}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    {t('privacy.consentDesc', 'Manage how we use your data. You can withdraw consent at any time.')}
                </p>

                <div className="space-y-2 divide-y divide-border">
                    <ToggleRow
                        label={t('privacy.essential', 'Essential Services')}
                        description={t('privacy.essentialDesc', 'Required for the platform to function. Cannot be disabled.')}
                        checked={true}
                        onCheckedChange={() => { }}
                        disabled
                    />
                    <ToggleRow
                        label={t('privacy.analytics', 'Analytics')}
                        description={t('privacy.analyticsDesc', 'Help us improve by analyzing usage patterns. Data is anonymized.')}
                        checked={consent?.analytics ?? false}
                        onCheckedChange={(checked) => updateConsent({ analytics: checked })}
                    />
                    <ToggleRow
                        label={t('privacy.marketing', 'Marketing Communications')}
                        description={t('privacy.marketingDesc', 'Receive personalized offers and promotions.')}
                        checked={consent?.marketing ?? false}
                        onCheckedChange={(checked) => updateConsent({ marketing: checked })}
                    />
                    <ToggleRow
                        label={t('privacy.personalization', 'Personalization')}
                        description={t('privacy.personalizationDesc', 'Get recommendations based on your preferences.')}
                        checked={consent?.personalization ?? false}
                        onCheckedChange={(checked) => updateConsent({ personalization: checked })}
                    />
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={showConsentBanner}
                >
                    {t('privacy.reviewConsent', 'Review All Consent Options')}
                </Button>
            </section>

            {/* Your Rights (PDPA) */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">{t('privacy.yourRights', 'Your Rights')}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    {t('privacy.yourRightsDesc', 'Under PDPA, you have the right to access, correct, delete, and export your personal data.')}
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Data Export */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="h-4 w-4" />
                            <h4 className="font-medium">{t('privacy.exportData', 'Export Your Data')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('privacy.exportDataDesc', 'Download a copy of all your personal data in JSON format.')}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportData}
                            disabled={isExporting}
                        >
                            {isExporting ? t('privacy.exporting', 'Exporting...') : t('privacy.downloadData', 'Download My Data')}
                        </Button>
                    </div>

                    {/* Clear Local Data */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4" />
                            <h4 className="font-medium">{t('privacy.clearLocalData', 'Clear Browsing Data')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('privacy.clearLocalDataDesc', 'Remove favorites, recently viewed, and search history from this device.')}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearLocalData}
                        >
                            {t('privacy.clearData', 'Clear Local Data')}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Read Receipts */}
            <section>
                <h3 className="text-lg font-medium mb-2">{t('account.readReceipts', 'Read receipts')}</h3>
                <ToggleRow
                    label={t('account.showReadReceipts', "Show people when I've read their messages")}
                    description={t('account.learnMore', 'Learn more')}
                    checked={settings.readReceipts}
                    onCheckedChange={updateSetting('readReceipts')}
                />
            </section>

            {/* Listings */}
            <section>
                <h3 className="text-lg font-medium mb-2">{t('account.listings', 'Listings')}</h3>
                <ToggleRow
                    label={t('account.includeInSearch', 'Include my listing(s) in search engines')}
                    description={t('account.includeInSearchDesc', 'Turning this on means search engines, like Google, will display your listing page(s) in search results.')}
                    checked={settings.listingsInSearch}
                    onCheckedChange={updateSetting('listingsInSearch')}
                />
            </section>

            {/* Reviews */}
            <section>
                <h3 className="text-lg font-medium mb-2">{t('account.reviews', 'Reviews')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {t('account.reviewsDesc', "Choose what's shared when you write a review.")}
                </p>
                <div className="space-y-2 divide-y divide-border">
                    <ToggleRow
                        label={t('account.showCity', 'Show my home city and country')}
                        description={t('account.exCityCountry', 'Ex: City and country')}
                        checked={settings.showCity}
                        onCheckedChange={updateSetting('showCity')}
                    />
                    <ToggleRow
                        label={t('account.showTripType', 'Show my trip type')}
                        description={t('account.exTripType', 'Ex: Stayed with kids or pets')}
                        checked={settings.showTripType}
                        onCheckedChange={updateSetting('showTripType')}
                    />
                    <ToggleRow
                        label={t('account.showLengthOfStay', 'Show my length of stay')}
                        description={t('account.exLengthOfStay', 'Ex: A few nights, about a week, etc.')}
                        checked={settings.showLengthOfStay}
                        onCheckedChange={updateSetting('showLengthOfStay')}
                    />
                    <ToggleRow
                        label={t('account.showBookedServices', 'Show my booked services')}
                        description={t('account.exBookedServices', 'Ex: Gourmet brunch or tasting menu')}
                        checked={settings.showBookedServices}
                        onCheckedChange={updateSetting('showBookedServices')}
                    />
                </div>
            </section>

            {/* Danger Zone - Account Deletion */}
            <section className="border border-destructive/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-medium text-destructive">{t('privacy.dangerZone', 'Danger Zone')}</h3>
                </div>

                <div className="flex items-start gap-4">
                    <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium">{t('privacy.deleteAccount', 'Delete Account')}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('privacy.deleteAccountDesc', 'Permanently delete your account and all associated data. This action cannot be undone. Your data will be deleted after a 30-day grace period.')}
                        </p>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    {t('privacy.deleteMyAccount', 'Delete My Account')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('privacy.confirmDelete', 'Are you absolutely sure?')}</AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-3">
                                        <p>
                                            {t('privacy.confirmDeleteDesc', 'This action will schedule your account for permanent deletion. After 30 days:')}
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            <li>{t('privacy.deleteItem1', 'Your profile and personal information will be deleted')}</li>
                                            <li>{t('privacy.deleteItem2', 'Your booking history will be anonymized')}</li>
                                            <li>{t('privacy.deleteItem3', 'Your messages will be removed')}</li>
                                            <li>{t('privacy.deleteItem4', 'Your reviews will be anonymized')}</li>
                                        </ul>
                                        <p className="font-medium pt-2">
                                            {t('privacy.typeDelete', 'Type DELETE to confirm:')}
                                        </p>
                                        <input
                                            type="text"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="DELETE"
                                        />
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                                        {t('common.cancel', 'Cancel')}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeleting ? t('privacy.deleting', 'Deleting...') : t('privacy.confirmDeleteBtn', 'Delete Account')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacySettings;
