import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Flame, Moon, MessageCircle, X, Check, Send } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useTranslation } from 'react-i18next';

// Campii type definition
interface Campii {
  id: string;
  nickname: string;
  tent: string;
  intent: string;
  groupSize: number;
  tripType: string;
  avatar: string;
  bio: string;
  ageRange: string;
  languages: string[];
  openSince: string;
}

// Real data - empty until campii feature is implemented
const openCampii: Campii[] = [];

const intentConfig: Record<string, { icon: string; labelKey: string; color: string }> = {
  chill: { icon: '☕', labelKey: 'campToday.intentChill', color: 'bg-amber-100 text-amber-700' },
  activity: { icon: '🔥', labelKey: 'campToday.intentActivity', color: 'bg-orange-100 text-orange-700' },
  bbq: { icon: '🔥', labelKey: 'campToday.intentActivity', color: 'bg-orange-100 text-orange-700' },
  walk: { icon: '🥾', labelKey: 'campToday.intentWalk', color: 'bg-green-100 text-green-700' },
  music: { icon: '🎸', labelKey: 'campToday.intentMusic', color: 'bg-purple-100 text-purple-700' },
  open: { icon: '👋', labelKey: 'campToday.intentOpen', color: 'bg-blue-100 text-blue-700' },
};

const tripTypeConfig: Record<string, { icon: string; labelKey: string }> = {
  solo: { icon: '🧍', labelKey: 'tripTypes.solo' },
  friends: { icon: '👥', labelKey: 'tripTypes.friends' },
  family: { icon: '👨‍👩‍👧', labelKey: 'tripTypes.family' },
};

// Check if quiet hours (22:00 - 07:00)
const isQuietHours = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

const CampToday = () => {
  const navigate = useNavigate();
  const { user } = useDemoAuth();
  const { t } = useTranslation();
  const [isOpenToJam, setIsOpenToJam] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [showIntentSheet, setShowIntentSheet] = useState(false);
  const [showSayHiSheet, setShowSayHiSheet] = useState(false);
  const [selectedCampii, setSelectedCampii] = useState<Campii | null>(null);
  const [sentHellos, setSentHellos] = useState<Set<string>>(new Set());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'me' | 'them'; text: string }[]>([]);

  // Intent options with translated labels
  const intentOptions = [
    { id: 'chill', icon: '☕', label: t('campToday.intentChill'), color: 'bg-amber-100 text-amber-700' },
    { id: 'activity', icon: '🔥', label: t('campToday.intentActivity'), color: 'bg-orange-100 text-orange-700' },
    { id: 'walk', icon: '🥾', label: t('campToday.intentWalk'), color: 'bg-green-100 text-green-700' },
    { id: 'music', icon: '🎸', label: t('campToday.intentMusic'), color: 'bg-purple-100 text-purple-700' },
    { id: 'open', icon: '👋', label: t('campToday.intentOpen'), color: 'bg-blue-100 text-blue-700' },
  ];

  // Helper to get intent label
  const getIntentLabel = (intent: string) => {
    const config = intentConfig[intent];
    return config ? t(config.labelKey) : intent;
  };

  // Helper to get trip type label
  const getTripTypeLabel = (tripType: string) => {
    const config = tripTypeConfig[tripType];
    return config ? t(config.labelKey) : tripType;
  };

  const quietHours = isQuietHours();
  const campName = user?.campName || 'Camp Doi Suthep';

  // Camp stats - real data
  const totalCampii = openCampii.length;
  const avgAgeRange = openCampii.length > 0 ? openCampii[0].ageRange : '-';

  const handleOpenToJam = () => {
    if (quietHours) return;
    setShowIntentSheet(true);
  };

  const handleSelectIntent = (intentId: string) => {
    setSelectedIntent(intentId);
    setIsOpenToJam(true);
    setShowIntentSheet(false);
  };

  const handleSayHi = (campii: Campii) => {
    if (quietHours || sentHellos.has(campii.id)) return;
    setSelectedCampii(campii);
    setShowSayHiSheet(true);
  };

  const handleSendHello = () => {
    if (selectedCampii) {
      setSentHellos(prev => new Set([...prev, selectedCampii.id]));
    }
    setShowSayHiSheet(false);
    setSelectedCampii(null);
  };

  const handleOpenProfile = (campii: Campii) => {
    setSelectedCampii(campii);
    setShowProfileModal(true);
  };

  const handleStartChat = () => {
    setShowProfileModal(false);
    setChatMessages([]);
    setChatMessage('');
    setShowChatModal(true);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'me', text: chatMessage }]);
    setChatMessage('');
    // Real messaging will be implemented via Supabase
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
      {/* Header - Compact */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-3">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base truncate">{t('campToday.title')} {campName}</h1>
            <p className="text-[10px] text-muted-foreground">
              {user ? `${user.tent} • ${tripTypeConfig[user.tripType]?.icon}` : t('campToday.visibleDuringStay')}
            </p>
          </div>
          {user && (
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-lg">
              {user.avatar}
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-4 pb-36 space-y-4">
        {/* Quiet Hours Alert */}
        <AnimatePresence>
          {quietHours && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-indigo-900 dark:text-indigo-100">
                  {t('campToday.quietHours')} 🌙
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-300">
                  {t('campToday.quietHoursDesc')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Your Status Card (when open to jam) */}
        <AnimatePresence>
          {isOpenToJam && selectedIntent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t('campToday.youreOpen')}</p>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      {intentConfig[selectedIntent]?.icon} {getIntentLabel(selectedIntent)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpenToJam(false);
                    setSelectedIntent(null);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camp Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-forest/5 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏕️</span>
              <span className="text-2xl font-bold">{totalCampii}</span>
              <span className="text-sm text-muted-foreground">{t('campToday.campiiToday')}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 divide-x divide-border/50">
            <div className="p-3 text-center">
              <div className="text-lg mb-0.5">🎂</div>
              <div className="text-xs text-muted-foreground">{t('campToday.age')}</div>
              <div className="font-semibold text-sm">{avgAgeRange}</div>
            </div>
            <div className="p-3 text-center">
              <div className="flex justify-center gap-1 mb-0.5">
                <span>🧍</span><span>👥</span><span>👨‍👩‍👧</span>
              </div>
              <div className="text-xs text-muted-foreground">{t('campToday.tripType')}</div>
              <div className="font-semibold text-sm">Mixed</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-lg mb-0.5">🔥</div>
              <div className="text-xs text-muted-foreground">Open</div>
              <div className="font-semibold text-sm">{openCampii.length}</div>
            </div>
          </div>
        </motion.div>

        {/* Campii List */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👥</span>
            <h2 className="font-semibold text-sm">{t('campToday.openToJam')}</h2>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
              {openCampii.length}
            </span>
          </div>

          <div className="space-y-2">
            {openCampii.map((campii, index) => {
              const hasSentHello = sentHellos.has(campii.id);
              return (
                <motion.div
                  key={campii.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm p-3 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => handleOpenProfile(campii)}
                >
                  {/* Header Row */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-forest/10 to-forest/5 flex items-center justify-center text-xl shrink-0">
                      {campii.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{campii.tent}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          intentConfig[campii.intent]?.color
                        )}>
                          {intentConfig[campii.intent]?.icon} {getIntentLabel(campii.intent)}
                        </span>
                      </div>
                      {/* Compact info row */}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{tripTypeConfig[campii.tripType]?.icon} {campii.groupSize}</span>
                        <span>•</span>
                        <span>🎂 {campii.ageRange}</span>
                        <span>•</span>
                        <span>{campii.languages.join(' ')}</span>
                      </div>
                      {/* Bio preview */}
                      {campii.bio && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">"{campii.bio}"</p>
                      )}
                    </div>

                    {/* Hi Button */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSayHi(campii);
                      }}
                      disabled={quietHours || hasSentHello}
                      className={cn(
                        "rounded-xl h-8 px-2.5 shrink-0",
                        hasSentHello
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-forest hover:bg-forest/90 text-white"
                      )}
                    >
                      {hasSentHello ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <>
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Hi</span>
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <Button
          size="lg"
          className={cn(
            "w-full h-14 rounded-2xl gap-2 text-base font-semibold shadow-lg",
            isOpenToJam
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
          )}
          onClick={handleOpenToJam}
          disabled={quietHours}
        >
          <Flame className="w-5 h-5" />
          {isOpenToJam ? t('campToday.youreOpen') : t('campToday.openToJam') + '?'}
        </Button>
        {!isOpenToJam && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('campToday.letOthersKnow')}
          </p>
        )}
      </div>

      {/* Intent Selection Sheet */}
      <Sheet open={showIntentSheet} onOpenChange={setShowIntentSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-center">{t('campToday.whatYouWant')}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            {intentOptions.map((intent) => (
              <button
                key={intent.id}
                onClick={() => handleSelectIntent(intent.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary active:scale-[0.98] transition-all text-left"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                  intent.color
                )}>
                  {intent.icon}
                </div>
                <span className="font-medium">{intent.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            {t('campToday.statusExpires')}
          </p>
        </SheetContent>
      </Sheet>

      {/* Say Hi Confirmation Sheet */}
      <Sheet open={showSayHiSheet} onOpenChange={setShowSayHiSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center">{t('campToday.sayHi')} 👋</SheetTitle>
          </SheetHeader>
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-forest/10 to-forest/5 flex items-center justify-center text-4xl mx-auto mb-4">
              {selectedCampii?.avatar}
            </div>
            <p className="font-semibold mb-1">{selectedCampii?.tent}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {t('campToday.friendlyGreeting')}
              <br />
              <span className="text-xs">{t('campToday.waitForAccept')}</span>
            </p>
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl bg-forest hover:bg-forest/90 text-base font-semibold"
              onClick={handleSendHello}
            >
              👋 {t('campToday.sendHello')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Modal - Full Screen */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="w-full h-full max-w-full max-h-full rounded-none p-0 overflow-hidden border-0 flex flex-col sm:rounded-3xl sm:max-w-md sm:h-auto sm:max-h-[90vh]">
          <div className="bg-gradient-to-br from-forest/10 to-forest/5 pt-12 pb-6 px-6 text-center shrink-0">
            <div className="w-28 h-28 rounded-3xl bg-white shadow-lg flex items-center justify-center text-6xl mx-auto mb-4">
              {selectedCampii?.avatar}
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedCampii?.tent}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-base text-green-600 font-medium">{t('campToday.openToJam')}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Intent */}
            <div className="flex items-center justify-center">
              <span className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                intentConfig[selectedCampii?.intent || 'open']?.color
              )}>
                {intentConfig[selectedCampii?.intent || 'open']?.icon}{' '}
                {getIntentLabel(selectedCampii?.intent || 'open')}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-secondary/50 rounded-xl p-2">
                <div className="text-base mb-0.5">{tripTypeConfig[selectedCampii?.tripType || 'solo']?.icon}</div>
                <div className="text-[10px] text-muted-foreground">{t('campToday.tripType')}</div>
                <div className="font-medium text-xs">{getTripTypeLabel(selectedCampii?.tripType || 'solo')}</div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2">
                <div className="text-base mb-0.5">👥</div>
                <div className="text-[10px] text-muted-foreground">{t('campToday.groupSize')}</div>
                <div className="font-medium text-xs">{selectedCampii?.groupSize}</div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2">
                <div className="text-base mb-0.5">🎂</div>
                <div className="text-[10px] text-muted-foreground">{t('campToday.age')}</div>
                <div className="font-medium text-xs">{selectedCampii?.ageRange}</div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2">
                <div className="text-base mb-0.5">💬</div>
                <div className="text-[10px] text-muted-foreground">{t('campToday.lang')}</div>
                <div className="font-medium text-xs">{selectedCampii?.languages?.join(' ')}</div>
              </div>
            </div>

            {/* Bio */}
            {selectedCampii?.bio && (
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-muted-foreground italic">"{selectedCampii.bio}"</p>
              </div>
            )}

            {/* Open Since */}
            <p className="text-xs text-muted-foreground text-center">
              {t('campToday.openSince')} {selectedCampii?.openSince}
            </p>
          </div>

          {/* Chat Button - Fixed Bottom */}
          <div className="shrink-0 p-6 pt-2 bg-white dark:bg-background">
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl bg-forest hover:bg-forest/90 text-base font-semibold gap-2"
              onClick={handleStartChat}
            >
              <MessageCircle className="w-5 h-5" />
              {t('campToday.chat')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal - Full Screen */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="w-full h-full max-w-full max-h-full rounded-none p-0 overflow-hidden border-0 flex flex-col sm:rounded-3xl sm:max-w-md sm:h-auto sm:max-h-[85vh]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-forest to-emerald-600 px-4 pt-12 pb-4 text-white shrink-0 sm:pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                {selectedCampii?.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{selectedCampii?.tent}</p>
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-300" />
                  {t('campToday.online')}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
            {chatMessages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                <div className="text-4xl mb-2">👋</div>
                <p>{t('campToday.startConversation')} {selectedCampii?.tent}</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  msg.sender === 'me' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-2xl",
                    msg.sender === 'me'
                      ? "bg-forest text-white rounded-br-md"
                      : "bg-white dark:bg-card rounded-bl-md"
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 pb-8 bg-white dark:bg-card border-t border-border/50 shrink-0 sm:pb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('campToday.typeMessage')}
                className="flex-1 h-12 px-4 bg-secondary/50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-forest/30"
              />
              <Button
                size="icon"
                className="h-12 w-12 rounded-2xl bg-forest hover:bg-forest/90"
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampToday;
