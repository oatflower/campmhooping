import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, Users, Clock, LogIn, ChevronRight } from 'lucide-react';
import { useDemoAuth, demoAccounts } from '@/contexts/DemoAuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const tripTypeConfig: Record<string, { icon: string; labelKey: string }> = {
  solo: { icon: '🧍', labelKey: 'tripTypes.solo' },
  friends: { icon: '👥', labelKey: 'tripTypes.friends' },
  family: { icon: '👨‍👩‍👧', labelKey: 'tripTypes.family' },
};

const Community = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, login, logout, hasActiveBooking } = useDemoAuth();
  const { t } = useTranslation();
  const [showLoginSheet, setShowLoginSheet] = useState(false);

  // Helper to get trip type label
  const getTripTypeLabel = (tripType: string) => {
    const config = tripTypeConfig[tripType];
    return config ? t(config.labelKey) : tripType;
  };

  const handleLogin = (accountId: string) => {
    login(accountId);
    setShowLoginSheet(false);
  };

  const handleGoToCampToday = () => {
    if (user?.campId) {
      navigate(`/camp-today/${user.campId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold">{t('community.title')}</h1>
          {isLoggedIn ? (
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs">
              {t('community.logout')}
            </Button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* If logged in with active booking */}
        {isLoggedIn && hasActiveBooking ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Card */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest/20 to-forest/10 flex items-center justify-center text-3xl">
                  {user?.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.tent} • {tripTypeConfig[user?.tripType || 'solo']?.icon} {getTripTypeLabel(user?.tripType || 'solo')}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  🏕️ {user?.campName}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {t('community.activeBooking')} • {user?.groupSize}
                </p>
              </div>
            </div>

            {/* Go to Camp Today CTA */}
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-forest to-emerald-600 hover:from-forest/90 hover:to-emerald-600/90 text-base font-semibold gap-2"
              onClick={handleGoToCampToday}
            >
              {t('community.goToCampToday')}
              <ChevronRight className="w-5 h-5" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t('community.availableDuringStay')}
            </p>
          </motion.div>
        ) : (
          /* Not logged in or no booking */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero */}
            <div className="text-center">
              <div className="text-6xl mb-4">🤝</div>
              <h1 className="text-2xl font-bold mb-2">
                {t('community.heroTitle')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('community.subtitle')}
                <br />
                {t('community.forGuestsOnly')}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-card rounded-2xl border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('community.privacyFirst')}</p>
                  <p className="text-xs text-muted-foreground">{t('community.privacyFirstDesc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white dark:bg-card rounded-2xl border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('community.permissionBased')}</p>
                  <p className="text-xs text-muted-foreground">{t('community.permissionBasedDesc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white dark:bg-card rounded-2xl border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('community.timeLimited')}</p>
                  <p className="text-xs text-muted-foreground">{t('community.timeLimitedDesc')}</p>
                </div>
              </div>
            </div>

            {/* Positioning Copy */}
            <div className="p-4 bg-gradient-to-br from-forest/5 to-forest/10 rounded-2xl border border-forest/20">
              <p className="text-sm text-center text-muted-foreground italic">
                "{t('community.quote')}"
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        {isLoggedIn && hasActiveBooking ? (
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-2xl"
            onClick={() => navigate('/camps')}
          >
            {t('community.searchOtherCamps')}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Demo Login Button */}
            <Sheet open={showLoginSheet} onOpenChange={setShowLoginSheet}>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="w-full h-14 rounded-2xl bg-forest hover:bg-forest/90 text-base font-semibold gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {t('community.demoLogin')}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-center">{t('community.selectAccount')}</SheetTitle>
                </SheetHeader>
                <div className="space-y-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleLogin(account.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary active:scale-[0.98] transition-all text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest/20 to-forest/10 flex items-center justify-center text-2xl">
                        {account.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.tent} • {tripTypeConfig[account.tripType]?.icon} {account.groupSize}
                        </p>
                        <p className="text-xs text-forest">{account.campName}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-6">
                  {t('community.demoNote')}
                </p>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-2xl"
              onClick={() => navigate('/camps')}
            >
              {t('community.searchCamps')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
