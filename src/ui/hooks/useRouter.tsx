import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define the shape of our router context
interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// 2. The Router Provider component that wraps your app
export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for browser back/forward navigation
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to); // Trigger re-render
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