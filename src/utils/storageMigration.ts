// src/utils/storageMigration.ts

const STORAGE_VERSION = '2025-02-prod'; // bump version
const VERSION_KEY = 'APP_STORAGE_VERSION';

export function runStorageMigration() {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion !== STORAGE_VERSION) {
      console.info('[StorageMigration] Running one-time cleanup');

      localStorage.clear();

      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch (err) {
    // Fail-safe: do NOT break the app
    console.warn('[StorageMigration] Failed safely', err);
  }
}
