import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Shield, Bell, Lock, Globe, Briefcase, CreditCard, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
    { id: 'personal', path: '/account', icon: User, labelKey: 'account.personal' },
    { id: 'login-security', path: '/account/login-security', icon: Lock, labelKey: 'account.loginSecurity' },
    { id: 'privacy', path: '/account/privacy', icon: Shield, labelKey: 'account.privacy' },
    { id: 'notifications', path: '/account/notifications', icon: Bell, labelKey: 'account.notifications' },
    { id: 'payments', path: '/account/payments', icon: CreditCard, labelKey: 'account.payments' },
];

const AccountLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/account') {
            return location.pathname === '/account';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">{t('profile.accountSettings', 'Account settings')}</h1>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="w-full md:w-64 shrink-0">
                            <nav className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                            isActive(item.path)
                                                ? 'bg-secondary font-medium'
                                                : 'hover:bg-secondary/50 text-muted-foreground'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{t(item.labelKey, item.id)}</span>
                                    </Link>
                                ))}
                            </nav>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AccountLayout;
