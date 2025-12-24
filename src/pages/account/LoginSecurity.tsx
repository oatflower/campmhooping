import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

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
    onConnect?: () => void;
}

const SocialAccountRow = ({ icon, name, connected, onConnect }: SocialAccountRowProps) => (
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
        <Button variant="link" className="text-primary font-medium" onClick={onConnect}>
            {connected ? 'Disconnect' : 'Connect'}
        </Button>
    </div>
);

const LoginSecurity = () => {
    const { t } = useTranslation();

    const handleSocialConnect = (provider: string) => {
        toast.info(`${provider} login จะพร้อมใช้งานเร็วๆ นี้`);
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
                        description={t('account.passwordDesc', 'Last updated 30 days ago')}
                        action={t('account.update', 'Update')}
                        onAction={() => { }}
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
                        connected={false}
                        onConnect={() => handleSocialConnect('Google')}
                    />
                    <SocialAccountRow
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        }
                        name="Facebook"
                        connected={false}
                        onConnect={() => handleSocialConnect('Facebook')}
                    />
                    <SocialAccountRow
                        icon={
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                        }
                        name="Apple"
                        connected={false}
                        onConnect={() => handleSocialConnect('Apple')}
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
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => toast.success('Account deletion scheduled')}
                                >
                                    {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
};

export default LoginSecurity;
