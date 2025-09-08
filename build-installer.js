import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando build do Transcrever Pro v1.1.0...');

try {
  // 1. Limpar builds anteriores
  console.log('🧹 Limpando builds anteriores...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }

  // 2. Instalar dependências do frontend
  console.log('📦 Instalando dependências do frontend...');
  execSync('npm install', { stdio: 'inherit' });

  // 3. Instalar dependências do backend
  console.log('📦 Instalando dependências do backend...');
  execSync('npm run backend:ci', { stdio: 'inherit' });

  // 4. Build do frontend
  console.log('🔨 Fazendo build do frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. Copiar arquivos do backend para o build
  console.log('📁 Copiando arquivos do backend...');
  const backendSrc = path.join(__dirname, 'backend');
  const backendDest = path.join(__dirname, 'dist', 'backend');
  
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }
  
  // Copiar arquivos essenciais do backend
  fs.cpSync(backendSrc, backendDest, { 
    recursive: true,
    filter: (src, dest) => {
      // Excluir node_modules e arquivos desnecessários
      return !src.includes('node_modules') && !src.includes('.git');
    }
  });

  // 6. Gerar instalador com electron-builder
  console.log('📦 Gerando instalador...');
  execSync('npm run dist', { stdio: 'inherit' });

  console.log('✅ Build concluído com sucesso!');
  console.log('📁 Instalador gerado na pasta "dist"');
  
  // Listar arquivos gerados
  const distFiles = fs.readdirSync('dist').filter(file => file.endsWith('.exe'));
  if (distFiles.length > 0) {
    console.log('🎉 Instaladores gerados:');
    distFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}