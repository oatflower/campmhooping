import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recently_viewed_camps';
const MAX_RECENT_ITEMS = 10;

export const useRecentlyViewed = () => {
    const [recentIds, setRecentIds] = useState<string[]>([]);

    useEffect(() => {
        // Load from local storage on mount
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setRecentIds(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recently viewed camps', e);
            }
        }
    }, []);

    const addCamp = (campId: string) => {
        setRecentIds(prev => {
            // Remove if already exists to move it to the top
            const filtered = prev.filter(id => id !== campId);
            // Add to front
            const newer = [campId, ...filtered].slice(0, MAX_RECENT_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newer));
            return newer;
        });
    };

    const getRecentCamps = () => recentIds;

    return {
        recentIds,
        addCamp,
        getRecentCamps
    };
};
