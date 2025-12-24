import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DemoUser {
  id: string;
  name: string;
  avatar: string;
  tent: string;
  tripType: 'solo' | 'friends' | 'family';
  groupSize: number;
  ageRange: string;
  hasActiveBooking: boolean;
  campId: string;
  campName: string;
  checkIn: Date;
  checkOut: Date;
}

// Demo accounts
export const demoAccounts: DemoUser[] = [
  {
    id: 'demo1',
    name: 'คุณแคมป์',
    avatar: '🏕️',
    tent: 'Tent B',
    tripType: 'solo',
    groupSize: 1,
    ageRange: '25-29',
    hasActiveBooking: true,
    campId: '1',
    campName: 'Camp Doi Suthep',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000 * 2),
  },
  {
    id: 'demo2',
    name: 'ครอบครัวสุข',
    avatar: '👨‍👩‍👧',
    tent: 'Tent E',
    tripType: 'family',
    groupSize: 4,
    ageRange: '35-44',
    hasActiveBooking: true,
    campId: '1',
    campName: 'Camp Doi Suthep',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000 * 3),
  },
  {
    id: 'demo3',
    name: 'กลุ่มเพื่อน',
    avatar: '👥',
    tent: 'Tent F',
    tripType: 'friends',
    groupSize: 3,
    ageRange: '30-34',
    hasActiveBooking: true,
    campId: '1',
    campName: 'Camp Doi Suthep',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000),
  },
];

interface DemoAuthContextType {
  user: DemoUser | null;
  isLoggedIn: boolean;
  login: (accountId: string) => void;
  logout: () => void;
  hasActiveBooking: boolean;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'campy_demo_user';

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const account = demoAccounts.find(a => a.id === parsed.id);
        if (account) {
          setUser(account);
        }
      } catch (e) {
        console.error('Failed to parse demo user:', e);
      }
    }
  }, []);

  const login = (accountId: string) => {
    const account = demoAccounts.find(a => a.id === accountId);
    if (account) {
      setUser(account);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: account.id }));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DemoAuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        hasActiveBooking: user?.hasActiveBooking ?? false,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}
