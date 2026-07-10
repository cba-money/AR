"use client"

/*
  A/R Desktop Suite
  Main Application Component
*/

import { useEffect, useMemo, useState } from 'react';

// Components
import Sidebar from "@/components/Sidebar.tsx";

// Pages
import Dashboard from "@/pages/Dashboard.tsx";
import About from "@/pages/About.tsx";
import SettingsPage from "@/pages/Settings.tsx";
import Reports from "@/pages/Reports.tsx";
import Utilities from "@/pages/Utilities.tsx";
import Process from "@/pages/Process.tsx";
import Complete from "@/pages/Complete.tsx";

export default function App() {
  const [page, setPage] = useState('dashboard');

  const handlePageChange = (newPage: string) => {
    setPage(newPage);
  };
  
  return (
    <section className="h-screen flex bg-muted/30">

      {/* Sidebar */}

      <Sidebar onUpdatePage={handlePageChange} />

      {/* Main */}

      <main className="flex-1 p-8 overflow-auto">

        {page === "dashboard" && <Dashboard onUpdatePage={handlePageChange} />}
        {page === "about" && <About onUpdatePage={handlePageChange} />}
        {page === "settings" && <SettingsPage onUpdatePage={handlePageChange} />}
        {page === "reports" && <Reports onUpdatePage={handlePageChange} />}
        {page === "utilities" && <Utilities onUpdatePage={handlePageChange} />}
        {page === "process" && <Process onUpdatePage={handlePageChange} />}
        {page === "complete" && <Complete onUpdatePage={handlePageChange} />}

      </main>

    </section>
  );
}
