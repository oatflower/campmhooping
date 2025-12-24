import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Trees, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHost } from '@/contexts/HostContext';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import LanguageCurrencyModal from '@/components/LanguageCurrencyModal';

const OnboardingLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentPage, saveProgress, getProgress } = useHost();

  const handleSaveAndExit = () => {
    saveProgress();
    navigate('/host');
  };

  // Calculate which step we're on (1, 2, or 3)
  const getStep = () => {
    if (currentPage <= 7) return 1;
    if (currentPage <= 17) return 2;
    return 3;
  };

  const step = getStep();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-forest flex items-center justify-center">
              <Trees className="w-4 h-4 text-primary-foreground" />
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageCurrencyModal />
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('onboarding.questions')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleSaveAndExit}
            >
              <span>{t('onboarding.saveAndExit')}</span>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer Progress Bar */}
      <footer className="sticky bottom-0 bg-background border-t border-border">
        <div className="container py-4">
          {/* Step Progress */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors",
                  s < step ? "bg-foreground" :
                  s === step ? "bg-foreground" :
                  "bg-border"
                )}
              >
                {s === step && (
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{
                      width: s === 1 ? `${(currentPage / 7) * 100}%` :
                             s === 2 ? `${((currentPage - 8) / 9) * 100}%` :
                             `${((currentPage - 18) / 6) * 100}%`
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
