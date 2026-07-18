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
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  FileText,
  ChartBar,
  FolderOpen,
} from "lucide-react";

type ReportStatistic = {
  label: string,
  value: string | number,
  style?: 'normal' | 'gray' | 'blue'
};

export default function ReportsPage() {
  const statistics: ReportStatistic[] = [
    {
      label: "Reports Generated",
      value: 148
    },
    {
      label: "Processed Workbooks",
      value: 2431
    },
    {
      label: "Errors Detected",
      value: 37
    },
    {
      label: "Last Run",
      value: "Today"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div className="select-none">
          <h1 className="text-4xl font-bold">
            Reports
          </h1>

          <p className="text-muted-foreground mt-2">
            Generate, view, and export Accounts Receivable reports.
          </p>
        </div>

        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {
          statistics.map((data, index) => {
            return (
              <Card aria-label={data.label} key={index}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground select-none">
                    {data.label}
                  </div>

                  <div className={`${typeof data.value == "string" ? 'text-lg' : 'text-3xl'} font-bold mt-2 select-all`}>
                    {
                      (typeof data.value == "string") ?
                      data.value :
                      data.value.toLocaleString()
                    }
                  </div>
                </CardContent>
              </Card>
            );
          })
        }

      </div>

      {/* Available Reports */}

      <Card>

        <CardHeader className="select-none">
          <CardTitle>Available Reports</CardTitle>

          <CardDescription>
            Generate operational and reconciliation reports.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4">

          <div className="flex justify-between items-center">

            <div>
              <div className="font-semibold">
                Commission Report
              </div>

              <div className="text-sm text-muted-foreground">
                Generate commission summaries and payment totals.
              </div>
            </div>

            <Button>
              Generate
            </Button>

          </div>

          <Separator />

          <div className="flex justify-between items-center">

            <div>
              <div className="font-semibold">
                Check Run Verification
              </div>

              <div className="text-sm text-muted-foreground">
                Compare processed check runs for discrepancies.
              </div>
            </div>

            <Button>
              Generate
            </Button>

          </div>

          <Separator />

          <div className="flex justify-between items-center">

            <div>
              <div className="font-semibold">
                A/R Summary
              </div>

              <div className="text-sm text-muted-foreground">
                Accounts Receivable processing summary.
              </div>
            </div>

            <Button>
              Generate
            </Button>

          </div>

        </CardContent>

      </Card>

      {/* Recent Reports */}

      <Card>

        <CardHeader className="select-none">
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          {[
            "Commission Report - June 2026.xlsx",
            "Check Run Audit - Week 26.xlsx",
            "A/R Summary - Q2 2026.xlsx",
            "Payment Verification.xlsx",
            "Exception Report.xlsx",
          ].map((report) => (
            <div
              key={report}
              className="flex justify-between items-center rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">

                <FileSpreadsheet className="h-5 w-5 text-green-600" />

                <div>
                  <div className="font-medium">
                    {report}
                  </div>

                  <div className="text-sm text-muted-foreground flex gap-4">

                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Jul 9, 2026
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      2:18 PM
                    </span>

                  </div>

                </div>

              </div>

              <div className="flex gap-2">

                <Badge>
                  Completed
                </Badge>

                <Button
                  variant="outline"
                  size="icon"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                >
                  <Download className="h-4 w-4" />
                </Button>

              </div>

            </div>
          ))}

        </CardContent>

      </Card>

      {/* Activity */}

      <div className="grid grid-cols-2 gap-6">

        <Card>

          <CardHeader className="select-none">
            <CardTitle>
              Processing Activity
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="flex items-center gap-3">

              <ChartBar className="h-10 w-10 text-primary" />

              <div>

                <div className="font-semibold">
                  42 Reports Generated This Week
                </div>

                <div className="text-muted-foreground text-sm">
                  Average processing time: 4.3 seconds
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardHeader className="select-none">
            <CardTitle>
              Report Storage
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="flex items-center gap-3">

              <FileText className="h-10 w-10 text-primary" />

              <div>

                <div className="font-semibold">
                  312 Saved Reports
                </div>

                <div className="text-muted-foreground text-sm">
                  Storage Used: 1.8 GB
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}