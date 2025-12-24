import { useRef, useState, useEffect } from 'react';
import { Camp } from '@/types/camp';
import CampCard from './CampCard';
import PriceNoticeBanner from './PriceNoticeBanner';
import { cn } from '@/lib/utils';

interface MapListingSheetProps {
  camps: Camp[];
  onCampHover?: (campId: string | null) => void;
}

const MapListingSheet = ({ camps, onCampHover }: MapListingSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(300); // Initial height
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const minHeight = 150;
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 500;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeight.current = sheetHeight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = startY.current - e.touches[0].clientY;
    const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight.current + deltaY));
    setSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Snap to positions
    if (sheetHeight < 200) {
      setSheetHeight(minHeight);
    } else if (sheetHeight > maxHeight * 0.6) {
      setSheetHeight(maxHeight);
    } else {
      setSheetHeight(300);
    }
  };

  return (
    <div
      ref={sheetRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-40",
        "transition-height duration-300 ease-out md:hidden"
      )}
      style={{ height: sheetHeight }}
    >
      {/* Drag Handle */}
      <div
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
      </div>

      {/* Price Notice */}
      <PriceNoticeBanner />

      {/* Camp List */}
      <div 
        className="overflow-y-auto px-4 pb-20"
        style={{ height: sheetHeight - 80 }}
      >
        <div className="space-y-4">
          {camps.map((camp, index) => (
            <CampCard
              key={camp.id}
              camp={camp}
              index={index}
              onHover={onCampHover}
              variant="list"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapListingSheet;
