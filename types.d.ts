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

//type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE';

type EventPayloadMapping = {
  getAppVersion: any;
  getSettings: any;
  updateSettings: any;
  openFolder: any;
  pickFile: any;
  pickFolder: any;
  startBatchJob: any;
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
    updateSettings: (payload: any) => void;
    getSettings: () => any;
    openFolder: (folderPath: any) => void;
    pickFile: () => any;
    pickFolder: () => any;
    startBatchJob: (config: BatchConfig) => void;
  };
}

interface BatchConfig {
  files: string[];
  arDate: string; // e.g., '2026-07-11'
  monthRange: number[];
}
