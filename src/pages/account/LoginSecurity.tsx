import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SettingRowProps {
    label: string;
    description?: string;
    action?: string;
    onAction?: () => void;
}

const SettingRow = ({ label, description, action = 'Update', onAction }: SettingRowProps) => (
    <div className="flex items-center justify-between py-6 border-b border-border last:border-0">
        <div>
            <p className="font-medium">{label}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {onAction && (
            <Button variant="link" className="text-primary font-medium" onClick={onAction}>
                {action}
            </Button>
        )}
    </div>
);

interface SocialAccountRowProps {
    icon: React.ReactNode;
    name: string;
    connected: boolean;
    loading?: boolean;
    onConnect?: () => void;
}

const SocialAccountRow = ({ icon, name, connected, loading, onConnect }: SocialAccountRowProps) => (
    <div className="flex items-center justify-between py-6 border-b border-border last:border-0">
        <div className="flex items-center gap-3">
            {icon}
            <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">
                    {connected ? 'Connected' : 'Not connected'}
                </p>
            </div>
        </div>
        <Button
            variant="link"
            className="text-primary font-medium"
            onClick={onConnect}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                connected ? 'Disconnect' : 'Connect'
            )}
        </Button>
    </div>
);

const LoginSecurity = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    // Fetch connected providers
    useEffect(() => {
        const fetchIdentities = async () => {
            if (!user) return;

            const { data } = await supabase.auth.getUserIdentities();
            if (data?.identities) {
                setConnectedProviders(data.identities.map(i => i.provider));
            }
        };

        fetchIdentities();
    }, [user]);

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmPassword) {
            toast.error(t('account.passwordMismatch', 'Passwords do not match'));
            return;
        }

        if (newPassword.length < 6) {
            toast.error(t('account.passwordTooShort', 'Password must be at least 6 characters'));
            return;
        }

        setIsUpdatingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            toast.success(t('account.passwordUpdated', 'Password updated successfully'));
            setShowPasswordDialog(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password update error:', error);
            toast.error(t('account.passwordUpdateFailed', 'Failed to update password'));
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleSocialConnect = async (provider: 'google' | 'facebook' | 'apple') => {
        const isConnected = connectedProviders.includes(provider);

        if (isConnected) {
            // Unlink provider
            setLoadingProvider(provider);
            try {
                const { data } = await supabase.auth.getUserIdentities();
                const identity = data?.identities?.find(i => i.provider === provider);

                if (identity) {
                    const { error } = await supabase.auth.unlinkIdentity(identity);
                    if (error) throw error;

                    setConnectedProviders(prev => prev.filter(p => p !== provider));
                    toast.success(t('account.disconnected', `${provider} disconnected`));
                }
            } catch (error) {
                console.error('Unlink error:', error);
                toast.error(t('account.disconnectFailed', 'Failed to disconnect account'));
            } finally {
                setLoadingProvider(null);
            }
        } else {
            // Link provider
            setLoadingProvider(provider);
            try {
                const { error } = await supabase.auth.linkIdentity({
                    provider,
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) {
                    if (error.message.includes('not supported')) {
                        toast.info(t('account.comingSoon', `${provider} login will be available soon`));
                    } else {
                        throw error;
                    }
                }
            } catch (error) {
                console.error('Link error:', error);
                toast.error(t('account.connectFailed', 'Failed to connect account'));
            } finally {
                setLoadingProvider(null);
            }
        }
    };

    const handleDeleteAccount = async () => {
        try {
            // In production, you would call a backend function to handle account deletion
            // This typically involves:
            // 1. Deleting user data from all tables
            // 2. Cancelling any active subscriptions
            // 3. Sending confirmation email
            // 4. Deleting the auth user

            toast.success(t('account.deletionScheduled', 'Account deletion has been scheduled. You will receive a confirmation email.'));
        } catch (error) {
            console.error('Delete account error:', error);
            toast.error(t('account.deletionFailed', 'Failed to schedule account deletion'));
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">{t('account.loginSecurityTitle', 'Login & security')}</h2>

            {/* Login Section */}
            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">{t('account.login', 'Login')}</h3>
                <div className="divide-y divide-border">
                    <SettingRow
                        label={t('account.password', 'Password')}
                        description={t('account.passwordDesc', 'Secure your account with a strong password')}
                        action={t('account.update', 'Update')}
                        onAction={() => setShowPasswordDialog(true)}
                    />
                </div>
            </div>

            {/* Social Accounts Section */}
            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">{t('account.socialAccounts', 'Social accounts')}</h3>
                <div className="divide-y divide-border">
                    <SocialAccountRow
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        }
                        name="Google"
                        connected={connectedProviders.includes('google')}
                        loading={loadingProvider === 'google'}
                        onConnect={() => handleSocialConnect('google')}
                    />
                    <SocialAccountRow
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        }
                        name="Facebook"
                        connected={connectedProviders.includes('facebook')}
                        loading={loadingProvider === 'facebook'}
                        onConnect={() => handleSocialConnect('facebook')}
                    />
                    <SocialAccountRow
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                        }
                        name="Apple"
                        connected={connectedProviders.includes('apple')}
                        loading={loadingProvider === 'apple'}
                        onConnect={() => handleSocialConnect('apple')}
                    />
                </div>
            </div>

            {/* Data Privacy Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">{t('account.dataPrivacy', 'Data privacy')}</h3>
                <div className="space-y-3">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/10">
                                {t('account.deleteAccount', 'Delete my account')}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('account.deleteAccount', 'Delete my account')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('account.deleteAccountDesc', 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDeleteAccount}
                                >
                                    {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Password Update Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('account.updatePassword', 'Update password')}</DialogTitle>
                        <DialogDescription>
                            {t('account.updatePasswordDesc', 'Enter your new password below')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">{t('account.newPassword', 'New password')}</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">{t('account.confirmPassword', 'Confirm password')}</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={handlePasswordUpdate}
                            disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('common.updating', 'Updating...')}
                                </>
                            ) : (
                                t('account.updatePassword', 'Update password')
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LoginSecurity;
