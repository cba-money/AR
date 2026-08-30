import { useRouter } from '@/hooks/useRouter.tsx';

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
import { ReactElement } from "react";

type NavItems = {
  label: string,
  icon: ReactElement,
  url: string,
  title?: string,
};

export default function Sidebar() {

    const { navigate, path } = useRouter();

    const nav: NavItems[] = [
      {
        label: "Dashboard",
        icon: <Home className="mr-2 h-4 w-4" />,
        url: '/',
        title: "Go back to main screen"
      },
      {
        label: "About A/R Suite",
        icon: <FileSpreadsheet className="mr-2 h-4 w-4" />,
        url: '/about',
        title: "Learn more about this app"
      },
      {
        label: "Reports",
        icon: <BarChart3 className="mr-2 h-4 w-4" />,
        url: '/reports'
      },
      {
        label: "Utilities",
        icon: <Wrench className="mr-2 h-4 w-4" />,
        url: '/utilities',
        title: "View utilities installed and optionally install others"
      },
      {
        label: "Settings",
        icon: <Settings className="mr-2 h-4 w-4" />,
        url: '/settings',
        title: "Adjust the settings for this app"
      }
    ];

    /*
      Removed:
      {
        label: "Weekly 7 Validator",
        icon: <ClipboardCheck className="mr-2 h-4 w-4" />,
        url: '/modules/validate',
        title: "Validate format of Weekly 7 file"
      },
    */

    return (
      <aside className="w-64 border-r bg-background dark:bg-gray-800">
        <div className="p-6 select-none">
          <h1 className="text-xl font-bold" aria-label="App Name">
            A/R Desktop Suite
          </h1>
          <p className="text-sm text-muted-foreground">
            C Berman Associates
          </p>
        </div>

        <Separator />

        <nav className="p-3 space-y-2" aria-label="Main Navigation">

          {
            nav.map((item, index) => {
              return (
                <Button
                  key={index}
                  onClick={() => navigate(item.url)}
                  variant="ghost" 
                  className={`w-full justify-start dark:hover:bg-gray-600 ${path == item.url ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700" : ""}`}
                  aria-label={item.label}
                  title={item.title}
                >
                  {item.icon}
                  
                  {item.label}
                </Button>
              );
            })
          }

        </nav>
      </aside>
    );

}