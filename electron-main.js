/**
 * OmniShelf — Electron Main Process
 * Handles window creation, native menus, file associations.
 */
'use strict';

const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path  = require('path');
const isDev = !app.isPackaged;

let mainWindow = null;

// ── Create Window ─────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    title: 'OmniShelf',
    backgroundColor: '#0f172a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration:       false,
      contextIsolation:      true,
      webSecurity:           true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── Native Application Menu ───────────────────────────────────
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Files…',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
              title: 'Import Documents',
              filters: [
                { name: 'Supported Files', extensions: ['pdf','cbz','docx','pptx'] },
                { name: 'PDF',  extensions: ['pdf']  },
                { name: 'Comics', extensions: ['cbz'] },
                { name: 'Word', extensions: ['docx'] },
                { name: 'PowerPoint', extensions: ['pptx'] },
              ],
              properties: ['openFile','multiSelections'],
            });
            if (!canceled && filePaths.length) {
              mainWindow.webContents.send('import-files', filePaths);
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type:'separator' }, { role:'front' }] : [{ role:'close' }]),
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── App Lifecycle ─────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  buildMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Right-click context menu (PC) ─────────────────────────────
// Renderer sends 'show-context-menu' with coords; main shows native menu
ipcMain.on('show-context-menu', (event, params) => {
  const menu = Menu.buildFromTemplate([
    { label: 'Open',     click: () => event.sender.send('ctx-action', 'open',   params.id) },
    { type: 'separator' },
    { label: 'Delete',   click: () => event.sender.send('ctx-action', 'delete', params.id) },
  ]);
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

// Security: prevent navigation to external URLs in main window
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });
});
