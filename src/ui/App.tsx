"use client"

/*
  A/R Desktop Suite
  Main Application Component
*/

//import { useEffect, useMemo, useState } from 'react';
import { lazy, Suspense, useEffect } from 'react';

import "./App.css";

import { Router, Route, useRouter } from '@/hooks/useRouter.tsx';
import { useAppSettings } from "@/hooks/useAppSettings.ts";
import { useTheme } from "@/providers/theme-provider.tsx";

import { Toaster } from "@/components/ui/sonner.tsx";

import { Card, CardContent } from '@/components/ui/card.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'

// Components
import Sidebar from "@/components/Sidebar.tsx";


const Dashboard = lazy(() => import("@/pages/Dashboard.tsx"));
const About = lazy(() => import("@/pages/About.tsx"));
const SettingsPage = lazy(() => import("@/pages/Settings.tsx"));
const Reports = lazy(() => import("@/pages/Reports.tsx"));
const Utilities = lazy(() => import("@/pages/Utilities.tsx"));
const Weekly7ValidatorPage = lazy(() => import("@/pages/utilities/Validator.tsx"));
const Weekly7MergePage = lazy(() => import("@/pages/utilities/Merge.tsx"));
const ChecksRegisterAuditorPage = lazy(() => import("@/pages/utilities/Checks.tsx"));
const ProcessingPage = lazy(() => import('@/pages/Process.tsx'));
const Complete = lazy(() => import("@/pages/Complete.tsx"));

const ROUTES_CONFIG = [
  { path: "/", element: <Dashboard /> },
  { path: "/about", element: <About /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/reports", element: <Reports /> },
  { path: "/utilities", element: <Utilities /> },
  { path: "/utils/validate", element: <Weekly7ValidatorPage /> },
  { path: "/utils/checks", element: <ChecksRegisterAuditorPage /> },
  { path: "/utils/merge", element: <Weekly7MergePage /> },
  { path: "/process", element: <ProcessingPage /> },
  { path: "/process/complete", element: <Complete /> }
];

export default function App() {

  const { settings, isLoading, error } = useAppSettings();
  const { theme, setTheme } = useTheme();

 useEffect(() => {
    if (settings?.theme && settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings?.theme, theme, setTheme]);

  const PageLoader = () => (
    <Card className='relative w-full h-full bg-gray-200 border-0 select-none opacity-50'>
      <CardContent className='space-y-3 p-4 border-0'>
        <h3 className='text-sm font-medium'>Dashboard Overview</h3>
        <p className='text-muted-foreground text-sm'>Monthly revenue and user statistics for the current period.</p>
        <div className='grid grid-cols-2 gap-4 border-0'>
          <div className='rounded-md border-0 p-3'>
            <p className='text-muted-foreground text-xs'>Revenue</p>
            <p className='text-lg font-medium'>$12,450</p>
          </div>
          <div className='rounded-md border-0 p-3'>
            <p className='text-muted-foreground text-xs'>Users</p>
            <p className='text-lg font-medium'>1,234</p>
          </div>
        </div>
      </CardContent>
      {/* Overlay */}
      <Card className='bg-transparent absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs border-0'>
        <CardContent className='flex grow flex-col items-center justify-center gap-2 border-0'>
          <Spinner className='size-6 opacity-90' />
          <p className='text-gray-700 text-md font-medium animate-pulse'>
            Loading...
          </p>
        </CardContent>
      </Card>
    </Card>
  );
  
  return (
    <Router>
      <section className="h-screen flex bg-muted/30 dark:bg-gray-900">

        {/* Sidebar */}

        <Sidebar />

        {/* Main Content */}

        <main className="flex-1 p-8 overflow-auto">
          <Suspense fallback={<PageLoader />}>
            {
              ROUTES_CONFIG.map((route) => {
                return (
                    <Route
                      key={route.path} 
                      path={route.path} 
                      element={route.element}
                    />
                )
              })
            }
          </Suspense>
        </main>

      </section>
      <Toaster />
    </Router>
  );
}
