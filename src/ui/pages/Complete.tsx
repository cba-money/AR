import { useState, useEffect } from "react";
import { useRouter } from '@/hooks/useRouter.tsx';

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

import { 
    openOutputFolder, 
    addRightEllipsis
} from '@/lib/utils.ts';

import { formatDuration } from '@/lib/utils.ts';

export default function CompletePage() {
  const { navigate, path } = useRouter();
  
  const [processJob, setProcessJob] = useState<ProcessingJobDatabase>({} as ProcessingJobDatabase);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  // Metrics
  const [processDuration, setProcessDuration] = useState<string>("");
  const [totals, setTotals] = useState<AdminTotal[]>([] as AdminTotal[]);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  useEffect(() => {
    async function getCurrentJob(){
        const loadCurrentJob = await window.electron.getCurrentJob();

        //console.log(processJob);

        if(loadCurrentJob?.job){
          setProcessJob(loadCurrentJob.job);
          setProcessedFiles(loadCurrentJob.job.processedFiles ?? []);
          setProcessDuration(formatDuration(loadCurrentJob.job.startedAt, loadCurrentJob.job.completedAt ?? new Date()));
          setTotals(loadCurrentJob.job.totals ?? []);
          setGrandTotal(loadCurrentJob.job.grandTotal ?? 0);
        }
    }
    getCurrentJob();
  }, []);

  const monthNames: Record<number, string> = {
    1: 'JANUARY', 2: 'FEBRUARY', 3: 'MARCH', 4: 'APRIL',
    5: 'MAY', 6: 'JUNE', 7: 'JULY', 8: 'AUGUST',
    9: 'SEPTEMBER', 10: 'OCTOBER', 11: 'NOVEMBER', 12: 'DECEMBER'
  };

  const reports = [
    "A/R Totals PDF",
    "A/R Log TXT",
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Success */}

      <Card className="border-green-500">

        <CardContent className="py-8 flex items-center gap-6">

          <CheckCircle2 className="h-16 w-16 text-green-600" />

          <div className="select-none">

            <h1 className="text-4xl font-bold">
              Processing Complete
            </h1>

            <p className="text-muted-foreground mt-2">
              Successfully processed {processedFiles.length ?? 0} Weekly 7 workbooks.
              
            </p>

          </div>

        </CardContent>

      </Card>

      {/* Statistics */}

      <div className="grid grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Files Exported
            </div>

            <div className="text-3xl font-bold">
              {processedFiles.length ?? 0}
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
              {processDuration}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* AR Totals */}

      <Card>

        <CardHeader className="select-none">

          <CardTitle>
            A/R Totals by Administrator
          </CardTitle>

          <CardDescription>
            Monthly totals generated from the processed Weekly 7 files.
          </CardDescription>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader className="select-none">

              <TableRow>

                <TableHead className="font-bold">
                  Administrator
                </TableHead>
                {
                  Object.keys(totals[0]?.arPerMonth ?? {}).map((month, index) => {
                    return (
                      <TableHead className="font-bold" key={index}>
                        {monthNames[Number.parseInt(month)]}
                      </TableHead>
                    );
                  })
                }
                <TableHead className="font-bold">
                  Total
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {totals.map((adminTotal) => (

                <TableRow key={adminTotal.admin}>

                  <TableCell className="font-medium">
                    {adminTotal.admin}
                  </TableCell>

                  {
                    Object.entries(adminTotal.arPerMonth).map(([month, monthTotal], index) => {
                      return (
                        <TableCell title={`${month}`} key={index}>
                          {currencyFormatter.format(monthTotal)}
                        </TableCell>
                      );
                    })
                  }

                  <TableCell className="font-semibold">
                    {currencyFormatter.format(adminTotal.grandTotal)}
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
              {/*
              <Button variant="outline">

                <Download className="mr-2 h-4 w-4" />

                Download

              </Button>
              */}
            </div>

          ))}

          {/*
          <Separator />
          */}

          <div className="flex justify-end">
            {/*
            <Button>

              <Download className="mr-2 h-4 w-4" />

              Download All Reports

            </Button>
            */}
          </div>

        </CardContent>

      </Card>

      {/* Footer */}

      <div className="flex justify-between">

        <Button variant="outline" type="button" onClick={() => {openOutputFolder()}}>

          <FolderOpen className="mr-2 h-4 w-4" />

          Open Output Folder

        </Button>

        <Button onClick={() => navigate("/")}>

          <Home className="mr-2 h-4 w-4" />

          Return to Dashboard

        </Button>

      </div>

    </div>
  );
}