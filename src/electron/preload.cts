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
  pickFile: () => ipcInvoke('pickFile'),
  getAppVersion: () => ipcInvoke('getAppVersion'),
  getSettings: () => ipcInvoke('getSettings'),
  updateSettings: (payload?: any) => ipcSend('updateSettings', payload),
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