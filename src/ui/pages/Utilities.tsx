import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";

import { useRouter } from "@/hooks/useRouter.tsx";

import {
  FileStack,
  ShieldCheck,
  FileSpreadsheet,
  Wrench,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function UtilitiesPage() {

  const { navigate, path } = useRouter();

  const utilities = [
    {
      title: "Batch A/R Processor",
      description:
        "Run A/R format and process against multiple Weekly 7 spreadsheets.",
      icon: Wrench,
      status: "Available",
      color: "outline",
      launchPath: "/",
    },
    {
      title: "Check Runs Utility",
      description:
        "Compare the Check Register and Check Run files to identify discrepancies.",
      icon: FileSpreadsheet,
      status: "Available",
      color: "default",
      launchPath: "/utils/checks",
    },
    {
      title: "Merge Weekly 7 Files",
      description:
        "Merge multiple Weekly 7 workbooks into a single consolidated workbook while preserving formatting and formulas.",
      icon: FileStack,
      status: "Coming Soon",
      color: "secondary",
      launchPath: "/utils/merge",
    },
    {
      title: "Weekly 7 Validator",
      description:
        "Validate Weekly 7 reports for missing worksheets, formatting errors, invalid totals, and data inconsistencies.",
      icon: ShieldCheck,
      status: "Coming Soon",
      color: "secondary",
      launchPath: "/utils/validate",
    },
    {
      title: "Pay Histories Generator",
      description:
        "Generate pay histories from imported spreadsheets.",
      icon: FileSpreadsheet,
      status: "Planned",
      color: "secondary",
      launchPath: "",
    },
    {
      title: "Workbook Cleaner",
      description:
        "Remove unused formatting, hidden rows, blank worksheets, and optimize workbook size.",
      icon: Sparkles,
      status: "Planned",
      color: "secondary",
      launchPath: "",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Header */}

      <div className="select-none">
        <h1 className="text-4xl font-bold">
          Utilities
        </h1>

        <p className="text-muted-foreground mt-2">
          Specialized tools for processing, validating, and managing Excel
          workbooks.
        </p>
      </div>

      {/* Quick Stats */}

      <div className="grid grid-cols-3 gap-4 select-none">

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Total Utilities
            </div>

            <div className="text-3xl font-bold mt-2">
              {utilities.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Available
            </div>

            <div className="text-3xl font-bold mt-2 text-green-600">
              {utilities.filter((tool) => tool.status === "Available").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Coming Soon
            </div>

            <div className="text-3xl font-bold mt-2">
              {utilities.filter((tool) => tool.status === "Coming Soon" || tool.status === "Planned").length}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Utility Cards */}

      <div className="grid lg:grid-cols-2 gap-6">

        {utilities.map((tool) => {

          const Icon = tool.icon;

          return (

            <Card key={tool.title}>

              <CardHeader>

                <div className="flex justify-between items-start">

                  <div className="flex items-center gap-3">

                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div>

                      <CardTitle className="select-none">
                        {tool.title}
                      </CardTitle>

                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>

                    </div>

                  </div>

                  <Badge variant={tool.color as any} className="select-none">
                    {tool.status}
                  </Badge>

                </div>

              </CardHeader>

              <Separator />

              <CardContent className="pt-6">

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground select-all">
                    {/*
                    // More info can go here, will be used in the future
                    <Clock className="h-4 w-4" />
                    Last used 2 days ago
                    */}
                  </div>

                  <Button disabled={tool.status !== "Available"} onClick={() => {
                    if(tool.status === "Available") navigate(tool.launchPath);
                  }}>
                    Launch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                </div>

              </CardContent>

            </Card>

          );

        })}

      </div>

      {/* Information */}

      <Card className="select-none">

        <CardHeader>

          <CardTitle>
            Utility Information
          </CardTitle>

          <CardDescription>
            Additional processing tools are periodically added through software
            updates.
          </CardDescription>

        </CardHeader>

        <CardContent>

          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">

            <li>
              Utilities process Excel workbooks locally on your computer.
            </li>

            <li>
              Original files are never modified unless explicitly requested.
            </li>

            <li>
              Processing logs can be enabled from the Settings page.
            </li>

            <li>
              Future releases will include additional automation and reporting
              utilities.
            </li>

          </ul>

        </CardContent>

      </Card>

    </div>
  );
}