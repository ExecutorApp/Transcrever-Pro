#!/usr/bin/env node
/**
 * Baixa e extrai FFmpeg estático para Windows (x64 + ia32) usando fontes adequadas:
 * - x64: BtbN (ZIP) -> Expand-Archive (PowerShell)
 * - ia32: gyan.dev (7z) -> 7z CLI
 * Resultado:
 * - backend/bin/win32-x64/ffmpeg.exe
 * - backend/bin/win32-ia32/ffmpeg.exe
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg, obj) { console.log(`[ffmpeg-fetch] ${msg}`, obj ?? ''); }
function fail(msg, err) { console.error(`[ffmpeg-fetch][erro] ${msg}`, err ?? ''); process.exit(1); }

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function downloadWithRedirect(url, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error('Excesso de redirecionamentos ao baixar FFmpeg'));
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Segue redirecionamento
        file.close(() => fs.unlink(destPath, () => {
          const nextUrl = new URL(res.headers.location, url).toString();
          downloadWithRedirect(nextUrl, destPath, maxRedirects - 1).then(resolve, reject);
        }));
        return;
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      try { file.close(); } catch {}
      reject(err);
    });
  });
}

function expandZipPS(zipPath, destDir) {
  const args = [
    '-NoProfile',
    '-Command',
    'Expand-Archive',
    '-Path', `"${zipPath}"`,
    '-DestinationPath', `"${destDir}"`,
    '-Force'
  ];
  const r = spawnSync('powershell', args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`Expand-Archive falhou (${r.status})`);
}

function extract7z(archivePath, destDir) {
  const r = spawnSync('7z', ['x', archivePath, `-o${destDir}`, '-y'], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`7z falhou (${r.status})`);
}

async function fetchForArch(arch) {
  log(`Baixando FFmpeg para ${arch}...`);

  // Definição por arquitetura
  const source = arch === 'ia32'
    ? { url: 'https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-7.1-essentials_build-win32.7z', ext: '7z' }
    : { url: 'https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip', ext: 'zip' };

  const repoRoot = path.resolve(__dirname, '..');
  const backendDir = path.join(repoRoot, 'backend');
  const archFolder = arch === 'ia32' ? 'win32-ia32' : 'win32-x64';
  const binDir = path.join(backendDir, 'bin', archFolder);
  const ffmpegExe = path.join(binDir, 'ffmpeg.exe');

  if (fs.existsSync(ffmpegExe)) { log(`FFmpeg ${arch} já existe: ${ffmpegExe}`); return; }

  ensureDir(binDir);
  const tempDir = path.join(repoRoot, '.temp-ffmpeg', arch);
  ensureDir(tempDir);

  const archivePath = path.join(tempDir, `ffmpeg-${arch}.${source.ext}`);

  if (!fs.existsSync(archivePath)) {
    log(`Baixando de ${source.url}...`);
    await downloadWithRedirect(source.url, archivePath);
    log('Download concluído.');
  }

  // Extração
  log('Extraindo...');
  const extractDir = path.join(tempDir, 'extract');
  ensureDir(extractDir);
  if (source.ext === 'zip') expandZipPS(archivePath, extractDir);
  else extract7z(archivePath, extractDir);

  // Encontrar ffmpeg.exe dentro da extração
  let ffmpegSource = null;
  const walkDir = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      const p = path.join(dir, it.name);
      if (it.isDirectory()) walkDir(p);
      else if (it.isFile() && it.name.toLowerCase() === 'ffmpeg.exe') { ffmpegSource = p; return; }
    }
  };
  walkDir(extractDir);
  if (!ffmpegSource) fail('ffmpeg.exe não encontrado no pacote extraído');

  fs.copyFileSync(ffmpegSource, ffmpegExe);
  log(`FFmpeg ${arch} instalado em ${ffmpegExe}`);

  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
}

async function main() {
  if (process.platform !== 'win32') fail('Este script é específico para Windows (usa PowerShell/7z).');
  const archFlag = process.argv.find(a => a.startsWith('--arch='));
  let targets = archFlag ? archFlag.replace('--arch=', '').split(',').map(s => s.trim()) : ['x64', 'ia32'];
  targets = targets.filter(a => a === 'x64' || a === 'ia32');
  if (!targets.length) targets = ['x64', 'ia32'];

  for (const arch of targets) {
    try { await fetchForArch(arch); }
    catch (e) { fail(`Falha ao baixar FFmpeg ${arch}`, e); }
  }

  log('Fetch do FFmpeg concluído.');
}

main();