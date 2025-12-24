import { Search, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const MobileBottomNav = () => {
  const location = useLocation();
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { icon: Search, activeIcon: Search, label: t('nav.explore'), href: '/' },
    { icon: Heart, activeIcon: Heart, label: t('nav.wishlists'), href: '/favorites' },
    {
      icon: User,
      activeIcon: User,
      label: user ? user.name : t('nav.login'),
      href: user ? '/profile' : '/auth'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          const showBadge = item.href === '/favorites' && favorites.length > 0;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-6 transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6",
                    isActive && "fill-primary"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px]",
                isActive ? "font-medium" : "font-normal"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
