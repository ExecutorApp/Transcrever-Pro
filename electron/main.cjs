'use strict';

const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess = null;
+let isQuitting = false;
+let backendRestartTimer = null;
+let backendRestarts = 0;

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
+  // Limpa qualquer agenda de reinício pendente
+  if (backendRestartTimer) {
+    clearTimeout(backendRestartTimer);
+    backendRestartTimer = null;
+  }
  backendProcess = spawn(process.execPath, [entry], {
    env,
    stdio: 'inherit',
    windowsHide: true,
  });
+  backendRestarts = 0; // reset após start bem-sucedido
  backendProcess.on('exit', (code, signal) => {
    console.log(`[backend] encerrado (code=${code}, signal=${signal})`);
    backendProcess = null;
+    if (!isQuitting) {
+      // Reiniciar automaticamente com backoff simples
+      backendRestarts += 1;
+      const delay = Math.min(1000 * backendRestarts, 10000);
+      console.warn(`[backend] processo finalizado. Tentando reiniciar em ${delay}ms...`);
+      backendRestartTimer = setTimeout(() => {
+        try { startBackend(); } catch (e) { console.error('Falha ao reiniciar backend:', e); }
+      }, delay);
+    }
  });
+  backendProcess.on('error', (err) => {
+    console.error('[backend] erro no processo filho:', err);
+    if (!isQuitting && !backendRestartTimer) {
+      const delay = 2000;
+      backendRestartTimer = setTimeout(() => {
+        try { startBackend(); } catch (e) { console.error('Falha ao reiniciar backend após erro:', e); }
+      }, delay);
+    }
+  });
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
	autoHideMenuBar: true,
    show: false,
  });
  // Garantir que a barra de menu fique totalmente oculta (sem alternância via Alt)
  mainWindow.setMenuBarVisibility(false);

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
  // Remover completamente o menu da aplicação (oculta barra nativa)
  Menu.setApplicationMenu(null);
  // Iniciar backend local
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
+  isQuitting = true;
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