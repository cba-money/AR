import { BrowserWindow, Menu, app } from 'electron';
import { ipcWebContentsSend, isDev } from './util.js';

export function createMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === 'darwin';
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: isMac ? undefined : 'File',
        type: 'submenu',
        submenu: [
          {
            label: 'Quit',
            click: app.quit,
          }
        ],
      },
      {
        label: 'Edit',
        type: 'submenu',
        submenu: [
          {
            label: 'Undo',
            role: 'undo',
          },
          {
            label: 'Redo',
            role: 'redo',
          },
          {
            type: 'separator',
          },
          {
            label: 'Cut',
            role: 'cut',
          },
          {
            label: 'Copy',
            role: 'copy',
          },
          {
            label: 'Paste',
            role: 'paste',
          }
        ]
      },
      {
        label: 'View',
        type: 'submenu',
        submenu: [
          {
            label: 'DevTools',
            click: () => mainWindow.webContents.openDevTools(),
            visible: isDev(),
          },
          {
            label: 'Toggle Fullscreen',
            role: 'togglefullscreen',
          },
          {
            label: 'Reload',
            click: () => mainWindow.webContents.reload(),
            visible: isDev(),
          }
        ],
      },
    ])
  );
}