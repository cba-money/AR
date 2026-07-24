import { ipcMain, WebContents, WebFrameMain, BrowserWindow, dialog} from 'electron';
import { getUIPath } from './pathResolver.js';
import { pathToFileURL } from 'url';

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: () => EventPayloadMapping[Key]
) {
  ipcMain.handle(key, (event) => {
    validateEventFrame(event.senderFrame);
    return handler();
  });
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (payload: EventPayloadMapping[Key]) => void
) {
  ipcMain.on(key, (event, payload) => {
    validateEventFrame(event.senderFrame);
    return handler(payload);
  });
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: WebContents,
  payload: EventPayloadMapping[Key]
) {
  webContents.send(key, payload);
}

export function validateEventFrame(frame: WebFrameMain | null) {
  if (!frame) {
    throw new Error('Malicious event');
  }
  /*
  if (isDev() && new URL(frame.url).host === 'localhost:5123') {
    return;
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error('Malicious event');
  }
  */
  if (isDev()) {
      if (new URL(frame.url).host === "localhost:5123") {
          return;
      }
  } else {
      if (new URL(frame.url).protocol === "file:") {
          return;
      }
  }

  throw new Error("Malicious event");
}

export async function selectLocalFile(mainWindow: BrowserWindow){
    // BrowserWindow.getFocusedWindow() can return null; pass mainWindow instead
    const focusedWindow = BrowserWindow.getFocusedWindow() || mainWindow;

    const result = await dialog.showOpenDialog(focusedWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Excel Spreadsheets', extensions: ['xlsx', 'csv', 'xlsm', 'xml'] }]
    });

    if (!result.canceled) {
      const filePath = result.filePaths[0]; // Contains the full absolute path string
      console.log('Selected file:', filePath);
      return filePath;
    }
}

export async function selectLocalFolder(mainWindow: BrowserWindow){
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'] // Enables folder selection instead of files
    });
    
    if (canceled) {
      return null;
    } else {
      return filePaths[0]; // Returns the full absolute path of the chosen folder
    }
}