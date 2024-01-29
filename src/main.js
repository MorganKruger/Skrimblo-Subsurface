const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1000,
    x: 0,
    y: 1080,
    movable: true,
    maximizable: true,
    // frame: false,
    resizable: true,
    alwaysOnTop: true,
    level: "screen",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => app.quit());
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});
