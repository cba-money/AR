import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js';
import { getStaticData, pollResources } from './resourceManager.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
import { createTray } from './tray.js';
import { createMenu } from './menu.js';

import { formatWorkbook } from './modules/formatter/formatFiles.js';
import { processARFile } from './modules/processor/processFiles.js';

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

  pollResources(mainWindow);

  async function testFormatter(){

    let formatted = await formatWorkbook("C:\\Users\\TylerRRuff\\Downloads\\HEADSTART - Weekly 7.xlsx", "04/2026,05/2026,06/2026");
    let formattedFilePath = formatted;
    console.log(`Formatted file: ${formatted}`);
    let processed = await processARFile(
      formattedFilePath,
      new Date("06/29/2026"),
      [4, 5, 6]
    );
    console.log(processed);
  
  }

  testFormatter();

  ipcMainHandle('getStaticData', () => {
    return getStaticData();
  });

  ipcMainOn('sendFrameAction', (payload) => {
    switch (payload) {
      case 'CLOSE':
        mainWindow.close();
        break;
      case 'MAXIMIZE':
        mainWindow.maximize();
        break;
      case 'MINIMIZE':
        mainWindow.minimize();
        break;
    }
  });

  createTray(mainWindow);
  handleCloseEvents(mainWindow);
  createMenu(mainWindow);
});

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
