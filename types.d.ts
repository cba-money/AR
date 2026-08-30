interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  defaultExportPath: string;
  tmpFolder: string;
}

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

type Log = {
  id: Number;
  jobId: string;
  type: 'info' | 'error' | 'warn' = 'info';
  message: string;
}

type EventPayloadMapping = {
  getAppVersion: any;
  getEnvironment: any;
  getOsPlatform: any;
  getSettings: any;
  updateSettings: any;
  openFolder: any;
  pickFile: any;
  dropFile: any;
  pickFolder: any;
  startBatchJob: any;
  getCurrentJob: any;
  getAllJobs: any;
  getFileStatus: any;
  //processLog: any;
  //logSender: any;
  batchLog: ProcessLogEntry;
  getBatchLogs: any;
  batchProgress: BatchProgress;
  checkRuns: any;
};

type UnsubscribeFunction = () => void;

interface Window {
  electron: {
    getAppVersion: () => any;
    getEnvironment: () => any;
    getOsPlatform: () => any;
    updateSettings: (payload: any) => void;
    getSettings: () => any;
    openFolder: (folderPath: any) => void;
    pickFile: () => any;
    dropFile: (file: any) => any;
    pickFolder: () => any;
    startBatchJob: (config: BatchConfig) => void;
    getCurrentJob: () => any;
    getAllJobs: () => any;
    getBatchLogs: () => any;
    getFileStatus: () => any;
    checkRuns: () => any;
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
