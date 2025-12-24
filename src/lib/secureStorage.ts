/**
 * Secure Local Storage Utility
 * Provides encrypted storage with automatic expiry for privacy compliance
 */

// Simple XOR-based obfuscation (not cryptographically secure, but adds protection)
// For production, consider using Web Crypto API or a library like crypto-js
const STORAGE_KEY_PREFIX = 'campii_';
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days default

interface StoredData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

/**
 * Simple obfuscation function
 * Note: This is NOT encryption - it's obfuscation to prevent casual inspection
 * For true security, use Web Crypto API with proper key management
 */
function obfuscate(data: string): string {
  const key = 'campii_privacy_2025';
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result); // Base64 encode for safe storage
}

function deobfuscate(data: string): string {
  const key = 'campii_privacy_2025';
  let decoded: string;
  try {
    decoded = atob(data); // Base64 decode
  } catch {
    return data; // If not base64, return as-is (legacy data)
  }
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Set a value in secure storage with expiry
 */
export function secureSet<T>(
  key: string,
  value: T,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const now = Date.now();
  const stored: StoredData<T> = {
    data: value,
    timestamp: now,
    expiresAt: now + ttlMs,
    version: '1.0',
  };

  const serialized = JSON.stringify(stored);
  const obfuscated = obfuscate(serialized);

  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, obfuscated);
  } catch (e) {
    console.error('Failed to save to secure storage:', e);
  }
}

/**
 * Get a value from secure storage, returning null if expired or not found
 */
export function secureGet<T>(key: string): T | null {
  try {
    const obfuscated = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!obfuscated) return null;

    const serialized = deobfuscate(obfuscated);
    const stored: StoredData<T> = JSON.parse(serialized);

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      secureRemove(key);
      return null;
    }

    return stored.data;
  } catch (e) {
    console.error('Failed to read from secure storage:', e);
    return null;
  }
}

/**
 * Remove a value from secure storage
 */
export function secureRemove(key: string): void {
  localStorage.removeItem(STORAGE_KEY_PREFIX + key);
}

/**
 * Clear all secure storage items
 */
export function secureClearAll(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Clean up expired items (run periodically)
 */
export function cleanupExpired(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const obfuscated = localStorage.getItem(key);
        if (!obfuscated) return;

        const serialized = deobfuscate(obfuscated);
        const stored: StoredData<unknown> = JSON.parse(serialized);

        if (Date.now() > stored.expiresAt) {
          localStorage.removeItem(key);
        }
      } catch {
        // Remove corrupted entries
        localStorage.removeItem(key);
      }
    }
  });
}

/**
 * Get metadata about stored item (for privacy dashboard)
 */
export function getStorageMetadata(key: string): {
  exists: boolean;
  createdAt?: Date;
  expiresAt?: Date;
} {
  try {
    const obfuscated = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!obfuscated) return { exists: false };

    const serialized = deobfuscate(obfuscated);
    const stored: StoredData<unknown> = JSON.parse(serialized);

    return {
      exists: true,
      createdAt: new Date(stored.timestamp),
      expiresAt: new Date(stored.expiresAt),
    };
  } catch {
    return { exists: false };
  }
}

// TTL presets for different data types
export const TTL = {
  SESSION: 24 * 60 * 60 * 1000, // 1 day
  SHORT: 7 * 24 * 60 * 60 * 1000, // 7 days
  MEDIUM: 30 * 24 * 60 * 60 * 1000, // 30 days
  LONG: 90 * 24 * 60 * 60 * 1000, // 90 days
  CONSENT: 365 * 24 * 60 * 60 * 1000, // 1 year (for consent records)
};

// Run cleanup on module load
if (typeof window !== 'undefined') {
  cleanupExpired();
}
