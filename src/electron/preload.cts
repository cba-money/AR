const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  openFolder: (folderPath?: any) => ipcSend('openFolder', folderPath),
  pickFile: () => ipcInvoke('pickFile'),
  pickFolder: () => ipcInvoke('pickFolder'),
  dropFile: (file: File) => {
    return electron.webUtils.getPathForFile(file);
  },
  getAppVersion: () => ipcInvoke('getAppVersion'),
  getEnvironment: () => ipcInvoke('getEnvironment'),
  getOsPlatform: () => ipcInvoke('getOsPlatform'),
  getCurrentJob: () => ipcInvoke('getCurrentJob'),
  getAllJobs: () => ipcInvoke('getAllJobs'),
  getFileStatus: () => ipcInvoke('getFileStatus'),
  getSettings: () => ipcInvoke('getSettings'),
  updateSettings: (payload?: any) => ipcSend('updateSettings', payload),
  startBatchJob: (config: BatchConfig) => ipcSend('startBatchJob', config),
  getBatchLogs: () => ipcInvoke("getBatchLogs"),
  checkRuns: () => ipcInvoke("checkRuns"),
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