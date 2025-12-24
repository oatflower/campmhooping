import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Pause, Trash2, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

const campTypeKeys: Record<string, string> = {
  tent: 'tent',
  glamping: 'glamping',
  cabin: 'cabin',
  rv: 'rv',
  treehouse: 'treehouse',
  mixed: 'mixed',
};

const HostListings = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { listings, onboardingData } = useHost();

  // Use onboarding data as a "draft" listing if no published listings
  const hasOnboardingDraft = onboardingData.title || onboardingData.campType;

  const allListings = [
    ...listings,
    ...(hasOnboardingDraft && listings.length === 0 ? [{
      id: 'draft',
      status: 'draft' as const,
      data: onboardingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }] : []),
  ];

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('hostListings.title')}</h1>
          <p className="text-muted-foreground">{t('hostListings.subtitle')}</p>
        </div>
        <Button
          onClick={() => navigate('/host/onboarding')}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('hostListings.createNew')}</span>
        </Button>
      </div>

      {/* Listings Grid */}
      {allListings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🏕️</div>
          <h2 className="text-xl font-semibold mb-2">{t('hostListings.noListings')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('hostListings.createFirstDesc')}
          </p>
          <Button
            onClick={() => navigate('/host/onboarding')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('hostListings.createListing')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListingCard
                listing={listing}
                onEdit={() => navigate('/host/onboarding')}
                onView={() => {/* Preview */}}
                onPause={() => {/* Toggle pause */}}
                onDelete={() => {/* Delete */}}
                t={t}
                formatPrice={formatPrice}
              />
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
};

interface ListingCardProps {
  listing: {
    id: string;
    status: 'draft' | 'in_progress' | 'published' | 'paused';
    data: {
      title?: string;
      campType?: string | null;
      images?: string[];
      coverImageIndex?: number;
      basePrice?: number;
      location?: {
        province?: string;
        district?: string;
      };
      capacity?: {
        maxCampers?: number;
      };
    };
  };
  onEdit: () => void;
  onView: () => void;
  onPause: () => void;
  onDelete: () => void;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
}

const ListingCard = ({ listing, onEdit, onView, onPause, onDelete, t, formatPrice }: ListingCardProps) => {
  const statusStyles = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const statusKeys = {
    draft: 'hostListings.status.draft',
    in_progress: 'hostListings.status.inProgress',
    published: 'hostListings.status.published',
    paused: 'hostListings.status.paused',
  };

  const coverImage = listing.data.images?.[listing.data.coverImageIndex || 0];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group">
      {/* Image */}
      <div className="aspect-[4/3] bg-secondary relative">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.data.title || 'Camp'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🏕️
          </div>
        )}

        {/* Status Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium",
          statusStyles[listing.status]
        )}>
          {t(statusKeys[listing.status])}
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="w-8 h-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {listing.status === 'published' && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('hostListings.viewListing')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                {t('hostListings.edit')}
              </DropdownMenuItem>
              {listing.status === 'published' && (
                <DropdownMenuItem onClick={onPause}>
                  <Pause className="w-4 h-4 mr-2" />
                  {t('hostListings.pauseListing')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('hostListings.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 truncate">
          {listing.data.title || t('hostListings.untitledCamp')}
        </h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          {listing.data.campType && (
            <span>{t(`hostListings.campTypes.${campTypeKeys[listing.data.campType]}`) || listing.data.campType}</span>
          )}
          {listing.data.location?.province && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.data.location.province}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{listing.data.capacity?.maxCampers || 0} {t('hostListings.guests')}</span>
          </div>
          {listing.data.basePrice && listing.data.basePrice > 0 && (
            <div className="text-sm">
              <span className="font-semibold">{formatPrice(listing.data.basePrice)}</span>
              <span className="text-muted-foreground"> {t('hostListings.perNight')}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {listing.status === 'draft' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={onEdit}
          >
            {t('hostListings.continueEditing')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default HostListings;
