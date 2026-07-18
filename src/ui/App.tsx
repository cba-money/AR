"use client"

/*
  A/R Desktop Suite
  Main Application Component
*/

import { useEffect, useMemo, useState } from 'react';

import { Router, Route, useRouter } from '@/hooks/useRouter.tsx';

// Components
import Sidebar from "@/components/Sidebar.tsx";

// Pages
import Dashboard from "@/pages/Dashboard.tsx";
import About from "@/pages/About.tsx";
import SettingsPage from "@/pages/Settings.tsx";
import Reports from "@/pages/Reports.tsx";
import Utilities from "@/pages/Utilities.tsx";
import Weekly7ValidatorPage from "@/pages/Validator.tsx";

import Process from "@/pages/Process.tsx";
import Complete from "@/pages/Complete.tsx";
import ProcessingPage from '@/pages/Process.tsx';

export default function App() {
  //const [page, setPage] = useState('dashboard');

  /*
  const handlePageChange = (newPage: string) => {
    setPage(newPage);
  };
  */

  const routes = [
    {
      path: "/",
      element: <Dashboard />
    },
    {
      path: "/about",
      element: <About />
    },
    {
      path: "/settings",
      element: <SettingsPage />
    },
    {
      path: "/reports",
      element: <Reports />
    },
    {
      path: "/utilities",
      element: <Utilities />
    },
    {
      path: "/modules/validate",
      element: <Weekly7ValidatorPage />
    },
    {
      path: "/process",
      element: <ProcessingPage />
    },
    {
      path: "/process/complete",
      element: <Complete />
    }
  ]
  
  return (
    <Router>
      <section className="h-screen flex bg-muted/30">

        {/* Sidebar */}

        <Sidebar />

        {/* Main Content */}

        <main className="flex-1 p-8 overflow-auto">
        
          {/*
            {page === "dashboard" && <Dashboard onUpdatePage={handlePageChange} />}
            {page === "about" && <About onUpdatePage={handlePageChange} />}
            {page === "settings" && <SettingsPage onUpdatePage={handlePageChange} />}
            {page === "reports" && <Reports onUpdatePage={handlePageChange} />}
            {page === "utilities" && <Utilities onUpdatePage={handlePageChange} />}
            {page === "modules/validate" && <Weekly7ValidatorPage onUpdatePage={handlePageChange} />}
            {page === "process" && <Process onUpdatePage={handlePageChange} />}
            {page === "complete" && <Complete onUpdatePage={handlePageChange} />}
          */}
          {
            routes.map((route, index) => {
              return (
                <article key={index}>
                  <Route path={route.path} element={route.element} />
                </article>
              )
            })
          }

        </main>

      </section>
    </Router>
  );
}
