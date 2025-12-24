import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GuestCounter from './GuestCounter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface GuestState {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface WhoDropdownProps {
  guests: GuestState;
  onGuestsChange: (guests: GuestState) => void;
}

const WhoDropdown = forwardRef<HTMLDivElement, WhoDropdownProps>(({ guests, onGuestsChange }, ref) => {
  const { t } = useTranslation();
  const [showServiceAnimalInfo, setShowServiceAnimalInfo] = useState(false);

  const updateGuests = (key: keyof GuestState, value: number) => {
    onGuestsChange({ ...guests, [key]: value });
  };

  return (
    <div
      ref={ref}
      className="bg-card rounded-3xl shadow-elevated border border-border overflow-hidden z-50 p-6 w-[320px]"
    >
      <GuestCounter
        label={t('guests.adults')}
        description={t('guests.adultsDesc')}
        value={guests.adults}
        min={1}
        max={16}
        onChange={(value) => updateGuests('adults', value)}
      />
      <GuestCounter
        label={t('guests.children')}
        description={t('guests.childrenDesc')}
        value={guests.children}
        min={0}
        max={16}
        onChange={(value) => updateGuests('children', value)}
      />
      <GuestCounter
        label={t('guests.infants')}
        description={t('guests.infantsDesc')}
        value={guests.infants}
        min={0}
        max={5}
        onChange={(value) => updateGuests('infants', value)}
      />
      <GuestCounter
        label={t('guests.pets')}
        description={t('guests.petsDesc')}
        value={guests.pets}
        min={0}
        max={5}
        onChange={(value) => updateGuests('pets', value)}
        onInfoClick={() => setShowServiceAnimalInfo(true)}
      />

      {/* Service Animals Info Modal */}
      <Dialog open={showServiceAnimalInfo} onOpenChange={setShowServiceAnimalInfo}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">{t('serviceAnimals.title', 'สัตว์ช่วยเหลือ')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Illustration */}
            <div className="flex justify-center">
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden">
                <div className="text-center p-6">
                  <span className="text-6xl">🦮</span>
                  <div className="mt-2 flex justify-center gap-2">
                    <span className="text-3xl">👨</span>
                    <span className="text-3xl">🧳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                {t('serviceAnimals.notPets', 'สัตว์ช่วยเหลือไม่ถือเป็นสัตว์เลี้ยง จึงไม่ต้องเพิ่มจำนวนที่นี่')}
              </p>
              <p>
                {t('serviceAnimals.emotionalSupport', 'หากคุณเดินทางพร้อมสัตว์ช่วยเหลือทางอารมณ์ สามารถดู')}{' '}
                <button className="underline text-foreground font-medium">
                  {t('serviceAnimals.accessibilityPolicy', 'นโยบายการเข้าถึง')}
                </button>
                {' '}{t('serviceAnimals.ofOurs', 'ของเรา')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

WhoDropdown.displayName = 'WhoDropdown';

export default WhoDropdown;
