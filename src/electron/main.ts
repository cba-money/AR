import path from 'path';

import { app, BrowserWindow, ipcMain, shell, nativeTheme } from 'electron';
import { ipcMainHandle, 
  ipcMainOn, 
  isDev,
  ipcWebContentsSend,
  selectLocalFile,
  selectLocalFolder
} from './util.js';

import { getPreloadPath, getUIPath } from './pathResolver.js';
import { createTray } from './tray.js';
import { createMenu } from './menu.js';

import { settingsManager } from './settings.js';
import { getLatestJob } from './modules/batch/batchStore.js';

//import { BatchTest } from './modules/batch/batchTest.js';
import { BatchJobRunner } from './lib/batch/jobRunner.js';

import { JsonDatabase } from "./lib/db/json.js";
import { cwd } from 'process';

import { JSONFilePreset } from 'lowdb/node';

let mainWindow: BrowserWindow | null = null;

let currentRunner: BatchJobRunner | null = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
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

  //nativeTheme.themeSource = 'dark';
  //const db = new JsonDatabase(path.join(cwd(), 'db'));
  /*
  db.createTable('Test 1', {
    hello: "World",
    hool: 123,
    nice: true,
    complex: {
      vis: 1,
      test: "Test 1..2..3"
    }
  }).then((table) => {
    
  });
  */

  /*
  const defaultData: any = {
    posts: []
  };

  async function createData(){
    const db = await JSONFilePreset('db.json', defaultData);
    await db.update(({ posts }) => posts.push({
    hello: "World",
    hool: 123,
    nice: true,
    complex: {
      vis: 1,
      test: "Test 1..2..3"
    }}))
  }
  async function getData(){
    //const data = await db.findById('test-1', '1234');
    //console.log(data);
  }

  createData();
  */

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
    if (!mainWindow) {
      throw new Error('Main window is not initialized');
    }
    return await selectLocalFile(mainWindow);
  });

  ipcMainHandle('pickFolder', async() => {
    if (!mainWindow) {
      throw new Error('Main window is not initialized');
    }
    return await selectLocalFolder(mainWindow);
  });

  createTray(mainWindow);
  handleCloseEvents(mainWindow);
  createMenu(mainWindow);
});

ipcMainHandle('getAppVersion', () => {
  return app.getVersion(); 
});

ipcMainHandle('getEnvironment', () => {
  return process.env.NODE_ENV || 'Development'; 
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

ipcMainOn('startBatchJob', async (config) => {
  /*
  const ipcSender = (data: any) => {
    //window.electron.processLog(data);
  }
  */
  //const jobRunner = new BatchJobRunner({ ... config });
  currentRunner = new BatchJobRunner({ ... config});
  //const processor = new BatchTest({ ... config}, mainWindow.webContents);

  currentRunner.on('start', (payload) => {
    //console.log('Job started');
    
  });
  currentRunner.on('fileStart', (payload) => {
    //console.log(`File started`);
  });
  currentRunner.on('fileSuccess', (payload) => {
    //console.log(`File success`);
  });
  currentRunner.on('fileError', (payload) => {
    //console.log(`File Error`);
  });
  currentRunner.on('progress', (payload) => {
    //console.log(`Progress updated ${payload}`);
    if (!mainWindow) {
      throw new Error('Main window is not initialized');
    }
    ipcWebContentsSend(
        "batchProgress",
        mainWindow.webContents,
        payload
    );
  });
  currentRunner.on('logUpdate', (log) => {
    //console.log(`New Log data ${payload}`);
    if (!mainWindow) {
      throw new Error('Main window is not initialized');
    }
    ipcWebContentsSend(
        "batchLog",
        mainWindow.webContents,
        log
    );
    //console.log("MAIN RECEIVED:", log.message);
  });
  currentRunner.on('complete', (payload) => {
    //console.log(`Processing complete`);
  });
  currentRunner.on('error', (payload) => {
    //console.log(`Job Error`);
  });

  try{
    await currentRunner.start();
  } catch (error){
    console.log(error);
  }
});


ipcMainHandle('getCurrentJob', async() => {
  //const latestJob = await getLatestJob();
  if(currentRunner !== null && typeof currentRunner === typeof BatchJobRunner){
    return currentRunner.getJobObjectFull();
  }
  
  const defaultDataLatestJob = { job: {} };
  const latestJobDB = await JSONFilePreset(
  path.join(
      'db',
      'jobs',
      'latest-job.json'
  ), defaultDataLatestJob);
  return latestJobDB.data;
});

ipcMainHandle('getBatchLogs', async (): Promise<ProcessLogEntry[]> => {
  return currentRunner?.getLogs() ?? [];
});

ipcMainHandle('getFileStatus', async (): Promise<ProcessedInputFile[]> => {
  return currentRunner?.getInputFileStatus() ?? [];
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
