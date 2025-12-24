import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trees, Heart, Tent, MessageSquare, User, Settings, HelpCircle, Globe, LogOut, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageCurrencyModal from '@/components/LanguageCurrencyModal';
import { Badge } from '@/components/ui/badge';
import CompactSearchBar from './CompactSearchBar';
import { GuestState } from './search/WhoDropdown';
import { useHost } from '@/contexts/HostContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showCompactSearch?: boolean;
  compactSearchLabel?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: GuestState;
  onSearch?: (params: {
    location: string | null;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: GuestState;
  }) => void;
  onLocationSelect?: (location: string | null) => void;
}

const Header = ({
  showCompactSearch = false,
  compactSearchLabel,
  checkIn,
  checkOut,
  guests,
  onSearch,
  onLocationSelect
}: HeaderProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { hasListings } = useHost();
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'escape' | 'essential'>('escape');
  const [isScrolled, setIsScrolled] = useState(false);

  const tabs = [
    { id: 'escape' as const, icon: '🏕️', labelKey: 'nav.escape', path: '/camps' },
    { id: 'essential' as const, icon: '🎒', labelKey: 'nav.essential', path: '/gear', isNew: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDefaultSearch = (params: {
    location: string | null;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: GuestState;
  }) => {
    if (onSearch) {
      onSearch(params);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background backdrop-blur-xl border-b border-border/50">
      <div className="container relative flex items-center justify-between h-16 md:h-20">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center gap-2 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-forest flex items-center justify-center">
            <Trees className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:block">CampThai</span>
        </Link>

        {/* Desktop Nav - Tabs / Compact Search - Centered */}
        <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-max max-w-[600px] justify-center">
          <AnimatePresence mode="wait">
            {!isScrolled ? (
              <motion.nav
                key="tabs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center bg-secondary/50 rounded-full p-1">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${activeTab === tab.id || location.pathname === tab.path
                        ? 'bg-background shadow-md text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="font-medium text-sm">{t(tab.labelKey)}</span>
                      {tab.isNew && (
                        <Badge
                          variant="default"
                          className="absolute -top-2 -right-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground font-bold uppercase"
                        >
                          {t('common.new')}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </motion.nav>
            ) : showCompactSearch ? (
              <motion.div
                key="compact-search"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <CompactSearchBar
                  onSearch={handleDefaultSearch}
                  onLocationSelect={onLocationSelect}
                  initialLocation={compactSearchLabel}
                  initialCheckIn={checkIn}
                  initialCheckOut={checkOut}
                  initialGuests={guests}
                />
              </motion.div>
            ) : (
              <motion.nav
                key="tabs-scrolled"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center bg-secondary/50 rounded-full p-1">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${activeTab === tab.id || location.pathname === tab.path
                        ? 'bg-background shadow-md text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium text-xs">{t(tab.labelKey)}</span>
                      {tab.isNew && (
                        <Badge
                          variant="default"
                          className="absolute -top-1 -right-1 px-1 py-0 text-[8px] bg-primary text-primary-foreground font-bold uppercase"
                        >
                          {t('common.new')}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-2 z-10">
          {/* Switch to Host */}
          <Link to="/host" className="hidden md:block">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Tent className="w-4 h-4" />
              <span>{hasListings ? t('host.switchToHost') : t('host.becomeHost')}</span>
            </Button>
          </Link>
          <div className="hidden md:block">
            <LanguageCurrencyModal />
          </div>
          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/profile?tab=trips">
            <Button variant="ghost" size="icon" className="hidden md:flex" title={t('profile.pastTrips', 'Past Trips')}>
              <History className="w-5 h-5" />
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="flex items-center gap-3 cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    <span>{t('profile.messages', 'Messages')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-3 cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>{t('profile.profile', 'Profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-3 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    <span>{t('profile.accountSettings', 'Account settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="flex items-center gap-3 cursor-pointer">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('profile.helpCenter', 'Help Center')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!hasListings && (
                  <DropdownMenuItem asChild>
                    <Link to="/host" className="flex items-center gap-3 cursor-pointer">
                      <Tent className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{t('host.becomeHost')}</span>
                        <span className="text-xs text-muted-foreground">{t('profile.becomeHostDesc', 'Start hosting and earn')}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>{t('profile.logout', 'Log out')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="forest" size="sm" className="hidden md:flex">
                {t('common.login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
