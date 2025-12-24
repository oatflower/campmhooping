import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    setScale(1);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-card/50 hover:bg-card"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/50 rounded-full px-3 py-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card/50 hover:bg-card"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card/50 hover:bg-card"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain cursor-grab active:cursor-grabbing"
              style={{ scale }}
              drag={scale > 1}
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            />
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-card/50 rounded-xl p-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setScale(1); }}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    idx === currentIndex ? "border-primary" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-card/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
