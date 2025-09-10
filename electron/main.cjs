'use strict';

const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess = null;
let isQuitting = false;
let backendRestartTimer = null;
let backendRestarts = 0;
let backendLogStream = null;

function getBackendLogStream() {
  try {
    if (backendLogStream && !backendLogStream.destroyed) return backendLogStream;
    const userData = app.getPath('userData');
    const logPath = path.join(userData, 'backend.log');
    // Garantir diretório
    fs.mkdirSync(userData, { recursive: true });
    backendLogStream = fs.createWriteStream(logPath, { flags: 'a' });
    const header = `\n===== ${new Date().toISOString()} :: START BACKEND LOG =====\n`;
    backendLogStream.write(header);
    return backendLogStream;
  } catch (_) { return null; }
}

function logBackend(message) {
  try {
    const stream = getBackendLogStream();
    const line = `[main] ${new Date().toISOString()} ${message}\n`;
    if (stream) stream.write(line);
    // Também enviar para stdout quando disponível (dev)
    try { process.stdout.write(line); } catch {}
  } catch {}
}

function resolveBackendEntry() {
  // Em dev: ../backend/server.js; em produção: resources/backend/server.js (via extraResources) ou resources/app.asar.unpacked/backend/server.js
  const devPath = path.join(__dirname, '../backend/server.js');
  const resExtra = path.join(process.resourcesPath || '', 'backend', 'server.js');
  const prodPath = path.join(process.resourcesPath || '', 'app.asar.unpacked', 'backend', 'server.js');
  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(resExtra)) return resExtra;
  if (fs.existsSync(prodPath)) return prodPath;
  return null;
}

function getBackendBaseUrl() {
  const port = process.env.PORT || '3001';
  const host = process.env.HOST || '127.0.0.1';
  return `http://${host}:${port}`;
}

function pingBackendHealth(timeoutMs = 800) {
  return new Promise((resolve) => {
    try {
      const base = getBackendBaseUrl();
      const url = new URL('/api/health', base);
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            resolve(!!j && (j.status === 'OK' || j.ok === true));
          } catch {
            resolve(res.statusCode === 200);
          }
        });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(timeoutMs, () => { try { req.destroy(new Error('timeout')); } catch {} resolve(false); });
    } catch (_) {
      resolve(false);
    }
  });
}

async function ensureBackendRunning() {
  const healthy = await pingBackendHealth(700);
  if (healthy) {
    logBackend('Backend ativo detectado em ' + getBackendBaseUrl() + ' — não será feito spawn.');
    return false; // não iniciou novo processo
  }
  startBackend();
  return true; // iniciou
}

function startBackend() {
  const entry = resolveBackendEntry();
  if (!entry) {
    console.warn('[backend] server.js não encontrado, seguindo sem backend.');
    logBackend('server.js não encontrado. Caminhos testados: ../backend, resources/backend, app.asar.unpacked/backend');
    return;
  }
  // Executa o binário do Electron como Node definindo ELECTRON_RUN_AS_NODE=1
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    PORT: process.env.PORT || '3001',
    FRONTEND_URL: process.env.FRONTEND_URL || 'file://',
    NODE_ENV: process.env.NODE_ENV || 'production',
  };
  // Limpa qualquer agenda de reinício pendente
  if (backendRestartTimer) {
    clearTimeout(backendRestartTimer);
    backendRestartTimer = null;
  }

  const cwd = path.dirname(entry);
  logBackend(`Iniciando backend via spawn. entry=${entry} cwd=${cwd} PORT=${env.PORT} resourcesPath=${process.resourcesPath}`);

  // Capturar stdout/stderr para arquivo de log
  backendProcess = spawn(process.execPath, [entry], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    cwd,
  });

  const stream = getBackendLogStream();
  if (backendProcess.stdout && stream) {
    backendProcess.stdout.on('data', (chunk) => {
      try { stream.write(chunk); } catch {}
      try { process.stdout.write(chunk); } catch {}
    });
  }
  if (backendProcess.stderr && stream) {
    backendProcess.stderr.on('data', async (chunk) => {
      try { stream.write(chunk); } catch {}
      try { process.stderr.write(chunk); } catch {}
      // Se detectar EADDRINUSE, não insistir em reinício se um backend saudável já existir
      const text = String(chunk || '');
      if (text.includes('EADDRINUSE')) {
        const ok = await pingBackendHealth(800);
        if (ok) {
          logBackend('Porta em uso, mas backend saudável detectado — suprimindo reinícios.');
          isQuitting = true; // evita agendar reinício no handler de exit
        }
      }
    });
  }

  backendRestarts = 0; // reset após start bem-sucedido
  backendProcess.on('exit', (code, signal) => {
    console.log(`[backend] encerrado (code=${code}, signal=${signal})`);
    logBackend(`Processo encerrado code=${code} signal=${signal}`);
    backendProcess = null;
    if (!isQuitting) {
      // Reiniciar automaticamente com backoff simples
      backendRestarts += 1;
      const delay = Math.min(1000 * backendRestarts, 10000);
      console.warn(`[backend] processo finalizado. Tentando reiniciar em ${delay}ms...`);
      logBackend(`Agendando reinício em ${delay}ms (tentativa=${backendRestarts})`);
      backendRestartTimer = setTimeout(() => {
        try { startBackend(); } catch (e) { console.error('Falha ao reiniciar backend:', e); logBackend(`Falha ao reiniciar: ${e && e.message}`); }
      }, delay);
    }
  });
  backendProcess.on('error', (err) => {
    console.error('[backend] erro no processo filho:', err);
    logBackend(`Erro no processo filho: ${err && err.message}`);
    if (!isQuitting && !backendRestartTimer) {
      const delay = 2000;
      backendRestartTimer = setTimeout(() => {
        try { startBackend(); } catch (e) { console.error('Falha ao reiniciar backend após erro:', e); logBackend(`Falha ao reiniciar após erro: ${e && e.message}`); }
      }, delay);
    }
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

app.whenReady().then(async () => {
  // Remover completamente o menu da aplicação (oculta barra nativa)
  Menu.setApplicationMenu(null);
  // Iniciar backend local somente se ainda não estiver ativo
  await ensureBackendRunning();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  try { logBackend('App encerrando, finalizando backend...'); } catch {}
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