import { Camp } from '@/types/camp';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CampCard from '@/components/CampCard';
import CampCardSkeleton from '@/components/CampCardSkeleton';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CampSectionProps {
  title: string;
  icon: string;
  camps: Camp[];
  categoryId: string;
}

const CampSection = ({ title, icon, camps, categoryId }: CampSectionProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for smooth skeleton animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (camps.length === 0) return null;

  const maxCamps = 10;
  const displayCamps = camps.slice(0, maxCamps);
  const hasMore = camps.length > maxCamps;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Get first 3 camp images for stacked preview
  const stackedImages = camps.slice(0, 3).map(c => c.image);

  return (
    <section className="py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
        ) : (
          <Link
            to={`/category/${categoryId}`}
            className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">{icon}</span>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            <span className="text-sm text-muted-foreground">({camps.length})</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
        )}
        
        {/* Arrow Buttons - Top Right (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border"
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border"
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[72vw] sm:w-[260px] md:w-[280px] flex-shrink-0 snap-start animate-fade-in">
                  <CampCardSkeleton />
                </div>
              ))}
            </>
          ) : (
            // Loaded state with animation
            <>
              {displayCamps.map((camp, index) => (
                <div 
                  key={camp.id} 
                  className="w-[72vw] sm:w-[260px] md:w-[280px] flex-shrink-0 snap-start animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CampCard camp={camp} index={index} />
                </div>
              ))}

              {/* See All Card with Stacked Images */}
              {hasMore && (
                <Link
                  to={`/category/${categoryId}`}
                  className="w-[72vw] sm:w-[260px] md:w-[280px] flex-shrink-0 snap-start animate-fade-in"
                  style={{ animationDelay: `${displayCamps.length * 50}ms` }}
                >
                  <div className="rounded-xl md:rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group hover:border-primary/50 overflow-hidden">
                    {/* Image area - same aspect ratio as CampCard */}
                    <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                      {/* Stacked Images */}
                      <div className="relative w-28 h-20">
                        {stackedImages.map((img, idx) => (
                          <div
                            key={idx}
                            className={`absolute w-16 h-16 rounded-lg shadow-lg overflow-hidden border-2 border-background transition-all duration-300 ease-out group-hover:shadow-xl
                              ${idx === 0 ? 'group-hover:-rotate-[18deg] group-hover:-translate-x-2 group-hover:scale-105' : ''}
                              ${idx === 1 ? 'group-hover:rotate-0 group-hover:scale-110' : ''}
                              ${idx === 2 ? 'group-hover:rotate-[18deg] group-hover:translate-x-2 group-hover:scale-105' : ''}
                            `}
                            style={{
                              left: `${idx * 18}px`,
                              top: `${idx * 3}px`,
                              zIndex: 3 - idx,
                              transform: `rotate(${(idx - 1) * 6}deg)`,
                            }}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content area - similar padding to CampCard */}
                    <div className="pt-2 md:pt-3 px-1 pb-3 space-y-0.5">
                      <p className="font-semibold text-foreground text-sm md:text-[15px] group-hover:text-primary transition-colors">
                        {t('sections.seeMore')}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {camps.length - maxCamps}+ {t('common.camps')}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CampSection;
