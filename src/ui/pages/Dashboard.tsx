"use client"

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import DatePicker from "@/components/DatePicker.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Home,
  FileSpreadsheet,
  ClipboardCheck,
  BarChart3,
  Wrench,
  Settings,
  Upload,
  FolderOpen,
  X
} from "lucide-react";
export default function Dashboard({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {

    const [files, setFiles] = useState<string[]>([]);

    //const [processJob, setProcessJob] = useState<any>("");

    /*
    async function getLastProcessJob() {
    try {
      const job = await window.electron.getLatestJob();
      //console.log(`Current App Version: v${version}`); // Output: "Current App Version: v1.0.0"
      setProcessJob(job);
      console.log(job);
    } catch (error) {
      //console.error("Failed to get version:", error);
    }
  }
  useEffect(() => {
    getLastProcessJob();
  }, []);
    */

    /*
    function addFile(filePath: string){
        setFiles((prevFiles) => [filePath, ...prevFiles]);
    }
    */
    function addFile(filePath: string) {
        setFiles((prevFiles) => {
            const isDuplicate = prevFiles.some(
            (file) => file.toLowerCase() === filePath.toLowerCase()
            );

            if (isDuplicate) return prevFiles;
            
            return [filePath, ...prevFiles];
        });
    }

    function deleteFile(indexDelete: number){
        let filesMutated = files.filter((_, index) => index !== indexDelete);
        setFiles(filesMutated);
    }

    async function filePickerDialog(){
        let path = await window.electron.pickFile();
        return path;
    }

    function openOutputFolder(){
        return window.electron.openFolder("output");
    }

    function addLeftEllipsis(str: string, maxLength: number): string {
        if (str.length <= maxLength) {
            return str;
        }
        
        // Calculate how many characters of the original string we need to keep
        const ellipsis = '...';
        const keepLength = maxLength - ellipsis.length;
        
        // Prevent negative substring lengths if maxLength is exceptionally small
        if (keepLength <= 0) {
            return ellipsis;
        }

        return ellipsis + str.slice(-keepLength);
    }

    async function startProcess(){
        window.electron.startBatchJob({
            files: files,
            arDate: "06/29/2026"
        } as BatchConfig);
        onUpdatePage('process');
    }

    return (
        <article>
            <div className="mb-8 select-none">
                <h2 className="text-3xl font-bold">
                    Dashboard
                </h2>

                <p className="text-muted-foreground">
                    Upload multiple Weekly 7 files for batch A/R formatting and processing.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6">

                <Card className="col-span-2">

                    <CardHeader>
                        <CardTitle className="select-none">
                            Upload Excel Files
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                    <div className="border-2 border-dashed rounded-xl h-48 flex flex-col justify-center items-center overflow-y-auto">

                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />

                        {
                            files.length === 0 ?
                        (
                        <div className="select-none" onClick={async() => {
                                let newFile = await filePickerDialog();
                                if(!newFile) return;
                                addFile(newFile);
                            }}>
                            <p className="font-medium">
                                Drag & Drop Excel Files
                            </p>

                            <p className="text-sm text-muted-foreground">
                                or click Browse
                            </p>
                        </div>
                        ) : (
                            <ul>
                                {
                                    files.map((file, i) => (
                                        <li key={i} className="flex space-y-2">
                                            <span className="select-all">
                                                {addLeftEllipsis(file, 60)}
                                            </span>
                                            <i className="select-none inline-flex hover:text-gray-500 pl-2" onClick={() => deleteFile(i)}>
                                                <X className="w-5 h-5" />
                                            </i>
                                        </li>
                                    ))
                                }
                            </ul>
                        )
                        }

                    </div>
                    <div>
                        <Button className="mt-5" onClick={async() => {
                                let newFile = await filePickerDialog();
                                if(!newFile) return;
                                addFile(newFile);
                            }}>
                                Browse Files
                        </Button>
                    </div>

                    </CardContent>

                </Card>

                <Card>

                    <CardHeader>
                        <CardTitle className="select-none">
                            Quick Actions
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">

                    <Button className="w-full" disabled={files.length > 0 ? false : true} onClick={() => startProcess()}>
                        Start Processing
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => openOutputFolder()}
                    >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open Output Folder
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onUpdatePage("settings")}
                    >
                        Settings
                    </Button>

                    <DatePicker />

                    </CardContent>

                </Card>

                <Card className="col-span-3">

                    <CardHeader>
                        <CardTitle>
                            Recent Jobs
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                    <div className="space-y-3">

                        <div className="flex justify-between">
                            <span>
                                A/R Formatter.xlsx
                            </span>
                            <span className="text-green-600">
                                Completed
                            </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                            <span>
                                Check Run Verification.xlsx
                            </span>
                            <span className="text-green-600">
                                Completed
                            </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                            <span>
                                Commission Report.xlsx
                            </span>
                            <span className="text-green-600">
                                Completed
                            </span>
                        </div>

                    </div>

                    </CardContent>

                </Card>
            </div>
        </article>
    );

}