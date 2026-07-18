import { useState, useEffect } from 'react';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        setIsLoading(true);
        // Call the Electron preload API
        const data: AppSettings = await window.electron.getSettings();
        
        if (isMounted) {
          setSettings(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  // Return the settings along with loading and error states for better UX control
  return { settings, isLoading, error, setSettings };
}