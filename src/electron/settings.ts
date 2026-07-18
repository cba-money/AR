import Store from 'electron-store';

import path from 'path';

// 2. Define default values
const defaults: AppSettings = {
  theme: 'dark',
  defaultExportPath: process.cwd(),
  tmpFolder: path.join(
    process.cwd(),
    'tmp'
  ),
  autoProcessingEnabled: false,
};

// 3. Initialize the store (electron-store safely handles production paths automatically)
const store = new Store<AppSettings>({ defaults });

//store.reset();

export const settingsManager = {
  getStore: () => store.store, // Returns the whole settings object
  get: <K extends keyof AppSettings>(key: K) => store.get(key),
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => store.set(key, value),
  // Merge partial updates with the existing settings to ensure all required fields are present
  updateAll: (newSettings: Partial<AppSettings>) =>
    store.set({ ...store.store, ...newSettings } as AppSettings),
  reset: () => store.reset(),
};