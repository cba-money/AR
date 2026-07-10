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

import {
  FileStack,
  ShieldCheck,
  FileSpreadsheet,
  Wrench,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function UtilitiesPage({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {
  const utilities = [
    {
      title: "Merge Weekly 7 Files",
      description:
        "Merge multiple Weekly 7 workbooks into a single consolidated workbook while preserving formatting and formulas. Useful for processing IAA and other multi-admin reports.",
      icon: FileStack,
      status: "Available",
      color: "default",
    },
    {
      title: "Weekly 7 Validator",
      description:
        "Validate Weekly 7 reports for missing worksheets, formatting errors, invalid totals, and data inconsistencies.",
      icon: ShieldCheck,
      status: "Available",
      color: "default",
    },
    {
      title: "Weekly 7 Reader / Processor",
      description:
        "Extract, analyze, and process Weekly 7 workbook data for downstream reporting and automation.",
      icon: FileSpreadsheet,
      status: "Available",
      color: "default",
    },
    {
      title: "Pay Histories Generator",
      description:
        "Generate pay histories from imported spreadsheets.",
      icon: FileSpreadsheet,
      status: "Coming Soon",
      color: "secondary",
    },
    {
      title: "Workbook Cleaner",
      description:
        "Remove unused formatting, hidden rows, blank worksheets, and optimize workbook size.",
      icon: Sparkles,
      status: "Coming Soon",
      color: "secondary",
    },
    {
      title: "Batch Excel Processor",
      description:
        "Run multiple workbook utilities against an entire folder in one operation.",
      icon: Wrench,
      status: "Planned",
      color: "outline",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold">
          Utilities
        </h1>

        <p className="text-muted-foreground mt-2">
          Specialized tools for processing, validating, and managing Excel
          workbooks.
        </p>
      </div>

      {/* Quick Stats */}

      <div className="grid grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Installed Utilities
            </div>

            <div className="text-3xl font-bold mt-2">
              6
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Available
            </div>

            <div className="text-3xl font-bold mt-2 text-green-600">
              3
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Coming Soon
            </div>

            <div className="text-3xl font-bold mt-2">
              2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Last Used
            </div>

            <div className="text-lg font-semibold mt-2">
              Today
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

                      <CardTitle>
                        {tool.title}
                      </CardTitle>

                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>

                    </div>

                  </div>

                  <Badge variant={tool.color as any}>
                    {tool.status}
                  </Badge>

                </div>

              </CardHeader>

              <Separator />

              <CardContent className="pt-6">

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <Clock className="h-4 w-4" />

                    Last used 2 days ago

                  </div>

                  <Button disabled={tool.status !== "Available"}>
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

      <Card>

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