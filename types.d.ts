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
    percent: number;
    currentFile?: string;
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
  //processLog: any;
  //logSender: any;
  batchLog: BatchLog;
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
    /*
    processLog: (
      callback: (data: any) => void
    ) => UnsubscribeFunction;
    logSender: (data: string) => any;
    */
    subscribeBatchLog(
        callback: (log: BatchLog) => void
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
