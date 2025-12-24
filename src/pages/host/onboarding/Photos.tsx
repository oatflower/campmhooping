import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Star, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const Photos = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(onboardingData.images || []);
  const [coverIndex, setCoverIndex] = useState(onboardingData.coverImageIndex || 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex(coverIndex - 1);
    }
  };

  const setCover = (index: number) => {
    setCoverIndex(index);
  };

  const handleNext = () => {
    updateOnboardingData({
      images,
      coverImageIndex: coverIndex,
    });
    setCurrentPage(16);
    navigate('/host/onboarding/title');
  };

  const handleBack = () => {
    setCurrentPage(14);
    navigate('/host/onboarding/facilities');
  };

  const minPhotos = 5;
  const hasEnoughPhotos = images.length >= minPhotos;

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-3xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 2, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.photos.title')}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t('onboarding.photos.subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {t('onboarding.photos.minRequired', { count: minPhotos })}
          </p>

          {/* Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {images.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-foreground/50 hover:bg-secondary/30 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">{t('onboarding.photos.clickToAdd')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.photos.clickToAddEn')}
                </p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              {/* Image Grid */}
              <Reorder.Group
                axis="y"
                values={images}
                onReorder={setImages}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {images.map((image, index) => (
                    <Reorder.Item
                      key={image}
                      value={image}
                      as="div"
                      className={cn(
                        "relative aspect-[4/3] rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing",
                        index === coverIndex && "ring-2 ring-foreground ring-offset-2"
                      )}
                    >
                      <img
                        src={image}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {index === coverIndex && (
                        <div className="absolute top-2 left-2 bg-foreground text-background px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {t('onboarding.photos.cover')}
                        </div>
                      )}

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index !== coverIndex && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setCover(index)}
                            className="gap-1"
                          >
                            <Star className="w-3 h-3" />
                            {t('onboarding.photos.setAsCover')}
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          className="w-8 h-8"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Number Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                        {index + 1}
                      </div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>

              {/* Add More Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 hover:border-foreground/50 hover:bg-secondary/30 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>{t('onboarding.photos.addMore')}</span>
              </button>
            </div>
          )}

          {/* Progress Info */}
          <div className="mt-6 p-4 bg-secondary/50 rounded-xl flex items-center justify-between">
            <span className="text-sm">
              {t('onboarding.photos.photoCount', { current: images.length, min: minPhotos })}
            </span>
            {!hasEnoughPhotos && (
              <span className="text-sm text-orange-500">
                {t('onboarding.photos.needMore', { count: minPhotos - images.length })}
              </span>
            )}
            {hasEnoughPhotos && (
              <span className="text-sm text-green-500">
                {t('onboarding.photos.complete')}
              </span>
            )}
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-muted-foreground space-y-1"
          >
            <p>💡 <strong>{t('onboarding.photos.tips')}</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('onboarding.photos.tip1')}</li>
              <li>{t('onboarding.photos.tip2')}</li>
              <li>{t('onboarding.photos.tip3')}</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-16 bg-background border-t border-border">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!hasEnoughPhotos}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {t('onboarding.next')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Photos;
