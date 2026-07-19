interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  defaultExportPath: string;
  tmpFolder: string;
  autoProcessingEnabled: boolean;
}

/*
type Statistics = {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
};

type StaticData = {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
};

type View = 'CPU' | 'RAM' | 'STORAGE';

*/

type BatchLog = {
    level: "info" | "warn" | "error";
    message: string;
    timestamp: string;
};

type BatchProgress = {
    percentage: number;
    currentFile: string;
    processedCount: number;
    totalFiles: number;
};

/*
type EventPayloadMapping = {
    getAppVersion: string;
    getSettings: AppSettings;
    updateSettings: AppSettings;
    openFolder: string;
    pickFile: string | null;
    pickFolder: string | null;
    startBatchJob: BatchConfig;

    batchLog: BatchLog;
    batchProgress: BatchProgress;
};
*/

type Log = {
  id: Number;
  jobId: string;
  type: 'info' | 'error' | 'warn' = 'info';
  message: string;
}

//type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE';

type EventPayloadMapping = {
  getAppVersion: any;
  getEnvironment: any;
  getSettings: any;
  updateSettings: any;
  openFolder: any;
  pickFile: any;
  pickFolder: any;
  startBatchJob: any;
  getCurrentJob: any;
  getFileStatus: any;
  //processLog: any;
  //logSender: any;
  batchLog: ProcessLogEntry;
  getBatchLogs: any;
  batchProgress: BatchProgress;
};

type UnsubscribeFunction = () => void;

interface Window {
  electron: {
    /*
    subscribeStatistics: (
      callback: (statistics: Statistics) => void
    ) => UnsubscribeFunction;
    getStaticData: () => Promise<StaticData>;
    subscribeChangeView: (
      callback: (view: View) => void
    ) => UnsubscribeFunction;
    sendFrameAction: (payload: FrameWindowAction) => void;
    */
    getAppVersion: () => any;
    getEnvironment: () => any;
    updateSettings: (payload: any) => void;
    getSettings: () => any;
    openFolder: (folderPath: any) => void;
    pickFile: () => any;
    pickFolder: () => any;
    startBatchJob: (config: BatchConfig) => void;
    getCurrentJob: () => any;
    getBatchLogs: () => any;
    getFileStatus: () => any;
    /*
    processLog: (
      callback: (data: any) => void
    ) => UnsubscribeFunction;
    logSender: (data: string) => any;
    */
    subscribeBatchLog(
        callback: (log: ProcessLogEntry) => void
    ): UnsubscribeFunction;

    subscribeBatchProgress(
        callback: (progress: BatchProgress) => void
    ): UnsubscribeFunction;
  };
}

interface BatchConfig {
  files: string[];
  arDate: string; // e.g., '2026-07-11'
  monthRange: number[];
}

interface ProcessLogEntry{
    entryDate: Date;
    type: 'info' | 'error' | 'warn';
    message: string;
}

/*
interface ProcessedFile {
  admin: string;
  status: "Not Started" | "Processing" | "Completed" | "Failed" | "Cancelled";
  fileName: string;
  filePath: string;
}
*/

type JobStatus =
    | 'Not Started'
    | 'Processing'
    | 'Completed'
    | 'Failed'
    | 'Cancelled';

type ProcessedFileType =
    | 'xlsx'
    | 'pdf'
    | 'txt'
    | 'other';

interface AdminTotal{
  admin: string;
  grandTotal: number;
  arPerMonth: Record<number, number>;
}

interface AdminSummary{
  name: string;
  totals: Record<string, number>;
}

interface ProcessingJob {
  jobId: string;
  status: JobStatus;
  processedFiles: ProcessedFile[];
  startedAt: Date;
  completedAt?: Date;
  arDate: string;
}

interface ProcessingJobDatabase extends ProcessingJob {
  files: string[];
  monthRange: string[];
  percentage: number;
  currentFile: string;
  grandTotal: number;
  totals: AdminTotal[];
  logs: ProcessLogEntry[];
}

interface ProcessedFile {
    admin: string;
    fileName: string;
    status: JobStatus;
    fullPath: string;
    type: ProcessedFileType;
};

interface ProcessedInputFile{
  fullPath: string;
  fileName: string;
  index: number;
  status: JobStatus;
}

/*
interface ProcessingJobs {
  latestJob: string;
  jobs: ProcessingJob[];
}
*/

interface IProcessFile {
  fileName: string;
  fullPath: string;
  type: 
    | "xlsx"
    | "pdf"
    | "txt"
    | "json"
    | "other";
  status:
    | "queued"
    | "running"
    | "completed"
    | "cancelled"
    | "failed";
  size: number;
}

interface IProcessingJob {
  id: string;
  status:
    | "queued"
    | "running"
    | "completed"
    | "cancelled"
    | "failed";
  startedAt: Date;
  finishedAt?: Date;
  processingTime: number;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  progress: number;
  admins: AdminSummary[];
  logs: JobLog[];
  fileList: IProcessFile[];
}
