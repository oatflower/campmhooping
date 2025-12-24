import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Settings, User, CreditCard, Bell, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const accountSections = [
    { id: 'personal', icon: User, labelKey: 'account.personal', path: '/account' },
    { id: 'payments', icon: CreditCard, labelKey: 'account.payments', path: '/account/payments' },
    { id: 'notifications', icon: Bell, labelKey: 'account.notifications', path: '/account/notifications' },
    { id: 'privacy', icon: Shield, labelKey: 'account.privacy', path: '/account/privacy' },
];

const Account = () => {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <Settings className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">{t('profile.accountSettings', 'Account Settings')}</h1>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {accountSections.map((section) => (
                            <Link
                                key={section.id}
                                to={section.path}
                                className="flex items-center gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{t(section.labelKey, section.id)}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t(`${section.labelKey}Desc`, 'Manage your settings')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Account;
