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

export default function ReportsPage({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>
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

      <div className="grid grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Reports Generated
            </div>

            <div className="text-3xl font-bold mt-2">
              148
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Processed Workbooks
            </div>

            <div className="text-3xl font-bold mt-2">
              2,431
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Errors Detected
            </div>

            <div className="text-3xl font-bold mt-2">
              37
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Last Run
            </div>

            <div className="text-lg font-semibold mt-2">
              Today
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Available Reports */}

      <Card>

        <CardHeader>
          <CardTitle>Available Reports</CardTitle>

          <CardDescription>
            Generate operational and reconciliation reports.
          </CardDescription>
        </CardHeader>

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

        <CardHeader>
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

          <CardHeader>
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

          <CardHeader>
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