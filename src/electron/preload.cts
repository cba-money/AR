const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  /*
  subscribeStatistics: (callback) =>
    ipcOn('statistics', (stats) => {
      callback(stats);
    }),
  subscribeChangeView: (callback) =>
    ipcOn('changeView', (view) => {
      callback(view);
    }),
  getStaticData: () => ipcInvoke('getStaticData'),
  sendFrameAction: (payload) => ipcSend('sendFrameAction', payload),
  */
  openFolder: (folderPath?: any) => ipcSend('openFolder', folderPath),
  pickFile: () => ipcInvoke('pickFile'),
  pickFolder: () => ipcInvoke('pickFolder'),
  getAppVersion: () => ipcInvoke('getAppVersion'),
  getEnvironment: () => ipcInvoke('getEnvironment'),
  getOsPlatform: () => ipcInvoke('getOsPlatform'),
  getCurrentJob: () => ipcInvoke('getCurrentJob'),
  getFileStatus: () => ipcInvoke('getFileStatus'),
  getSettings: () => ipcInvoke('getSettings'),
  updateSettings: (payload?: any) => ipcSend('updateSettings', payload),
  startBatchJob: (config: BatchConfig) => ipcSend('startBatchJob', config),
  getBatchLogs: () => ipcInvoke("getBatchLogs"),
  checkRuns: () => ipcInvoke("checkRuns"),
  // Expose a method to subscribe to logs with a cleanup function
  /*processLog: (callback) => {
    const subscription = (data: any) => callback(data);
    ipcOn('processLog', subscription);
    
    // Return unsubscribe function to prevent memory leaks in React
    return () => {
      electron.ipcRenderer.removeListener('processLog', subscription);
    };
  },
  logSender: (data: string) => ipcSend('processLog', data),
  */
  subscribeBatchLog: (callback) =>
      ipcOn("batchLog", callback),

  subscribeBatchProgress: (callback) =>
      ipcOn("batchProgress", callback),
} as Window['electron']);

type IpcInvokeKey = keyof EventPayloadMapping;


function ipcInvoke<Key extends IpcInvokeKey>(
  key: Key
): Promise<Key extends keyof EventPayloadMapping ? EventPayloadMapping[Key] : unknown> {
  return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key]
) {
  electron.ipcRenderer.send(key, payload);
}