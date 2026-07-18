import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

import { Button } from "@/components/ui/button.tsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";

import {
  CheckCircle2,
  Download,
  FolderOpen,
  Home,
  FileSpreadsheet,
} from "lucide-react";

export default function CompletePage({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {
  const [processJob, setProcessJob] = useState<ProcessingJob>({} as ProcessingJob);
  
  async function getLastProcessJob() {
    try {
      const job = await window.electron.getLatestJob();
      //console.log(`Current App Version: v${version}`); // Output: "Current App Version: v1.0.0"
      setProcessJob(job);
    } catch (error) {
      //console.error("Failed to get version:", error);
      //onUpdatePage("process");
    }
  }
  useEffect(() => {
    getLastProcessJob();
  }, []);

  const admins = [
    {
      name: "John Smith",
      april: "$84,250.15",
      may: "$81,774.44",
      june: "$90,102.18",
      total: "$256,126.77",
    },
    {
      name: "Jane Doe",
      april: "$74,445.00",
      may: "$79,832.13",
      june: "$77,503.90",
      total: "$231,781.03",
    },
    {
      name: "Robert Johnson",
      april: "$62,118.22",
      may: "$71,333.44",
      june: "$69,447.10",
      total: "$202,898.76",
    },
  ];

  const reports = [
    "Monthly Summary.xlsx",
    "Admin Summary.xlsx",
    "Processing Log.txt",
    "Exception Report.xlsx",
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Success */}

      <Card className="border-green-500">

        <CardContent className="py-8 flex items-center gap-6">

          <CheckCircle2 className="h-16 w-16 text-green-600" />

          <div>

            <h1 className="text-4xl font-bold">
              Processing Complete
            </h1>

            <p className="text-muted-foreground mt-2">
              Successfully processed 12 Weekly 7 workbooks.
              
            </p>

          </div>

        </CardContent>

      </Card>

      {/* Statistics */}

      <div className="grid grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Files Processed
            </div>

            <div className="text-3xl font-bold">
              12
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Reports Created
            </div>

            <div className="text-3xl font-bold">
              4
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Errors
            </div>

            <div className="text-3xl font-bold text-green-600">
              0
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Processing Time
            </div>

            <div className="text-3xl font-bold">
              2m 14s
            </div>
          </CardContent>
        </Card>

      </div>

      {/* AR Totals */}

      <Card>

        <CardHeader>

          <CardTitle>
            A/R Totals by Administrator
          </CardTitle>

          <CardDescription>
            Monthly totals generated from the processed Weekly 7 files.
          </CardDescription>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Administrator</TableHead>
                <TableHead>April</TableHead>
                <TableHead>May</TableHead>
                <TableHead>June</TableHead>
                <TableHead>Total</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {admins.map((admin) => (

                <TableRow key={admin.name}>

                  <TableCell className="font-medium">
                    {admin.name}
                  </TableCell>

                  <TableCell>{admin.april}</TableCell>
                  <TableCell>{admin.may}</TableCell>
                  <TableCell>{admin.june}</TableCell>

                  <TableCell className="font-semibold">
                    {admin.total}
                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

      {/* Reports */}

      <Card>

        <CardHeader>

          <CardTitle>
            Generated Reports
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-3">

          {reports.map((report) => (

            <div
              key={report}
              className="flex justify-between items-center rounded-lg border p-4"
            >

              <div className="flex items-center gap-3">

                <FileSpreadsheet className="h-5 w-5 text-green-600" />

                <span>{report}</span>

              </div>

              <Button variant="outline">

                <Download className="mr-2 h-4 w-4" />

                Download

              </Button>

            </div>

          ))}

          <Separator />

          <div className="flex justify-end">

            <Button>

              <Download className="mr-2 h-4 w-4" />

              Download All Reports

            </Button>

          </div>

        </CardContent>

      </Card>

      {/* Footer */}

      <div className="flex justify-between">

        <Button variant="outline">

          <FolderOpen className="mr-2 h-4 w-4" />

          Open Output Folder

        </Button>

        <Button onClick={() => onUpdatePage("dashboard")}>

          <Home className="mr-2 h-4 w-4" />

          Return to Dashboard

        </Button>

      </div>

    </div>
  );
}