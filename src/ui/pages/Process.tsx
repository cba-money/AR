import { useState, useEffect, useRef } from "react";

import { useRouter } from '@/hooks/useRouter.tsx';
import { useAppSettings } from "@/hooks/useAppSettings.ts";

import { useFileStatus } from '@/hooks/useFileStatus.ts';

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

import { 
    openOutputFolder, 
    addRightEllipsis,
    getFileName
} from '@/lib/utils.ts';

export default function ProcessingPage() {

  const { navigate, path } = useRouter();
  const { settings, error } = useAppSettings();
  const { data: files, isLoading, isError } = useFileStatus();

  const [ currentJob, setCurrentJob ] = useState<ProcessingJobDatabase>({} as ProcessingJobDatabase);

  const [logs, setLogs] = useState<ProcessLogEntry[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [allFiles, setAllFiles] = useState<string[]>([""]);

  //const [fileStatusList, setFileStatusList]

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
    async function initialize() {
      const existingLogs = await window.electron.getBatchLogs();
      setLogs(existingLogs);

      const unsubscribe = window.electron.subscribeBatchLog(log => {
          setLogs(prev => [...prev, log]);
      });

      return unsubscribe;
    }
    async function getCurrentJob(){
        const loadCurrentJob = await window.electron.getCurrentJob();
        //console.log(currentJob);
        setCurrentJob(loadCurrentJob.job);
        setProgress(loadCurrentJob.job.percentage);
        setCurrentFile(loadCurrentJob.job.currentFile);
        setProcessedFiles(loadCurrentJob.job.processedFiles);
        setAllFiles(loadCurrentJob.job.files);
    }
    async function updateProgress(){
      const unsubscribe =
        window.electron.subscribeBatchProgress(progress => {
            if(progress.percentage >= 100) navigate('/process/complete');
            
            setProgress(progress.percentage);
            setCurrentFile(progress.currentFile);
        });

      return unsubscribe;
    }
    
    initialize();
    getCurrentJob();
    updateProgress();
 }, []);

 /*
 useEffect(() => {
    
  }, []);
*/

  useEffect(() => {
    if(progress >= 100){
      //navigate('/processing/complete');
    }
  }, [progress]);

  /*
  useEffect(() => {
    if(consoleLogOutputRef.current){
      //consoleLogOutputRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
      consoleLogOutputRef.current.scrollTo({
        top: consoleLogOutputRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);
  */

  //const progress = 62;

  /*
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
  */

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

  if (isLoading) {
    return <div className="p-6 text-center">Loading file statuses...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-md">
        Error loading files: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center select-none">

        <div>

          <h1 className="text-4xl font-bold">
            Processing
          </h1>

          <p className="text-muted-foreground mt-2">
            A/R to {currentJob?.arDate}
          </p>

        </div>

        <Button variant="destructive">
          Cancel Processing
        </Button>

      </div>

      {/* Progress */}

      <Card className="select-none">

        <CardHeader>

          <CardTitle>
            Progress
          </CardTitle>

          <CardDescription>
            Processing {processedFiles.length ?? 0} of {(allFiles.length ?? 0) * 2} workbooks
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
                {currentFile}
              </strong>
            </span>

          </div>

        </CardContent>

      </Card>

      <div className="grid grid-cols-3 gap-6">

        {/* Files */}

        <Card>

          <CardHeader className="select-none">

            <CardTitle>
              Files
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-2">

            {files && files.length > 0 ? (files.map((file: ProcessedInputFile, index: number) => (

              <div
                key={index}
                title={file.fullPath}
                className="flex justify-between items-center rounded-lg border p-3 cursor-default"
              >

                <div className="flex items-center gap-2">

                  <FileSpreadsheet className="h-4 w-4" />

                  <span className="text-sm">
                    {addRightEllipsis(getFileName(file.fileName) ?? '', 30)}
                  </span>

                </div>

                {file.status === "Completed" && (
                  <CheckCircle2 className="text-green-600 h-5 w-5" />
                )}

                {file.status === "Processing" && (
                  <LoaderCircle className="animate-spin text-blue-600 h-5 w-5" />
                )}

                {file.status === "Not Started" && (
                  <Badge variant="secondary" className="select-none">
                    Waiting
                  </Badge>
                )}

                {file.status === "Failed" && (
                  <CircleX className="text-red-600 h-5 w-5" />
                )}

              </div>

            ))): ""}

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

                  <div key={index} title={log.entryDate?.toDateString() || ""}>
                   <span className="select-none">[{log?.entryDate?.toLocaleTimeString()}]&nbsp;</span><span className={`${log.type === 'error' ? 'text-red-600' : 'text-gray-300'} select-none`}>[{log.type.toUpperCase()}]</span> {log.message}
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

            <div className="font-semibold select-none">
              Output Folder
            </div>

            <div className="text-sm text-muted-foreground select-all">
              {settings?.defaultExportPath ?? "Settings loading..."}
            </div>

          </div>

          <Button variant="outline" type="button" onClick={() => {
            openOutputFolder();
          }}>

            <FolderOpen className="mr-2 h-4 w-4" />

            Open Output Folder

          </Button>

        </CardContent>

      </Card>

    </div>
  );
}