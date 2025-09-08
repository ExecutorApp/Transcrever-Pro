# 📋 Guia de Atualização Manual - Transcrever Pro v1.1.0

## 🆕 Novidades da Versão 1.1.0

### ✨ Melhorias Implementadas:
- **Processamento Sequencial Automático**: Os arquivos agora são processados um por vez automaticamente
- **Delay Inteligente**: Intervalo de 1 segundo entre processamentos para evitar sobrecarga
- **Salvamento Automático**: Todas as transcrições são salvas automaticamente via API
- **Notificações Melhoradas**: Toast de confirmação quando todos os arquivos são processados
- **Correções de API**: URLs corrigidas para melhor comunicação frontend-backend

---

## 🔄 Opção 1: Atualização Automática (Recomendada)

### Pré-requisitos:
- Node.js instalado (versão 16 ou superior)
- Git (opcional, para backup)

### Passos:

1. **Backup dos dados** (opcional mas recomendado):
   ```bash
   # Copie a pasta atual para um local seguro
   cp -r "Transcrever Pro" "Transcrever Pro - Backup"
   ```

2. **Execute o script de build**:
   ```bash
   cd "Transcrever Pro"
   node build-installer.js
   ```

3. **Instale o novo executável**:
   - Localize o arquivo `.exe` na pasta `dist`
   - Execute o instalador
   - Siga as instruções na tela

---

## 🛠️ Opção 2: Atualização Manual

### 1. Preparação

#### Backup dos dados:
```bash
# Faça backup da pasta atual
cp -r "Transcrever Pro" "Transcrever Pro - Backup - $(date +%Y%m%d)"
```

#### Pare os serviços em execução:
- Feche todas as janelas do Transcrever Pro
- No terminal, pressione `Ctrl+C` para parar os serviços

### 2. Atualização dos Arquivos

#### Substitua os arquivos principais:

**Frontend (src/App.tsx)**:
- Substitua o conteúdo com as correções de API
- Adicione as funções de processamento sequencial
- Implemente o salvamento automático

**Backend (server.js)**:
- Adicione o endpoint `/api/save-transcription`
- Verifique as configurações de CORS

**Arquivos de configuração**:
- `package.json` (frontend): versão 1.1.0
- `backend/package.json`: versão 1.1.0
- `src/constants.ts`: URLs corrigidas

### 3. Instalação de Dependências

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 4. Teste da Atualização

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**Verificações**:
- ✅ Backend rodando em `http://localhost:3001`
- ✅ Frontend rodando em `http://localhost:5173`
- ✅ Upload de múltiplos arquivos funciona
- ✅ Processamento sequencial automático
- ✅ Salvamento automático das transcrições
- ✅ Notificação de conclusão

### 5. Build de Produção

```bash
# Gerar build otimizado
npm run build

# Gerar instalador (se necessário)
npm run dist
```

---

## 🔧 Solução de Problemas

### Erro: "Módulo não encontrado"
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Porta já em uso"
```bash
# Mate processos na porta 3001
npx kill-port 3001

# Mate processos na porta 5173
npx kill-port 5173
```

### Backend não responde
```bash
# Verifique se o backend está rodando
curl http://localhost:3001/api/health

# Se não responder, reinicie:
cd backend
npm run dev
```

### Frontend não carrega
```bash
# Limpe o cache do Vite
npm run dev -- --force
```

---

## 📁 Estrutura de Arquivos Atualizada

```
Transcrever Pro/
├── src/
│   ├── App.tsx (✨ ATUALIZADO)
│   ├── constants.ts (✨ ATUALIZADO)
│   └── ...
├── backend/
│   ├── server.js (✨ ATUALIZADO)
│   ├── package.json (✨ ATUALIZADO)
│   └── ...
├── package.json (✨ ATUALIZADO)
├── build-installer.js (🆕 NOVO)
└── GUIA-ATUALIZACAO.md (🆕 NOVO)
```

---

## 🎯 Funcionalidades Principais

### Processamento Sequencial:
- Upload múltiplo de arquivos
- Processamento automático um por vez
- Delay de 1s entre arquivos
- Notificação de conclusão

### Salvamento Automático:
- API endpoint dedicado
- Nomenclatura automática com timestamp
- Salvamento em diretório configurável
- Feedback visual de sucesso/erro

### Interface Melhorada:
- Indicadores visuais de progresso
- Toasts informativos
- Estados de loading claros
- Tratamento de erros aprimorado

---

## 📞 Suporte

Se encontrar problemas durante a atualização:

1. **Verifique os logs** no terminal
2. **Consulte a seção de solução de problemas** acima
3. **Restaure o backup** se necessário
4. **Documente o erro** para futuras referências

---

**Versão do Guia**: 1.1.0  
**Data**: $(date +%Y-%m-%d)  
**Compatibilidade**: Windows 10/11, Node.js 16+