import { useState, useEffect } from "react";

import { useRouter } from '@/hooks/useRouter.tsx';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { set } from "date-fns/set";

type AboutModule = {
  name: string;
  description: string;
  longDescription?: string;
  version?: string;
};

type ThirdPartySoftware = {
  name: string;
  links?: {
    npm?: string;
    docs?: string;
    github?: string;
    website?: string;
  }
};

export default function About() {
  const { navigate, path } = useRouter();
  const [appVersion, setAppVersion] = useState("0.0.0");
  const [appEnvironment, setAppEnvironment] = useState("Unknown");
  const [appPlatform, setAppPlatform] = useState("Unknown");

  const includedModules: AboutModule[] = [
    {
      name: "A/R Formatter",
      description: "Formats and standardizes Accounts Receivable spreadsheets.",
      longDescription: `The formatter takes in a Weekly 7 spreadsheet and an A/R to date. It then creates a 4 month spread (or range) which it uses to trim the Weekly 7 file. It then flattens all formulas, adds a header row, and generates an output Excel sheet within the given range.`,
    },
    {
      name: 'A/R Processor',
      description: "Processes formatted spreadsheets to calculate outstanding A/R monthly and grand totals.",
    },
    {
      name: 'A/R Batch Processor',
      description: 'Allows for batch processing of Weekly 7 spreadsheets.'
    },
    {
      name: 'Weekly 7 Validator',
      description: 'Validates formatting and data consistency in Weekly 7 spreadsheets.'
    },
    {
      name: 'Weekly 7 Merge Utility',
      description: 'Merges multiple Weekly 7 spreadsheets into a single spreadsheet.'
    },
    {
      name: 'Check Run Auditor',
      description: 'Compares check registers and payment files for discrepancies.'
    },
    {
      name: 'Reports',
      description: 'Generates operational and reconciliation reports.'
    }
  ];

  const softwareList: ThirdPartySoftware[] = [
    {
      name: "Electron",
      links: {
        github: "https://github.com/electron/electron",
        npm: "https://www.npmjs.com/package/electron",
        website: "https://www.electronjs.org/"
      }
    },
    {
      name: "React",
      links: {
        github: "https://github.com/react/react",
        npm: "https://www.npmjs.com/package/react",
        website: "https://react.dev/"
      }
    }
  ];

  async function displayAppVersion() {
    try {
      const version = await window.electron.getAppVersion();
      //console.log(`Current App Version: v${version}`); // Output: "Current App Version: v1.0.0"
      setAppVersion(version);
    } catch (error) {
      //console.error("Failed to get version:", error);
      setAppVersion("0.0.0");
    }
  }

  async function getAppEnvironment() {
      try{
        const environment = await window.electron.getEnvironment();
        setAppEnvironment(environment.charAt(0).toUpperCase() + environment.slice(1));
      } catch (error) {{
        setAppEnvironment("Development");
      }
    }
  }

  async function getOsPlatform() {
    try{
      const platform = await window.electron.getOsPlatform();
      setAppPlatform(platform.charAt(0).toUpperCase() + platform.slice(1));
    } catch (error) {{
      setAppPlatform("Unknown");
    }
  }
}

  useEffect(() => {
    displayAppVersion();
    getAppEnvironment();
    getOsPlatform();
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">

      <div>
        <h1 className="text-4xl font-bold select-none">
          About A/R Desktop Suite
        </h1>
        <p className="text-muted-foreground mt-2 select-none">
          Professional Excel automation tools for Accounts Receivable operations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="select-none">
            Application Information
          </CardTitle>
          <CardDescription className="select-none">
            Current installation details
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="select-none">
              Application
            </span>
            <Badge className="select-none">
              A/R Desktop Suite
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="select-none">
              Version
            </span>
            <span className="select-all">
              {appVersion}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="select-none">
              Build
            </span>
            <span className="select-all">
              {appEnvironment}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="select-none">
              Platform
            </span>
            <span className="select-all">
              {appPlatform}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="select-none">
            Getting Started
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Select the desired tool from the navigation menu.</li>
            <li>Choose one or more Excel workbooks.</li>
            <li>Configure any processing options.</li>
            <li>Click <strong>Process</strong>.</li>
            <li>Review the generated output in your selected destination folder.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="select-none">
            Included Modules
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
          {
            includedModules.map((module, index) => {
              return (
                <li key={index}>
                  <div>
                    <strong>
                      {module.name}
                    </strong>
                    <p className="text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  {
                    (index < includedModules.length-1) ? (<Separator className="my-4" />) : ""
                  }
                </li>
              )
            })
          }
          </ul>

        </CardContent>
      </Card>

      <Card>
        <CardHeader className="select-none">
          <CardTitle>Third-Party Software</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          {
            softwareList.map((item, index) => {
              return (
                <div key={index}>
                <p>
                  {item.name}
                </p>
                {/*item.links?.website ? (
                    <a target="_parent" href={item.links?.website}>
                      Website
                    </a>
                  ) : ""*/}
                </div>
              );
            })
          }
          <p>Electron</p>
          <p>React</p>
          <p>Vite</p>
          <p>TypeScript</p>
          <p>Tailwind CSS</p>
          <p>shadcn/ui</p>
          <p>ExcelJS</p>
          <p>Lucide React</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="select-none">
            Support
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            For technical support, feature requests, or bug reports,
            contact Ruff or submit an issue on GitHub.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground my-5 px-2">
            <li className="select-none py-1">
              <a href="https://github.com/cba-money/AR/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Bug Reports & Feature Requests
              </a>
            </li>
            <li className="select-none py-1">
              <a href="mailto:rufft@cbamoney.com" className="text-blue-600 hover:underline">
                Critical Support Issues
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="select-none">
            Other Links
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            For technical support, feature requests, or bug reports,
            contact Ruff or submit an issue on GitHub.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground my-5 px-2">
            <li className="select-none py-1">
              <a href="https://github.com/cba-money/AR/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Project GitHub Repository
              </a>
            </li>
            <li className="select-none py-1">
              <a href="https://github.com/cba-money/AR/releases" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Releases & Downloads
              </a>
            </li>
            <li className="select-none py-1">
              <a href="https://ar.cbautils.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Project Website
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="select-none">
            Copyright & License
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            © 2026 C Berman Associates. All Rights Reserved.
          </p>

          <p>
            This software is proprietary and confidential. Unauthorized
            copying, modification, reverse engineering, redistribution,
            or resale is prohibited except where expressly permitted by
            applicable law or written agreement.
          </p>

          <p>
            Microsoft Excel is a trademark of Microsoft Corporation.
            All other trademarks belong to their respective owners.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}