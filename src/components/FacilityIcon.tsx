import { useTranslation } from 'react-i18next';

interface FacilityIconProps {
  facility: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'compact';
}

// Map facility keys to emojis and translation keys
const facilityConfig: Record<string, { emoji: string; key: string }> = {
  // Bathroom
  'ห้องน้ำสะอาด': { emoji: '🚿', key: 'cleanBathroom' },
  'ห้องน้ำ': { emoji: '🚻', key: 'bathroom' },
  'ห้องน้ำส่วนตัว': { emoji: '🛁', key: 'privateBathroom' },
  'น้ำอุ่น': { emoji: '♨️', key: 'hotWater' },

  // Electricity & Connectivity
  'ไฟฟ้า': { emoji: '🔌', key: 'electricity' },
  'wifi': { emoji: '📶', key: 'wifi' },
  'สัญญาณมือถือ': { emoji: '📱', key: 'mobileSignal' },

  // Transportation & Parking
  'ที่จอดรถ': { emoji: '🅿️', key: 'parking' },
  'รถ Camper': { emoji: '🚐', key: 'camperFriendly' },

  // Food & Drinks
  'ร้านอาหาร': { emoji: '🍽️', key: 'restaurant' },
  'คาเฟ่': { emoji: '☕', key: 'cafe' },
  'อาหารเช้า': { emoji: '🍳', key: 'breakfast' },
  'BBQ': { emoji: '🍖', key: 'bbqArea' },
  'ทำอาหารได้': { emoji: '👨‍🍳', key: 'cookingAllowed' },

  // Nature & Environment
  'ธรรมชาติ': { emoji: '🌲', key: 'nature' },
  'ริมน้ำ': { emoji: '🌊', key: 'riverside' },
  'วิวภูเขา': { emoji: '🏔️', key: 'mountainView' },
  'ทะเลหมอก': { emoji: '☁️', key: 'seaOfMist' },
  'ดูดาว': { emoji: '🌌', key: 'stargazing' },

  // Accommodation
  'แอร์': { emoji: '❄️', key: 'airCon' },
  'พัดลม': { emoji: '🌀', key: 'fan' },
  'เต็นท์ให้เช่า': { emoji: '⛺', key: 'tentRental' },
  'ผ้าใบ': { emoji: '🏕️', key: 'tarpAvailable' },

  // Activities & Services
  'ไกด์': { emoji: '🧭', key: 'tourGuide' },
  'กิจกรรม': { emoji: '🎯', key: 'activities' },
  'สัตว์เลี้ยง': { emoji: '🐕', key: 'petsAllowed' },

  // Rules
  'สูบบุหรี่ได้': { emoji: '🚬', key: 'smokingAllowed' },
  'เปิดเพลงได้': { emoji: '🎵', key: 'musicAllowed' },
  'ดื่มแอลกอฮอล์ได้': { emoji: '🍺', key: 'alcoholAllowed' },
};

const FacilityIcon = ({ facility, size = 'md', showLabel = true, variant = 'default' }: FacilityIconProps) => {
  const { t } = useTranslation();
  const config = facilityConfig[facility];
  const emoji = config?.emoji || '✨';
  const label = config ? t(`facilities.${config.key}`) : facility;

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className={sizeClasses[size]}>{emoji}</span>
        {showLabel && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
      <span className={`${sizeClasses[size]}`}>{emoji}</span>
      {showLabel && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </div>
  );
};

export default FacilityIcon;
