const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    x: 1300,
    y: 200,
    movable: true,
    maximizable: false,
    frame: false,
    resizable: false,
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