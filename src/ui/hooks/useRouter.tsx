import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define the shape of our router context
interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper function to extract the path from the hash
const getHashPath = () => {
  // Remove the '#' from the string. If empty, default to '/'
  return window.location.hash.replace(/^#/, '') || '/';
};

// 2. The Router Provider component that wraps your app
export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    // Listen for hash changes instead of standard popstate
    const handleHashChange = () => {
      setPath(getHashPath());
    };

    // If the app loads without a hash, set it to the default '/'
    if (!window.location.hash) {
      window.location.hash = '/';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string) => {
    // Updating window.location.hash automatically triggers the 'hashchange' event,
    // which in turn updates the state via our event listener.
    window.location.hash = to;
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

// 3. The Custom useRouter Hook
export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a <Router /> provider');
  }
  return context;
}

// 4. A helper Route component for conditional rendering
export function Route({ path, element }: { path: string; element: React.ReactElement }) {
  const { path: currentPath } = useRouter();
  return currentPath === path ? element : null;
}