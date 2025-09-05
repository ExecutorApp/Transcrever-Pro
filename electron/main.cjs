'use strict';

const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess = null;

function resolveBackendEntry() {
  // Em dev: ../backend/server.js; em produção: resources/app.asar.unpacked/backend/server.js
  const devPath = path.join(__dirname, '../backend/server.js');
  const prodPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'server.js');
  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;
  return null;
}

function startBackend() {
  const entry = resolveBackendEntry();
  if (!entry) {
    console.warn('[backend] server.js não encontrado, seguindo sem backend.');
    return;
  }
  // Executa o binário do Electron como Node definindo ELECTRON_RUN_AS_NODE=1
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    PORT: process.env.PORT || '3001',
    FRONTEND_URL: process.env.FRONTEND_URL || 'file://',
  };
  backendProcess = spawn(process.execPath, [entry], {
    env,
    stdio: 'inherit',
    windowsHide: true,
  });
  backendProcess.on('exit', (code, signal) => {
    console.log(`[backend] encerrado (code=${code}, signal=${signal})`);
    backendProcess = null;
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    try { backendProcess.kill(); } catch {}
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('ready-to-show', () => mainWindow.show());
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  // Iniciar backend local
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  stopBackend();
});

// IPC: abrir seletor nativo de diretório para path completo
ipcMain.handle('dialog:selectDirectory', async (_evt, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Selecionar Pasta',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: options.defaultPath,
  });
  if (result.canceled || !result.filePaths?.length) return null;
  return result.filePaths[0];
});

// Abrir pasta no explorador
ipcMain.handle('shell:showItemInFolder', async (_evt, targetPath) => {
  if (!targetPath) return false;
  shell.showItemInFolder(targetPath);
  return true;
});

// Salvar arquivo de texto (apenas TXT) no disco
ipcMain.handle('fs:saveTextFile', async (_evt, params = {}) => {
  try {
    const { directory, filename, content } = params;

    if (typeof directory !== 'string' || !directory.trim()) {
      throw new Error('Diretório inválido');
    }
    if (typeof filename !== 'string' || !filename.trim()) {
      throw new Error('Nome de arquivo inválido');
    }
    if (typeof content !== 'string') {
      throw new Error('Conteúdo inválido');
    }

    // Sanitizar e validar extensão
    const rawName = path.basename(filename).replace(/[\\/:*?"<>|]/g, '_');
    const ext = path.extname(rawName).toLowerCase();
    const baseName = rawName.slice(0, rawName.length - ext.length) || 'transcricao';

    const safeExt = ['.txt'];
    if (!safeExt.includes(ext)) {
      throw new Error('Extensão de arquivo não permitida');
    }

    const safeDir = path.normalize(directory);
    await fsp.mkdir(safeDir, { recursive: true });

    // Resolver conflitos: prefixar N_ quando já existir
    let effectiveName = `${baseName}${ext}`;
    let finalPath = path.join(safeDir, effectiveName);
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      effectiveName = `${counter}_${baseName}${ext}`;
      finalPath = path.join(safeDir, effectiveName);
      counter += 1;
    }

    // Adicionar BOM para .txt (compatibilidade Notepad)
    const withBOM = ext === '.txt' ? (content.startsWith('\uFEFF') ? content : '\uFEFF' + content) : content;

    await fsp.writeFile(finalPath, withBOM, { encoding: 'utf8' });

    return { ok: true, path: finalPath, filename: effectiveName };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return { ok: false, error: message };
  }
});