const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require("electron");

const path = require("path");

function createWindow() {

    const win = new BrowserWindow({

        width: 1100,
        height: 800,

        webPreferences: {

            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false

        }

    });

    win.loadFile("renderer/index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle("select-folder", async () => {

    const result = await dialog.showOpenDialog({

        properties: ["openDirectory"]

    });

    if (result.canceled) return null;

    return result.filePaths[0];

});