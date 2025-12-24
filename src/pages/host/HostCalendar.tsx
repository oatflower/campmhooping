import { useState, useEffect, useCallback } from 'react';
import { useHost } from '@/contexts/HostContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { addBlockedDateRange, removeBlockedDateRange } from '@/services/bookingService';
import { supabase } from '@/lib/supabase';

interface DayInfo {
  date: Date;
  price: number | null;
  isBlocked: boolean;
  blockedId?: string;
  hasBooking: boolean;
  bookingStatus?: 'confirmed' | 'pending';
}

interface BlockedDateRecord {
  id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

const HostCalendar = () => {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const { onboardingData, listings } = useHost();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [blockedDates, setBlockedDates] = useState<Map<string, string>>(new Map()); // dateKey -> blockedId
  const [isBlocking, setIsBlocking] = useState(false);

  const basePrice = onboardingData.basePrice || 500;
  const currentCampId = listings[0]?.id; // Use first listing for now

  // Fetch blocked dates from database (Issue #17 - with overlap prevention)
  const fetchBlockedDates = useCallback(async () => {
    if (!currentCampId) return;

    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('camp_id', currentCampId);

      if (error) {
        console.error('Error fetching blocked dates:', error);
        return;
      }

      const blockedMap = new Map<string, string>();
      (data as BlockedDateRecord[] || []).forEach(block => {
        const start = new Date(block.start_date);
        const end = new Date(block.end_date);
        const current = new Date(start);

        while (current <= end) {
          const dateKey = current.toISOString().split('T')[0];
          blockedMap.set(dateKey, block.id);
          current.setDate(current.getDate() + 1);
        }
      });

      setBlockedDates(blockedMap);
    } catch (error) {
      console.error('Failed to fetch blocked dates:', error);
    }
  }, [currentCampId]);

  useEffect(() => {
    fetchBlockedDates();
  }, [fetchBlockedDates]);

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (DayInfo | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateKey = dayDate.toISOString().split('T')[0];
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 5 || dayDate.getDay() === 6;
      const blockedId = blockedDates.get(dateKey);

      days.push({
        date: dayDate,
        price: customPrices[dateKey] ?? (isWeekend ? basePrice + (onboardingData.weekendPremium || 0) : basePrice),
        isBlocked: !!blockedId,
        blockedId,
        hasBooking: false, // Would come from API
        bookingStatus: undefined,
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Toggle block with overlap prevention (Issue #17)
  const toggleBlockDate = async (date: Date) => {
    if (!currentCampId || !user) {
      toast.error('Please complete your listing first');
      return;
    }

    const dateKey = date.toISOString().split('T')[0];
    const existingBlockedId = blockedDates.get(dateKey);

    setIsBlocking(true);

    try {
      if (existingBlockedId) {
        // Unblock the date
        const result = await removeBlockedDateRange(existingBlockedId);
        if (result.success) {
          toast.success('Date unblocked');
          await fetchBlockedDates();
        } else {
          toast.error(result.error || 'Failed to unblock date');
        }
      } else {
        // Block the date (single day)
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await addBlockedDateRange({
          campId: currentCampId,
          startDate: date,
          endDate: endOfDay,
          reason: 'Blocked by host',
          createdBy: user.id,
        });

        if (result.success) {
          toast.success('Date blocked');
          await fetchBlockedDates();
        } else {
          // Issue #17: Show specific error for overlap
          toast.error(result.error || 'Failed to block date');
        }
      }
    } catch (error) {
      console.error('Block toggle error:', error);
      toast.error('Failed to update availability');
    } finally {
      setIsBlocking(false);
    }
  };

  const updatePrice = (date: Date, price: number) => {
    const dateKey = date.toISOString().split('T')[0];
    setCustomPrices(prev => ({ ...prev, [dateKey]: price }));
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('hostCalendar.title')}</h1>
          <p className="text-muted-foreground">{t('hostCalendar.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                {t(`hostCalendar.months.${monthKeys[currentMonth.getMonth()]}`)} {i18n.language === 'th' ? currentMonth.getFullYear() + 543 : currentMonth.getFullYear()}
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayKeys.map(dayKey => (
                <div key={dayKey} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {t(`hostCalendar.days.${dayKey}`)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => !isPast(day.date) && setSelectedDate(day.date)}
                      disabled={isPast(day.date)}
                      className={cn(
                        "w-full h-full rounded-xl p-1 flex flex-col items-center justify-center transition-all",
                        "hover:bg-secondary",
                        isPast(day.date) && "opacity-40 cursor-not-allowed",
                        day.isBlocked && "bg-red-100 dark:bg-red-900/20",
                        day.hasBooking && "bg-green-100 dark:bg-green-900/20",
                        selectedDate?.toDateString() === day.date.toDateString() && "ring-2 ring-foreground"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        day.isBlocked && "line-through text-muted-foreground"
                      )}>
                        {day.date.getDate()}
                      </span>
                      {!day.isBlocked && day.price && (
                        <span className="text-xs text-muted-foreground">
                          ฿{day.price}
                        </span>
                      )}
                      {day.isBlocked && (
                        <X className="w-3 h-3 text-red-500" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/20" />
                <span className="text-sm text-muted-foreground">{t('hostCalendar.hasBooking')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/20" />
                <span className="text-sm text-muted-foreground">{t('hostCalendar.blocked')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">
                    {selectedDate.toLocaleDateString('th-TH', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Price Setting */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {t('hostCalendar.pricePerNight')}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">฿</span>
                      <input
                        type="number"
                        value={customPrices[selectedDate.toISOString().split('T')[0]] ?? basePrice}
                        onChange={(e) => updatePrice(selectedDate, parseInt(e.target.value) || 0)}
                        className="flex-1 bg-secondary rounded-lg px-3 py-2 text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Block Toggle */}
                  <Button
                    variant={blockedDates.has(selectedDate.toISOString().split('T')[0]) ? "destructive" : "outline"}
                    className="w-full"
                    onClick={() => toggleBlockDate(selectedDate)}
                    disabled={isBlocking}
                  >
                    {isBlocking ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                    ) : blockedDates.has(selectedDate.toISOString().split('T')[0])
                      ? t('hostCalendar.openBooking')
                      : t('hostCalendar.closeBooking')
                    }
                  </Button>

                  {/* Quick Price Options */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {t('hostCalendar.quickPrice')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[300, 500, 800, 1000].map(price => (
                        <Button
                          key={price}
                          variant="outline"
                          size="sm"
                          onClick={() => updatePrice(selectedDate, price)}
                        >
                          {formatPrice(price)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-2xl border border-border p-6 text-center"
              >
                <div className="text-4xl mb-4">📅</div>
                <p className="text-muted-foreground">
                  {t('hostCalendar.selectDateHint')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default HostCalendar;
