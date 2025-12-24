import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '@/contexts/HostContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const provinces = [
  'กรุงเทพมหานคร', 'เชียงใหม่', 'เชียงราย', 'แม่ฮ่องสอน', 'น่าน', 'พะเยา',
  'ลำปาง', 'ลำพูน', 'แพร่', 'อุตรดิตถ์', 'ตาก', 'สุโขทัย', 'พิษณุโลก',
  'กาญจนบุรี', 'ราชบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์', 'ชุมพร', 'ระนอง',
  'สุราษฎร์ธานี', 'พังงา', 'กระบี่', 'ภูเก็ต', 'นครราชสีมา', 'ขอนแก่น',
  'อุดรธานี', 'เลย', 'หนองคาย', 'บึงกาฬ', 'นครนายก', 'ปราจีนบุรี',
  'สระแก้ว', 'จันทบุรี', 'ตราด', 'ระยอง', 'ชลบุรี',
];

const Location = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, setCurrentPage } = useHost();
  const [searchQuery, setSearchQuery] = useState('');

  const handleProvinceSelect = (province: string) => {
    updateOnboardingData({
      location: {
        ...onboardingData.location,
        province,
      },
    });
  };

  const handleAddressChange = (address: string) => {
    updateOnboardingData({
      location: {
        ...onboardingData.location,
        address,
      },
    });
  };

  const handleNext = () => {
    if (onboardingData.location.province) {
      setCurrentPage(4);
      navigate('/host/onboarding/location-confirm');
    }
  };

  const handleBack = () => {
    setCurrentPage(2);
    navigate('/host/onboarding/camp-type');
  };

  const filteredProvinces = provinces.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 container max-w-2xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground mb-2">{t('onboarding.stepOf', { current: 1, total: 3 })}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('onboarding.location.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('onboarding.location.subtitle')}
          </p>

          {/* Address Input */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">{t('onboarding.location.address')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder={t('onboarding.location.addressPlaceholder')}
                  value={onboardingData.location.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Province Selection */}
            <div className="space-y-2">
              <Label>{t('onboarding.location.province')}</Label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t('onboarding.location.searchProvince')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                {filteredProvinces.map((province) => (
                  <button
                    key={province}
                    onClick={() => handleProvinceSelect(province)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      onboardingData.location.province === province
                        ? 'bg-foreground text-background'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    {province}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">{t('onboarding.location.district')}</Label>
              <Input
                id="district"
                placeholder={t('onboarding.location.districtPlaceholder')}
                value={onboardingData.location.district}
                onChange={(e) =>
                  updateOnboardingData({
                    location: {
                      ...onboardingData.location,
                      district: e.target.value,
                    },
                  })
                }
                className="h-12"
              />
            </div>
          </div>
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
            disabled={!onboardingData.location.province}
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

export default Location;
