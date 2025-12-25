import { Outlet, Link, useLocation } from 'react-router-dom';
import { Trees, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHost } from '@/contexts/HostContext';
import { useTranslation } from 'react-i18next';
import LanguageCurrencyModal from '@/components/LanguageCurrencyModal';

const HostLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { setHostMode } = useHost();
  const isOnboarding = location.pathname.includes('/host/onboarding');

  const handleSwitchToCamper = () => {
    setHostMode(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Host Header */}
      {!isOnboarding && (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="container flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/host" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-forest flex items-center justify-center">
                <Trees className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">CampThai</span>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">Host</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavTab to="/host" label={t('hostNav.today', 'Today')} />
              <NavTab to="/host/bookings" label={t('hostNav.bookings', 'Bookings')} />
              <NavTab to="/host/calendar" label={t('hostNav.calendar', 'Calendar')} />
              <NavTab to="/host/listings" label={t('hostNav.listings', 'Listings')} />
              <NavTab to="/host/earnings" label={t('hostNav.earnings', 'Earnings')} />
              <NavTab to="/host/reviews" label={t('hostNav.reviews', 'Reviews')} />
              <NavTab to="/host/messages" label={t('hostNav.messages', 'Messages')} />
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <LanguageCurrencyModal />
              </div>
              <Link to="/" onClick={handleSwitchToCamper}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('hostNav.switchToCamper', 'Switch to Camper')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <Outlet />
    </div>
  );
};

// Navigation Tab Component
const NavTab = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to ||
    (to === '/host' && location.pathname === '/host');

  return (
    <Link
      to={to}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${isActive
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
    >
      {label}
    </Link>
  );
};

export default HostLayout;
