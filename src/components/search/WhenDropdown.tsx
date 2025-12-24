import { forwardRef, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { addDays, addMonths, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const MAX_STAY_NIGHTS = 14;
const MIN_STAY_NIGHTS = 1;

type TabType = 'dates' | 'months';

const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface WhenDropdownProps {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  onDateChange: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
}

const WhenDropdown = forwardRef<HTMLDivElement, WhenDropdownProps>(({
  checkIn,
  checkOut,
  onDateChange,
}, ref) => {
  const [activeTab, setActiveTab] = useState<TabType>('dates');
  const [selectedMonths, setSelectedMonths] = useState<number>(1);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) {
      onDateChange(undefined, undefined);
      return;
    }

    // If selecting checkout date, validate min/max stay
    if (range.from && range.to) {
      const nights = differenceInDays(range.to, range.from);

      // Minimum 1 night
      if (nights < MIN_STAY_NIGHTS) {
        onDateChange(range.from, addDays(range.from, MIN_STAY_NIGHTS));
        return;
      }

      // Maximum nights
      if (nights > MAX_STAY_NIGHTS) {
        onDateChange(range.from, addDays(range.from, MAX_STAY_NIGHTS));
        return;
      }
    }

    onDateChange(range.from, range.to);
  };

  // Handle month selection - set checkIn to today and checkOut based on months
  const handleMonthSelect = (months: number) => {
    setSelectedMonths(months);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addMonths(today, months);
    onDateChange(today, endDate);
  };

  // Calculate disabled dates for checkout (beyond max stay)
  const getDisabledDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn) {
      const maxCheckout = addDays(checkIn, MAX_STAY_NIGHTS);
      return [
        { before: today },
        { after: maxCheckout }
      ];
    }

    return { before: today };
  };

  const getNightsCount = () => {
    if (checkIn && checkOut && checkOut > checkIn) {
      return differenceInDays(checkOut, checkIn);
    }
    return 0;
  };

  const { t } = useTranslation();

  return (
    <div
      ref={ref}
      className="bg-card rounded-3xl shadow-elevated border border-border p-6"
    >
      <div className="flex flex-col items-center">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-secondary rounded-full mb-6">
          <button
            onClick={() => setActiveTab('dates')}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-all',
              activeTab === 'dates'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('search.dates', 'Dates')}
          </button>
          <button
            onClick={() => setActiveTab('months')}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-all',
              activeTab === 'months'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('search.months', 'Months')}
          </button>
        </div>

        {/* Dates Tab Content */}
        {activeTab === 'dates' && (
          <Calendar
            mode="range"
            selected={{ from: checkIn, to: checkOut }}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={getDisabledDates()}
            locale={th} // Keep locale for Calendar component specifically as it might need date-fns locale object
            className="pointer-events-auto"
          />
        )}

        {/* Months Tab Content */}
        {activeTab === 'months' && (
          <div className="w-full">
            <p className="text-sm text-muted-foreground text-center mb-4">
              {t('search.selectDuration', 'Select duration')}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MONTH_OPTIONS.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all border',
                    selectedMonths === month && activeTab === 'months'
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-secondary text-foreground border-transparent hover:border-accent/50'
                  )}
                >
                  {month} {t('search.monthUnit', 'months')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-border w-full flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {getNightsCount() > 0 ? (
              <span className="font-medium text-foreground">{getNightsCount()} {t('search.nights', 'nights')}</span>
            ) : (
              <span>{t('search.selectRange', { min: MIN_STAY_NIGHTS, max: MAX_STAY_NIGHTS })}</span>
            )}
          </div>

          {(checkIn || checkOut) && (
            <button
              onClick={() => onDateChange(undefined, undefined)}
              className="text-sm text-accent hover:underline font-medium"
            >
              {t('search.clearDates', 'Clear dates')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

WhenDropdown.displayName = 'WhenDropdown';

export default WhenDropdown;
