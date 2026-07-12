import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

import { Button } from "@/components/ui/button.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@/components/ui/separator.tsx";

import {
  LoaderCircle,
  CheckCircle2,
  CircleX,
  FileSpreadsheet,
  FolderOpen,
  Terminal,
} from "lucide-react";

export default function ProcessingPage({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {
  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const consoleLogOutputRef = useRef<HTMLDivElement | null>(null);

  /*
  useEffect(() => {
    const handleIncomingLogs = (data: string) => {
      setLogs([...logs, data]);
    }
    const unsubscribe = window.electron.processLog(handleIncomingLogs);
    return () => {
      unsubscribe();
    }
  })
  */
 useEffect(() => {
    const unsubscribe =
        window.electron.subscribeBatchLog(log => {
            setLogs(prev => [...prev, log]);
        });

    return unsubscribe;
 }, []);

 useEffect(() => {
    const unsubscribe =
        window.electron.subscribeBatchProgress(progress => {
            setProgress(progress.percent);
        });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if(progress >= 100){
      onUpdatePage('complete');
    }
  }, [progress]);

  useEffect(() => {
    if(consoleLogOutputRef.current){
      //consoleLogOutputRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
      consoleLogOutputRef.current.scrollTo({
        top: consoleLogOutputRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);

  //const progress = 62;

  const files = [
    {
      name: "Admin A - Weekly 7.xlsx",
      status: "Completed",
    },
    {
      name: "Admin B - Weekly 7.xlsx",
      status: "Completed",
    },
    {
      name: "Admin C - Weekly 7.xlsx",
      status: "Processing",
    },
    {
      name: "Admin D - Weekly 7.xlsx",
      status: "Waiting",
    },
    {
      name: "Admin E - Weekly 7.xlsx",
      status: "Waiting",
    },
  ];

  /*
  const logs = [
    "[12:18:04] Starting Weekly 7 Merge...",
    "[12:18:05] Reading Admin A.xlsx",
    "[12:18:06] Workbook loaded successfully.",
    "[12:18:08] Merged worksheet 1.",
    "[12:18:09] Reading Admin B.xlsx",
    "[12:18:10] Validation successful.",
    "[12:18:12] Reading Admin C.xlsx",
    "[12:18:13] Processing formulas...",
    "[12:18:15] Writing output workbook...",
  ];
  */

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">
            Processing
          </h1>

          <p className="text-muted-foreground mt-2">
            Weekly 7 Merge Utility
          </p>

        </div>

        <Button variant="destructive">
          Cancel Processing
        </Button>

      </div>

      {/* Progress */}

      <Card>

        <CardHeader>

          <CardTitle>
            Progress
          </CardTitle>

          <CardDescription>
            Processing 3 of 5 workbooks
          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-4">

          <Progress value={progress} />

          <div className="flex justify-between text-sm text-muted-foreground">

            <span>
              {progress.toFixed(0)}%
            </span>

            <span>
              Current File:
              <strong className="ml-1">
                Admin C - Weekly 7.xlsx
              </strong>
            </span>

          </div>

        </CardContent>

      </Card>

      <div className="grid grid-cols-3 gap-6">

        {/* Files */}

        <Card>

          <CardHeader>

            <CardTitle>
              Files
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-2">

            {files.map((file) => (

              <div
                key={file.name}
                className="flex justify-between items-center rounded-lg border p-3"
              >

                <div className="flex items-center gap-2">

                  <FileSpreadsheet className="h-4 w-4" />

                  <span className="text-sm">
                    {file.name}
                  </span>

                </div>

                {file.status === "Completed" && (
                  <CheckCircle2 className="text-green-600 h-5 w-5" />
                )}

                {file.status === "Processing" && (
                  <LoaderCircle className="animate-spin text-blue-600 h-5 w-5" />
                )}

                {file.status === "Waiting" && (
                  <Badge variant="secondary">
                    Waiting
                  </Badge>
                )}

                {file.status === "Failed" && (
                  <CircleX className="text-red-600 h-5 w-5" />
                )}

              </div>

            ))}

          </CardContent>

        </Card>

        {/* Console */}

        <Card className="col-span-2">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <Terminal className="h-5 w-5" />

              Processing Log

            </CardTitle>

          </CardHeader>

          <CardContent>

            <ScrollArea className="h-[450px] rounded-lg border bg-black p-4">

              <div ref={consoleLogOutputRef} className="font-mono text-sm text-green-400 space-y-2">

                {logs.map((log, index) => (

                  <div key={index} title={log.timestamp}>
                   {log.message}
                  </div>

                ))}

              </div>

            </ScrollArea>

          </CardContent>

        </Card>

      </div>

      {/* Footer */}

      <Card>

        <CardContent className="pt-6 flex justify-between items-center">

          <div>

            <div className="font-semibold">
              Output Folder
            </div>

            <div className="text-sm text-muted-foreground">
              C:\Reports\Weekly7\Output
            </div>

          </div>

          <Button variant="outline">

            <FolderOpen className="mr-2 h-4 w-4" />

            Open Output Folder

          </Button>

        </CardContent>

      </Card>

    </div>
  );
}