
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Phase 2: Native Electron Wrapper
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#050819', // Matches CloudHop Deep Space BG
    titleBarStyle: 'hidden', // Frameless native feel
    titleBarOverlay: {
      color: '#050819',
      symbolColor: '#53C8FF',
      height: 40
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      enableBlinkFeatures: 'WebGPU' // Ensure GPU acceleration is active
    },
    // In a real build, this would point to your icon file
    // icon: path.join(__dirname, 'public/logo.png') 
  });

  // Load the production URL or local dev server
  const startUrl = process.env.ELECTRON_START_URL || 'https://cloudhop.tech';
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
