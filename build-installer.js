import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler versão dinamicamente do package.json para não desatualizar o log
const pkgJsonPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const appVersion = pkg.version;

function safeCleanReleaseBuild() {
  const outDir = path.join(__dirname, 'release-build');
  if (!fs.existsSync(outDir)) return;
  console.log('🧹 Limpando instaladores antigos...');
  try {
    fs.rmSync(outDir, { recursive: true, force: true });
    return;
  } catch (e) {
    console.warn('⚠️  Não foi possível remover release-build inteira (provável pasta aberta no Explorer). Limpando arquivos dentro...', e.message);
  }

  try {
    const entries = fs.readdirSync(outDir, { withFileTypes: true });
    for (const entry of entries) {
      const p = path.join(outDir, entry.name);
      if (entry.isFile()) {
        if (/\.exe$/i.test(entry.name) || /\.blockmap$/i.test(entry.name) || /^latest\.yml$/i.test(entry.name) || /^builder-.*\.yml$/i.test(entry.name)) {
          try { fs.rmSync(p, { force: true }); } catch {}
        }
      } else if (entry.isDirectory()) {
        // remover artefatos de build anterior
        if (entry.name === 'win-unpacked') {
          try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
        }
      }
    }
  } catch {}
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function listExecutables(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => /\.exe$/i.test(f));
  } catch { return []; }
}

function copyArtifacts(fromDir, toDir) {
  ensureDir(toDir);
  const copyIfExists = (name) => {
    const src = path.join(fromDir, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(toDir, name));
    }
  };

  // Copiar .exe, .blockmap e YAMLs relacionados
  const files = fs.existsSync(fromDir) ? fs.readdirSync(fromDir) : [];
  for (const f of files) {
    if (/\.(exe|blockmap|yml)$/i.test(f)) {
      copyIfExists(f);
    }
  }
}

console.log(`🚀 Iniciando build do Transcrever Pro v${appVersion}...`);

try {
  // 1. Limpar builds anteriores
  console.log('🧹 Limpando builds anteriores...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  // Não apagar a pasta "build" pois contém recursos do instalador (NSIS include)
  safeCleanReleaseBuild();

  // 2. Instalar dependências do frontend
  console.log('📦 Instalando dependências do frontend...');
  execSync('npm install', { stdio: 'inherit' });

  // 3. Instalar dependências do backend
  console.log('📦 Instalando dependências do backend...');
  execSync('npm run backend:ci', { stdio: 'inherit' });

  // 4. Build do frontend
  console.log('🔨 Fazendo build do frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. Copiar arquivos do backend para o build (mantido para assets auxiliares)
  console.log('📁 Copiando arquivos do backend...');
  const backendSrc = path.join(__dirname, 'backend');
  const backendDest = path.join(__dirname, 'dist', 'backend');
  
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }
  
  fs.cpSync(backendSrc, backendDest, { 
    recursive: true,
    filter: (src, dest) => {
      return !src.includes('node_modules') && !src.includes('.git');
    }
  });

  // 6. Construir binário do transcritor (PyInstaller) somente x64
  console.log('🐍 Construindo transcribe.exe (x64)...');
  execSync('npm run py:build:all', { stdio: 'inherit' });

  // 7. Baixar/organizar FFmpeg estático (x64)
  console.log('🎬 Provisionando FFmpeg (x64)...');
  execSync('npm run ffmpeg:fetch', { stdio: 'inherit' });

  // 8. Gerar instalador com electron-builder usando diretório temporário para evitar lock
  console.log('📦 Gerando instalador (x64)...');
  const tempOut = path.join(__dirname, 'release-build-temp');
  // limpar/garantir vazio
  try { fs.rmSync(tempOut, { recursive: true, force: true }); } catch {}
  ensureDir(tempOut);
  // Executar builder com override do output
  execSync(`npx electron-builder --win --x64 -c.directories.output="${tempOut.replace(/\\/g, '/')}"`, { stdio: 'inherit' });

  // 9. Sincronizar artefatos para release-build e limpar temporário
  const finalOut = path.join(__dirname, 'release-build');
  ensureDir(finalOut);
  // remover artefatos antigos (.exe/.blockmap/.yml), mantendo outros arquivos como logs
  try {
    const entries = fs.readdirSync(finalOut, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && (/\.(exe|blockmap|yml)$/i.test(e.name))) {
        try { fs.rmSync(path.join(finalOut, e.name), { force: true }); } catch {}
      }
    }
  } catch {}

  copyArtifacts(tempOut, finalOut);

  // limpar temporário
  try { fs.rmSync(tempOut, { recursive: true, force: true }); } catch {}

  console.log('✅ Build concluído com sucesso!');
  console.log('📁 Instaladores gerados em "release-build"');
  const distFiles = listExecutables(finalOut);
  if (distFiles.length) {
    console.log('🎉 Instaladores gerados:');
    for (const f of distFiles) console.log(`   - ${f}`);
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}