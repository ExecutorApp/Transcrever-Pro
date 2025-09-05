'use strict';

const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

let mainWindow;

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
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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

    // Permitir apenas extensões seguras (.txt)
    const safeExt = ['.txt'];
    const ext = path.extname(filename).toLowerCase();
    if (!safeExt.includes(ext)) {
      throw new Error('Extensão de arquivo não permitida');
    }

    // Normalizar e construir caminho final
    const safeDir = path.normalize(directory);
    const finalPath = path.join(safeDir, filename);

    // Garantir que o diretório existe
    await fsp.mkdir(safeDir, { recursive: true });

    // Adicionar BOM para arquivos .txt para compatibilidade com editores do Windows
    const withBOM = ext === '.txt' ? (content.startsWith('\uFEFF') ? content : '\uFEFF' + content) : content;

    // Escrever arquivo com encoding UTF-8 (com BOM para .txt)
    await fsp.writeFile(finalPath, withBOM, { encoding: 'utf8' });

    return { ok: true, path: finalPath };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return { ok: false, error: message };
  }
});