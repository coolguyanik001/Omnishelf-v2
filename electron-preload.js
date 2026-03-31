/**
 * OmniShelf — Electron Preload
 * Exposes a safe, minimal API to the renderer via contextBridge.
 */
'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs   = require('fs');

contextBridge.exposeInMainWorld('electronAPI', {
  // Triggered by File menu → Import
  onImportFiles: (cb) => ipcRenderer.on('import-files', (_e, paths) => cb(paths)),

  // Read a file from a native path (after Import dialog)
  readFile: async (filePath) => {
    const buffer = await fs.promises.readFile(filePath);
    return {
      name:       path.basename(filePath),
      ext:        path.extname(filePath).slice(1).toLowerCase(),
      buffer:     buffer.buffer,
      size:       buffer.byteLength,
    };
  },

  // Trigger native context menu
  showContextMenu: (params) => ipcRenderer.send('show-context-menu', params),

  // Listen for ctx-action replies
  onContextAction: (cb) => ipcRenderer.on('ctx-action', (_e, action, id) => cb(action, id)),

  // Platform info
  platform: process.platform,
  isElectron: true,
});
