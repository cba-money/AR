"use client"

/*
import { useEffect, useMemo, useState } from 'react';
import './App.css';
//import { useStatistics } from './useStatistics.ts';

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

import { ArForm } from "@/components/ArForm.tsx";

function App() {
  //const staticData = useStaticData();
  //const statistics = useStatistics(10);
  const [activeView, setActiveView] = useState<View>('CPU');
  const cpuUsages = useMemo(
    () => statistics.map((stat) => stat.cpuUsage),
    [statistics]
  );
  const ramUsages = useMemo(
    () => statistics.map((stat: any) => stat.ramUsage),
    [statistics]
  );
  const storageUsages = useMemo(
    () => statistics.map((stat: any) => stat.storageUsage),
    [statistics]
  );
  const activeUsages = useMemo(() => {
    switch (activeView) {
      case 'CPU':
        return cpuUsages;
      case 'RAM':
        return ramUsages;
      case 'STORAGE':
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages]);

  useEffect(() => {
    return window.electron.subscribeChangeView((view) => setActiveView(view));
  }, []);

  return (
    <div className="App">
      <Header />
      <div className="main">
        <div>            onClick={() => setActiveView('CPU')}
            title="CPU"
            view="CPU"
            subTitle={staticData?.cpuModel ?? ''}
            data={cpuUsages}
          />
          <SelectOption
            onClick={() => setActiveView('RAM')}
            title="RAM"
            view="RAM"
            subTitle={(staticData?.totalMemoryGB.toString() ?? '') + ' GB'}
            data={ramUsages}
          />
          <SelectOption
            onClick={() => setActiveView('STORAGE')}
            title="STORAGE"
            view="STORAGE"
            subTitle={(staticData?.totalStorage.toString() ?? '') + ' GB'}
            data={storageUsages}
          />
        </div>
        <div className="mainGrid">
          <ArForm />
        </div>
      </div>
    </div>
  );
}

function SelectOption(props: {
  title: string;
  view: View;
  subTitle: string;
  data: number[];
  onClick: () => void;
}) {
  return (
    <Button variant="outline">
      Hello World
    </Button>
  );
}

function Header() {
  return (
    <header>
      
    </header>
  );
}

/*
function useStaticData() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      setStaticData(await window.electron.getStaticData());
    })();
  }, []);

  return staticData;
}
*/

import { useEffect, useMemo, useState } from 'react';

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Home,
  FileSpreadsheet,
  ClipboardCheck,
  BarChart3,
  Wrench,
  Settings,
  Upload,
  FolderOpen,
} from "lucide-react";

import Dashboard from "@/pages/Dashboard.tsx";
import About from "@/pages/About.tsx";

export default function App() {
  const [page, setPage] = useState('dashboard');
  
  return (
    <div className="h-screen flex bg-muted/30">

      {/* Sidebar */}

      <aside className="w-64 border-r bg-background">
        <div className="p-6">
          <h1 className="text-xl font-bold">
            A/R Desktop Suite
          </h1>
          <p className="text-sm text-muted-foreground">
            C Berman Associates
          </p>
        </div>

        <Separator />

        <nav className="p-3 space-y-2">

          <Button onClick={() => setPage('dashboard')} variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <Button onClick={() => setPage('about')} variant="ghost" className="w-full justify-start">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            About A/R Formatter
          </Button>

          <Button onClick={() => setPage('validator')} variant="ghost" className="w-full justify-start">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Weekly 7 Validator
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <Wrench className="mr-2 h-4 w-4" />
            Utilities
          </Button>

          <Button onClick={() => setPage('settings')} variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

        </nav>
      </aside>

      {/* Main */}

      <main className="flex-1 p-8 overflow-auto">

        {page === "dashboard" && <Dashboard />}
        {page === "about" && <About />}
        {page === "settings" && <Settings />}

      </main>

    </div>
  );
}
