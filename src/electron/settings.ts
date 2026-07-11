import Store from 'electron-store';

// 2. Define default values
const defaults: AppSettings = {
  theme: 'dark',
  defaultExportPath: '/var/www/html',
  autoProcessingEnabled: false,
};

// 3. Initialize the store (electron-store safely handles production paths automatically)
const store = new Store<AppSettings>({ defaults });

export const settingsManager = {
  getStore: () => store.store, // Returns the whole settings object
  get: <K extends keyof AppSettings>(key: K) => store.get(key),
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => store.set(key, value),
  // Merge partial updates with the existing settings to ensure all required fields are present
  updateAll: (newSettings: Partial<AppSettings>) =>
    store.set({ ...store.store, ...newSettings } as AppSettings),
};