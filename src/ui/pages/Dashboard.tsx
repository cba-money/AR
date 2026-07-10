"use client"

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
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
} from "lucide-react";
export default function Dashboard({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {

    return (
        <article>
            <div className="mb-8">
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
                <CardTitle>Upload Excel Files</CardTitle>
                </CardHeader>

                <CardContent>

                <div className="border-2 border-dashed rounded-xl h-48 flex flex-col justify-center items-center">

                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />

                    <p className="font-medium">
                    Drag & Drop Excel Files
                    </p>

                    <p className="text-sm text-muted-foreground">
                    or click Browse
                    </p>

                    <Button className="mt-5">
                    Browse Files
                    </Button>

                </div>

                </CardContent>

            </Card>

            <Card>

                <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                <Button className="w-full">
                    Start Processing
                </Button>

                <Button
                    variant="secondary"
                    className="w-full"
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

                </CardContent>

            </Card>

            <Card className="col-span-3">

                <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                </CardHeader>

                <CardContent>

                <div className="space-y-3">

                    <div className="flex justify-between">
                    <span>A/R Formatter.xlsx</span>
                    <span className="text-green-600">
                        Completed
                    </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                    <span>Check Run Verification.xlsx</span>
                    <span className="text-green-600">
                        Completed
                    </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                    <span>Commission Report.xlsx</span>
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