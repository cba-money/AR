import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card.tsx";

import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

import {
  FolderOpen,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FileSpreadsheet,
} from "lucide-react";

export default function Weekly7ValidatorPage() {

  const results = [
    {
      file: "Admin A.xlsx",
      status: "Passed",
      errors: 0,
      warnings: 0,
    },
    {
      file: "Admin B.xlsx",
      status: "Warning",
      errors: 0,
      warnings: 2,
    },
    {
      file: "Admin C.xlsx",
      status: "Failed",
      errors: 2,
      warnings: 1,
    },
    {
      file: "Admin D.xlsx",
      status: "Passed",
      errors: 0,
      warnings: 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      <div className="select-none">
        <h1 className="text-4xl font-bold">
          Weekly 7 Merge Utility
        </h1>

        <p className="text-muted-foreground mt-2">
          Merge multiple Weekly 7 workbooks into a single consolidated workbook.
        </p>
      </div>

      <Card>

        <CardHeader className="select-none">

          <CardTitle>
            Input Files
          </CardTitle>

        </CardHeader>

        <CardContent className="flex justify-between">

          <div>
            4 files selected
          </div>

          <Button>

            <FolderOpen className="mr-2 h-4 w-4"/>

            Select Files

          </Button>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="select-none">

          <CardTitle>
            Validation Options
          </CardTitle>

        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <label className="flex items-center gap-2">
            <Checkbox />
            Verify Required Worksheets
          </label>

          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Validate Formulas
          </label>

          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Verify Totals
          </label>

          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Verify Date Range
          </label>

          <label className="flex items-center gap-2">
            <Checkbox />
            Detect Hidden Sheets
          </label>

          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Detect Yellow Rows
          </label>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="select-none">

          <CardTitle>
            Validation Progress
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          <Progress value={100}/>

          <Button>

            <Play className="mr-2 h-4 w-4"/>

            Run Validation

          </Button>

        </CardContent>

      </Card>

      <div className="grid grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">
              Files
            </div>
            <div className="text-3xl font-bold">
              4
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">
              Passed
            </div>
            <div className="text-3xl font-bold text-green-600">
              2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">
              Warnings
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">
              Errors
            </div>
            <div className="text-3xl font-bold text-red-600">
              2
            </div>
          </CardContent>
        </Card>

      </div>

      <Card>

        <CardHeader className="select-none">

          <CardTitle>
            Validation Results
          </CardTitle>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Status</TableHead>
                <TableHead>Workbook</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Warnings</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {results.map((file) => (

                <TableRow key={file.file}>

                  <TableCell>

                    {file.status === "Passed" && (
                      <CheckCircle2 className="text-green-600"/>
                    )}

                    {file.status === "Warning" && (
                      <AlertTriangle className="text-yellow-600"/>
                    )}

                    {file.status === "Failed" && (
                      <XCircle className="text-red-600"/>
                    )}

                  </TableCell>

                  <TableCell>{file.file}</TableCell>
                  <TableCell>{file.errors}</TableCell>
                  <TableCell>{file.warnings}</TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="select-none">

          <CardTitle>
            Selected Workbook Details
          </CardTitle>

          <CardDescription>
            Admin C.xlsx
          </CardDescription>

        </CardHeader>

        <CardContent>

          <ScrollArea className="h-48 rounded-md border p-4">

            <div className="space-y-3">

              <div className="text-red-600">
                ✖ Missing worksheet "Weekly 7"
              </div>

              <div className="text-red-600">
                ✖ Formula mismatch at G28
              </div>

              <Separator/>

              <div className="text-yellow-600">
                ⚠ Hidden worksheet detected
              </div>

            </div>

          </ScrollArea>

        </CardContent>

      </Card>

      <div className="flex justify-between">

        <Button variant="outline">

          <FileSpreadsheet className="mr-2 h-4 w-4"/>

          Open Workbook

        </Button>

        <Button>

          <Download className="mr-2 h-4 w-4"/>

          Export Validation Report

        </Button>

      </div>

    </div>
  );
}