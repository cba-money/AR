import { Button } from "@/components/ui/button.tsx";

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

export default function Sidebar({ onUpdatePage }: { onUpdatePage: (page: string) => void }) {

    return (
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

          <Button onClick={() => onUpdatePage('dashboard')} variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <Button onClick={() => onUpdatePage('about')} variant="ghost" className="w-full justify-start">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            About A/R Formatter
          </Button>

          <Button onClick={() => onUpdatePage('validator')} variant="ghost" className="w-full justify-start">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Weekly 7 Validator
          </Button>

          <Button onClick={() => onUpdatePage('reports')} variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>

          <Button onClick={() => onUpdatePage('utilities')} variant="ghost" className="w-full justify-start">
            <Wrench className="mr-2 h-4 w-4" />
            Utilities
          </Button>

          <Button onClick={() => onUpdatePage('settings')} variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

        </nav>
      </aside>
    );

}