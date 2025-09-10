#!/usr/bin/env node
/**
 * Builda o binário transcribe.exe via PyInstaller para Windows (x64 e/ou ia32).
 * - Usa o Python do sistema (via py launcher quando disponível)
 * - Instala dependências do requirements.txt
 * - Gera executável standalone em backend/bin/<arch>/transcribe.exe
 * - Mantém um atalho em backend/transcribe.exe quando o build é da mesma arch
 */
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg, obj) { console.log(`[py-build] ${msg}`, obj ?? ''); }
function fail(msg, err) { console.error(`[py-build][erro] ${msg}`, err ?? ''); process.exit(1); }

function run(bin, args, opts = {}) {
  const res = spawnSync(bin, args, { stdio: 'inherit', shell: false, ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`${bin} ${args.join(' ')} => exit ${res.status}`);
  return res;
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function detectPyForArch(arch) {
  const isWin = process.platform === 'win32';
  const candidates = [];
  if (isWin) {
    if (arch === 'ia32') {
      candidates.push(['py', ['-3-32']]);
      candidates.push(['py', ['-2-32']]);
    } else {
      candidates.push(['py', ['-3']]);
    }
    candidates.push(['python', []]);
  } else {
    candidates.push(['python3', []]);
    candidates.push(['python', []]);
  }
  for (const [bin, args] of candidates) {
    try {
      const r = spawnSync(bin, [...args, '--version'], { stdio: 'ignore' });
      if (r.status === 0) return { bin, baseArgs: args };
    } catch {}
  }
  return null;
}

function buildForArch(arch) {
  log(`Iniciando build para ${arch}...`);
  const py = detectPyForArch(arch);
  if (!py) fail(`Python não encontrado para ${arch}. Instale Python e o py launcher (Windows).`);

  const repoRoot = path.resolve(__dirname, '..');
  const backendDir = path.join(repoRoot, 'backend');
  const reqFile = path.join(repoRoot, 'requirements.txt');
  const entry = path.join(backendDir, 'transcribe.py');
  if (!fs.existsSync(entry)) fail('transcribe.py não encontrado em backend/');

  // Instalar dependências
  log('Instalando dependências do Python...');
  run(py.bin, [...py.baseArgs, '-m', 'pip', 'install', '--upgrade', 'pip', 'wheel', 'setuptools']);
  run(py.bin, [...py.baseArgs, '-m', 'pip', 'install', '--upgrade', '-r', reqFile]);
  run(py.bin, [...py.baseArgs, '-m', 'pip', 'install', '--upgrade', 'pyinstaller']);

  // Limpeza
  const workDir = path.join(repoRoot, '.pybuild', arch);
  ensureDir(workDir);

  // Executar PyInstaller
  log('Executando PyInstaller...');
  // Observação: ajustamos o nome para transcribe.exe e coletamos assets/bibliotecas necessárias dos pacotes
  const pyinstallerArgs = [
    ...py.baseArgs,
    '-m', 'PyInstaller',
    '--noconfirm',
    '--onefile',
    '--clean',
    '--name', 'transcribe',
    '--console',
    // Coletar dados e binários essenciais (evita NO_SUCHFILE para assets do VAD/Tokenizer e DLLs)
    '--collect-data', 'faster_whisper',
    '--collect-data', 'tokenizers',
    '--collect-data', 'ctranslate2',
    '--collect-data', 'huggingface_hub',
    '--collect-binaries', 'onnxruntime',
    '--collect-submodules', 'onnxruntime',
    '--collect-binaries', 'ctranslate2',
    entry,
  ];
  run(py.bin, pyinstallerArgs, { cwd: workDir });

  const builtExe = path.join(workDir, 'dist', 'transcribe.exe');
  if (!fs.existsSync(builtExe)) fail('PyInstaller não gerou dist/transcribe.exe');

  // Destinos
  const archFolder = arch === 'ia32' ? 'win32-ia32' : 'win32-x64';
  const outDir = path.join(backendDir, 'bin', archFolder);
  ensureDir(outDir);
  const outExe = path.join(outDir, 'transcribe.exe');

  // Copiar
  fs.copyFileSync(builtExe, outExe);
  log(`Artefato salvo em ${outExe}`);

  // Atalho no backend/ para facilitar (opcional)
  try {
    const shortcut = path.join(backendDir, 'transcribe.exe');
    fs.copyFileSync(builtExe, shortcut);
  } catch {}
}

function main() {
  const archFlag = process.argv.find(a => a.startsWith('--arch='));
  let targets = archFlag ? archFlag.replace('--arch=', '').split(',').map(s => s.trim()) : [process.arch === 'ia32' ? 'ia32' : 'x64'];
  targets = targets.filter(a => a === 'x64' || a === 'ia32');
  if (!targets.length) targets = ['x64'];

  for (const a of targets) {
    try { buildForArch(a); }
    catch (e) { fail(`Falha ao buildar ${a}`, e); }
  }
  log('Build do transcritor concluído.');
}

main();