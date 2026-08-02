import path from 'path';
import * as fs from 'fs';

//const os = require('os');

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

import { CheckRegisterAuditor } from './modules/checks/checkRegisterAuditor.js';

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

ipcMainHandle('getOsPlatform', () => {
  //return process.platform;
  //return os.platform();
  return process.platform;
});

ipcMainHandle('getSettings', () => {
    return settingsManager.getStore();
});

ipcMainHandle('checkRuns', () => {
  async function handleAudit(registerFile: File, runFile: File) {
    const auditor = new CheckRegisterAuditor();

    // Listen to events to update your UI
    auditor.on('progress', (msg) => console.log(msg));
    auditor.on('discrepancy', (issue) => console.warn('Found issue:', issue));
    
    try {
      const registerBuffer = await registerFile.arrayBuffer();
      const runBuffer = await runFile.arrayBuffer();

      // Run the process
      const result = await auditor.process(registerBuffer, runBuffer);

      // Save files directly in the browser (or send to Electron Main process to save)
      downloadBuffer(result.modifiedRunBuffer, path.join(cwd(), 'modified-check-run.xlsx'));
      downloadBuffer(result.modifiedRegisterBuffer, path.join(cwd(), 'modified-check-register.xlsx'));
      downloadBuffer(result.discrepanciesBuffer, path.join(cwd(), 'discrepancies.xlsx'));

    } catch (error) {
      console.error('Audit failed:', error);
    }
  }

  // Helper to trigger browser downloads from a buffer
  function downloadBuffer(buffer: Uint8Array, filename: string) {
    // Make a plain Uint8Array copy to ensure underlying buffer is a regular ArrayBuffer
    // (avoids passing SharedArrayBuffer to Blob which some environments disallow)
    const copy = buffer.slice();
    const blob = new Blob([copy], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    /*
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    */
  fs.writeFileSync(filename, buffer);
  }
  //const filePath = path.join(, 'example.txt');
  const checkRegisterPath = 'C:\\Users\\TylerRRuff\\Downloads\\8942 Cashed (1).xlsx';
  const checkRunPath = 'C:\\Users\\TylerRRuff\\Downloads\\01.01to05.04.2026.xlsx';
  const chekcRegisterfileBuffer = fs.readFileSync(checkRegisterPath);
  const chekcRunfileBuffer = fs.readFileSync(checkRunPath);
  const checkRegisterFileName = path.basename(checkRegisterPath);
  const checkRunFileName = path.basename(checkRunPath);
  const checkRegisterFileObject = new File([chekcRegisterfileBuffer], checkRegisterFileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Adjust the MIME type as needed
  });
    const checkRunFileObject = new File([chekcRunfileBuffer], checkRunFileName, {
    type: 'application/vnd.ms-excel', // Adjust the MIME type as needed
  });
  handleAudit(checkRegisterFileObject, checkRunFileObject);
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
