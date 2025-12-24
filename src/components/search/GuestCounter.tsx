import { forwardRef } from 'react';
import { Minus, Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuestCounterProps {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onInfoClick?: () => void;
}

const GuestCounter = forwardRef<HTMLDivElement, GuestCounterProps>(({
  label,
  description,
  value,
  min = 0,
  max = 16,
  onChange,
  onInfoClick,
}, ref) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div ref={ref} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-sm text-muted-foreground">{description}</p>
          {onInfoClick && (
            <button
              type="button"
              onClick={onInfoClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium text-foreground tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

GuestCounter.displayName = 'GuestCounter';

export default GuestCounter;
