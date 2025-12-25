import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Pause, Play, Trash2, MapPin, Users, Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const campTypeKeys: Record<string, string> = {
  tent: 'tent',
  glamping: 'glamping',
  cabin: 'cabin',
  rv: 'rv',
  treehouse: 'treehouse',
  mixed: 'mixed',
};

interface CampListing {
  id: string;
  name: string;
  camp_type: string;
  images: string[];
  price_per_night: number;
  province: string;
  max_guests: number;
  is_active: boolean;
  status: 'draft' | 'published' | 'paused';
}

const HostListings = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { listings, onboardingData } = useHost();

  const [camps, setCamps] = useState<CampListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; campId: string | null }>({ open: false, campId: null });

  // Fetch camps from Supabase
  const fetchCamps = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('camps')
        .select('id, name, camp_type, images, price_per_night, province, max_guests, is_active')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCamps((data || []).map(camp => ({
        ...camp,
        status: camp.is_active ? 'published' : 'paused',
      })));
    } catch (error) {
      console.error('Error fetching camps:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  // Toggle pause/unpause
  const handleTogglePause = async (campId: string, currentlyActive: boolean) => {
    setActionLoading(campId);
    try {
      const { error } = await supabase
        .from('camps')
        .update({ is_active: !currentlyActive })
        .eq('id', campId);

      if (error) throw error;

      setCamps(prev =>
        prev.map(c => c.id === campId ? { ...c, is_active: !currentlyActive, status: !currentlyActive ? 'published' : 'paused' } : c)
      );
      toast.success(currentlyActive
        ? t('hostListings.pauseSuccess', 'Listing paused')
        : t('hostListings.unpauseSuccess', 'Listing is now active')
      );
    } catch (error) {
      toast.error(t('hostListings.actionError', 'Failed to update listing'));
    } finally {
      setActionLoading(null);
    }
  };

  // Duplicate listing
  const handleDuplicate = async (campId: string) => {
    setActionLoading(campId);
    try {
      // Get the original camp
      const { data: original, error: fetchError } = await supabase
        .from('camps')
        .select('*')
        .eq('id', campId)
        .single();

      if (fetchError || !original) throw fetchError;

      // Create a copy without id and with modified name
      const { id, created_at, updated_at, ...campData } = original;
      const newCamp = {
        ...campData,
        name: `${original.name} (Copy)`,
        is_active: false, // Start as paused
      };

      const { data: duplicated, error: insertError } = await supabase
        .from('camps')
        .insert(newCamp)
        .select()
        .single();

      if (insertError) throw insertError;

      setCamps(prev => [{
        ...duplicated,
        status: 'paused',
      }, ...prev]);

      toast.success(t('hostListings.duplicateSuccess', 'Listing duplicated successfully'));
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error(t('hostListings.duplicateError', 'Failed to duplicate listing'));
    } finally {
      setActionLoading(null);
    }
  };

  // Delete listing
  const handleDelete = async () => {
    if (!deleteDialog.campId) return;
    setActionLoading(deleteDialog.campId);
    try {
      const { error } = await supabase
        .from('camps')
        .delete()
        .eq('id', deleteDialog.campId);

      if (error) throw error;

      setCamps(prev => prev.filter(c => c.id !== deleteDialog.campId));
      toast.success(t('hostListings.deleteSuccess', 'Listing deleted'));
    } catch (error) {
      toast.error(t('hostListings.deleteError', 'Failed to delete listing'));
    } finally {
      setActionLoading(null);
      setDeleteDialog({ open: false, campId: null });
    }
  };

  // Use onboarding data as a "draft" listing if no published listings
  const hasOnboardingDraft = onboardingData.title || onboardingData.campType;

  const allListings = [
    // Add real camps first
    ...camps.map(camp => ({
      id: camp.id,
      status: camp.status,
      isReal: true,
      data: {
        title: camp.name,
        campType: camp.camp_type,
        images: camp.images,
        coverImageIndex: 0,
        basePrice: camp.price_per_night,
        location: { province: camp.province },
        capacity: { maxCampers: camp.max_guests },
      },
      isActive: camp.is_active,
    })),
    // Add draft from context if exists
    ...(hasOnboardingDraft && camps.length === 0 ? [{
      id: 'draft',
      status: 'draft' as const,
      isReal: false,
      data: onboardingData,
      isActive: false,
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
                onEdit={() => listing.isReal ? navigate(`/camps/${listing.id}`) : navigate('/host/onboarding')}
                onView={() => navigate(`/camps/${listing.id}`)}
                onPause={() => listing.isReal && handleTogglePause(listing.id, listing.isActive)}
                onDuplicate={() => listing.isReal && handleDuplicate(listing.id)}
                onDelete={() => listing.isReal && setDeleteDialog({ open: true, campId: listing.id })}
                isLoading={actionLoading === listing.id}
                t={t}
                formatPrice={formatPrice}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('hostListings.deleteConfirmTitle', 'Delete this listing?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('hostListings.deleteConfirmDesc', 'This action cannot be undone. All booking history will be preserved but the listing will no longer be available.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('hostListings.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

interface ListingCardProps {
  listing: {
    id: string;
    status: 'draft' | 'in_progress' | 'published' | 'paused';
    isReal?: boolean;
    isActive?: boolean;
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
  onDuplicate: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
}

const ListingCard = ({ listing, onEdit, onView, onPause, onDuplicate, onDelete, isLoading, t, formatPrice }: ListingCardProps) => {
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
    <div className="bg-card rounded-2xl border border-border overflow-hidden group relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

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
              {(listing.status === 'published' || listing.status === 'paused') && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('hostListings.viewListing', 'View Listing')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                {t('hostListings.edit', 'Edit')}
              </DropdownMenuItem>
              {listing.isReal && (
                <>
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('hostListings.duplicate', 'Duplicate')}
                  </DropdownMenuItem>
                  {listing.status === 'published' ? (
                    <DropdownMenuItem onClick={onPause}>
                      <Pause className="w-4 h-4 mr-2" />
                      {t('hostListings.pauseListing', 'Pause Listing')}
                    </DropdownMenuItem>
                  ) : listing.status === 'paused' ? (
                    <DropdownMenuItem onClick={onPause}>
                      <Play className="w-4 h-4 mr-2" />
                      {t('hostListings.unpauseListing', 'Activate Listing')}
                    </DropdownMenuItem>
                  ) : null}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('hostListings.delete', 'Delete')}
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
