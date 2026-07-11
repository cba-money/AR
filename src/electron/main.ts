import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { ipcMainHandle, 
  ipcMainOn, 
  isDev,
  selectLocalFile,
  selectLocalFolder
} from './util.js';

import { getPreloadPath, getUIPath } from './pathResolver.js';
import { createTray } from './tray.js';
import { createMenu } from './menu.js';

import { settingsManager } from './settings.js';

import { BatchTest } from './modules/batch/batchTest.js';

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    // disables default system frame (dont do this if you want a proper working menu bar)
    frame: true,
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    show: true,
  });
  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  /* IPC Handlers */

  ipcMainOn('openFolder', (folderPath) => {
    if(folderPath === "output"){
      const exportPath = settingsManager.getStore().defaultExportPath;
      shell.openPath(exportPath);
      return;
    }
    shell.openPath(folderPath);
  })

  ipcMainHandle('pickFile', async() => {
    return await selectLocalFile(mainWindow);
  });

  ipcMainHandle('pickFolder', async() => {
    return await selectLocalFolder(mainWindow);
  });

  createTray(mainWindow);
  handleCloseEvents(mainWindow);
  createMenu(mainWindow);
});

ipcMainHandle('getAppVersion', () => {
  return app.getVersion(); // Returns a string, matching our Mapping type
});

ipcMainHandle('getSettings', () => {
    return settingsManager.getStore();
});

// React sends this to update settings
ipcMainOn('updateSettings', (payload) => {
  settingsManager.updateAll(payload);
  
  // Optional: If your backend modules need to react immediately to a settings change, 
  // you can trigger a function call right here.
  // e.g., resourceManager.handleThemeChange(payload.theme);
});

ipcMainOn('startBatchJob', (config) => {
  const processor = new BatchTest(config);
  processor.execute();
})

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on('close', (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on('before-quit', () => {
    willClose = true;
  });

  mainWindow.on('show', () => {
    willClose = false;
  });
}
