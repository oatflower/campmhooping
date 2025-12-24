import { useMemo } from 'react';
import { Camp } from '@/types/camp';
import { cn } from '@/lib/utils';

interface PriceHistogramProps {
  camps: Camp[];
  minPrice: number;
  maxPrice: number;
  selectedRange: [number, number];
}

const PriceHistogram = ({ camps, minPrice, maxPrice, selectedRange }: PriceHistogramProps) => {
  const NUM_BINS = 40;

  const histogram = useMemo(() => {
    const binWidth = (maxPrice - minPrice) / NUM_BINS;
    const bins = Array(NUM_BINS).fill(0);

    camps.forEach(camp => {
      const binIndex = Math.min(
        Math.floor((camp.pricePerNight - minPrice) / binWidth),
        NUM_BINS - 1
      );
      if (binIndex >= 0 && binIndex < NUM_BINS) {
        bins[binIndex]++;
      }
    });

    const maxCount = Math.max(...bins, 1);
    return bins.map((count, index) => {
      const binStart = minPrice + index * binWidth;
      const binEnd = binStart + binWidth;
      const isInRange = binStart >= selectedRange[0] && binEnd <= selectedRange[1];
      return {
        count,
        height: (count / maxCount) * 100,
        isInRange,
      };
    });
  }, [camps, minPrice, maxPrice, selectedRange]);

  return (
    <div className="flex items-end justify-between h-20 gap-[1px]">
      {histogram.map((bin, index) => (
        <div
          key={index}
          className={cn(
            "flex-1 rounded-t-sm transition-all duration-200",
            bin.isInRange 
              ? "bg-rose-500" 
              : "bg-rose-500/30"
          )}
          style={{ height: `${Math.max(bin.height, 2)}%` }}
        />
      ))}
    </div>
  );
};

export default PriceHistogram;