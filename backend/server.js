import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import ytdl from 'ytdl-core';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

// Base directory (ESM friendly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'file://',
  'null',
]);
app.use(cors({
  origin: (origin, callback) => {
    // Permitir chamadas sem origin (ex: curl) e Electron (file:// => null)
    if (!origin || allowedOrigins.has(origin) || process.env.ALLOW_ANY_ORIGIN === 'true') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/*
--------------------------------------------------------
  Rota: Download do Instagram
--------------------------------------------------------
*/
app.post('/api/download/instagram', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('🔍 Processando Instagram:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Tentar múltiplas APIs para Instagram
    let videoInfo = null;

    // Método 1: Instagram Reels Downloader API
    try {
      const response = await fetch('https://instagram-reels-downloader-api.p.rapidapi.com/downloadReel', {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'instagram-reels-downloader-api.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Resposta Instagram API 1:', data);

        const downloadUrl = data.direct_media_url || data.downloadUrl || data.url || data.video_url;
        if (downloadUrl) {
          videoInfo = {
            downloadUrl,
            filename: `instagram_${Date.now()}.mp4`,
            title: data.title || data.caption || 'Instagram Video',
            duration: data.duration || '00:00',
            platform: 'Instagram'
          };
        }
      }
    } catch (error) {
      console.log('❌ API 1 falhou:', error.message);
    }

    // Método 2: Instagram Downloader alternativo
    if (!videoInfo) {
      try {
        const response = await fetch('https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index', {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Resposta Instagram API 2:', data);

          const downloadUrl = data.url || data.video_url || data.download_url;
          if (downloadUrl) {
            videoInfo = {
              downloadUrl,
              filename: `instagram_${Date.now()}.mp4`,
              title: data.title || 'Instagram Video',
              duration: data.duration || '00:00',
              platform: 'Instagram'
            };
          }
        }
      } catch (error) {
        console.log('❌ API 2 falhou:', error.message);
      }
    }

    if (videoInfo) {
      console.log('✅ Instagram download bem-sucedido');
      res.json(videoInfo);
    } else {
      throw new Error('Não foi possível obter URL de download do Instagram');
    }

  } catch (error) {
    console.error('❌ Erro no download do Instagram:', error);
    res.status(500).json({ 
      error: 'Falha ao processar Instagram', 
      details: error.message 
    });
  }
});

/*
--------------------------------------------------------
  Rota: Download do YouTube
--------------------------------------------------------
*/
app.post('/api/download/youtube', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('🔍 Processando YouTube:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Extrair ID do YouTube
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'URL do YouTube inválida' });
    }

    let videoInfo = null;

    // Método 1: ytdl-core (biblioteca Node.js)
    try {
      if (await ytdl.validateURL(url)) {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'videoandaudio' });

        if (format) {
          videoInfo = {
            downloadUrl: format.url,
            filename: `youtube_${info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`,
            title: info.videoDetails.title,
            duration: formatDuration(info.videoDetails.lengthSeconds),
            platform: 'YouTube'
          };
        }
      }
    } catch (error) {
      console.log('❌ ytdl-core falhou:', error.message);
    }

    // Método 2: RapidAPI YouTube como backup
    if (!videoInfo) {
      try {
        const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Resposta YouTube API:', data);

          const downloadUrl = data.downloadUrl || data.direct_media_url || data.url;
          if (downloadUrl) {
            videoInfo = {
              downloadUrl,
              filename: `youtube_${data.title?.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}.mp4`,
              title: data.title || 'YouTube Video',
              duration: data.duration || '00:00',
              platform: 'YouTube'
            };
          }
        }
      } catch (error) {
        console.log('❌ RapidAPI YouTube falhou:', error.message);
      }
    }

    if (videoInfo) {
      console.log('✅ YouTube download bem-sucedido');
      res.json(videoInfo);
    } else {
      throw new Error('Não foi possível obter URL de download do YouTube');
    }

  } catch (error) {
    console.error('❌ Erro no download do YouTube:', error);
    res.status(500).json({ 
      error: 'Falha ao processar YouTube', 
      details: error.message 
    });
  }
});

/*
--------------------------------------------------------
  Rota: Download do Facebook
--------------------------------------------------------
*/
app.post('/api/download/facebook', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('🔍 Processando Facebook:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Usar Facebook Media Downloader
    const response = await fetch('https://facebook-media-downloader1.p.rapidapi.com/get_media', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'facebook-media-downloader1.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Resposta Facebook API:', data);

    const downloadUrl = data.direct_media_url || data.url || data.download_url;
    if (downloadUrl) {
      const videoInfo = {
        downloadUrl,
        filename: `facebook_${Date.now()}.mp4`,
        title: data.title || 'Facebook Video',
        duration: data.duration || '00:00',
        platform: 'Facebook'
      };

      console.log('✅ Facebook download bem-sucedido');
      res.json(videoInfo);
    } else {
      throw new Error('URL de download não encontrada na resposta da API');
    }

  } catch (error) {
    console.error('❌ Erro no download do Facebook:', error);
    res.status(500).json({ 
      error: 'Falha ao processar Facebook', 
      details: error.message 
    });
  }
});

/*
--------------------------------------------------------
  Funções Utilitárias
--------------------------------------------------------
*/
function extractYouTubeVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/*
--------------------------------------------------------
  Rota de Saúde
--------------------------------------------------------
*/
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Endpoint para salvamento automático com verificação de nomes
app.post('/api/save-transcription', async (req, res) => {
  try {
    const { directory, filename, content } = req.body;
    
    if (!directory || !filename || content === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parâmetros obrigatórios: directory, filename, content' 
      });
    }

    // Verificar se o diretório existe
    if (!fs.existsSync(directory)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Diretório não encontrado' 
      });
    }

    // Função para gerar nome único
    const generateUniqueFilename = (dir, originalName) => {
      const ext = path.extname(originalName);
      const baseName = path.basename(originalName, ext);
      let counter = 1;
      let newFilename = originalName;
      
      while (fs.existsSync(path.join(dir, newFilename))) {
        newFilename = `${counter}_${baseName}${ext}`;
        counter++;
      }
      
      return newFilename;
    };

    const uniqueFilename = generateUniqueFilename(directory, filename);
    const fullPath = path.join(directory, uniqueFilename);

    // Salvar arquivo com BOM para compatibilidade com Notepad
    const contentWithBOM = content.startsWith('\uFEFF') ? content : `\uFEFF${content}`;
    fs.writeFileSync(fullPath, contentWithBOM, 'utf8');

    console.log(`📄 Arquivo salvo: ${fullPath}`);
    
    res.json({ 
      ok: true, 
      path: fullPath,
      filename: uniqueFilename,
      message: 'Arquivo salvo com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao salvar arquivo:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Erro interno ao salvar arquivo',
      details: error.message 
    });
  }
});

/*
--------------------------------------------------------
  Iniciar Servidor
--------------------------------------------------------
*/
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📡 Pronto para receber requisições do frontend`);
});

/*
--------------------------------------------------------
  Rota: Transcrição (Whisper)
--------------------------------------------------------
*/
// Garante que a pasta de uploads exista antes de configurar o multer
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// Resolve de forma robusta o executável do Python no SO
function resolvePythonCommand() {
  const candidates = [];
  const envPy = (process.env.PYTHON || '').trim();
  if (envPy) candidates.push(envPy);
  if (process.platform.startsWith('win')) {
    candidates.push('python');
    candidates.push('py -3');
    candidates.push('py');
  } else {
    candidates.push('python3');
    candidates.push('python');
  }
  for (const cmd of candidates) {
    try {
      const parts = cmd.split(' ').filter(Boolean);
      const bin = parts[0];
      const args = parts.slice(1).concat('--version');
      const res = spawnSync(bin, args, { stdio: 'ignore' });
      if (!res.error && res.status === 0) return cmd;
    } catch {}
  }
  return null;
}

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 [/api/transcribe] Início da requisição', {
      hasFile: !!req.file,
      originalname: req.file?.originalname,
      body: req.body,
    });

    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'Arquivo não enviado' });
    }

    const mode = (req.body?.mode || 'balanced');
    const language = req.body?.language; // opcional
    const inputPath = req.file.path;

    const pyPath = path.join(__dirname, 'transcribe.py');
    const pyExists = fs.existsSync(pyPath);
    const inputExists = fs.existsSync(inputPath);

    console.log('🧪 [/api/transcribe] Execução do Python', { pyPath, pyExists, inputPath, inputExists, mode, language });
    if (!pyExists) {
      return res.status(500).json({ ok: false, error: 'Script transcribe.py não encontrado', details: pyPath });
    }
    if (!inputExists) {
      return res.status(500).json({ ok: false, error: 'Arquivo temporário não encontrado para transcrição', details: inputPath });
    }

    const args = [pyPath, '--input', inputPath, '--mode', mode];
    const lang = (language && typeof language === 'string' && language.trim()) ? language.trim() : 'pt';
    if (lang) {
      args.push('--language', lang);
    }

    // Novo: detectar o comando Python disponível
    const pyCmd = resolvePythonCommand();
    console.log('🐍 [/api/transcribe] Python resolvido:', pyCmd || 'NÃO ENCONTRADO');
    if (!pyCmd) {
      fs.unlink(inputPath, () => {});
      return res.status(500).json({
        ok: false,
        error: 'Python não encontrado. Instale o Python 3.8+ ou configure a variável de ambiente PYTHON com o caminho do executável.',
      });
    }

    const tokens = pyCmd.split(' ').filter(Boolean);
    const pyBin = tokens[0];
    const pyExtra = tokens.slice(1);

    const py = spawn(pyBin, [...pyExtra, ...args], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let responded = false;

    py.stdout.on('data', (d) => {
      const chunk = d.toString();
      stdout += chunk;
    });
    py.stderr.on('data', (d) => {
      const chunk = d.toString();
      stderr += chunk;
      // Log limitado para evitar ruído excessivo
      const preview = chunk.length > 500 ? chunk.slice(0, 500) + '…' : chunk;
      console.warn('🐍 [python][stderr]', preview);
    });

    py.on('error', (err) => {
      console.error('❌ Erro ao iniciar processo Python:', err);
      if (!responded) {
        responded = true;
        fs.unlink(inputPath, () => {});
        return res.status(500).json({ ok: false, error: 'Falha ao iniciar Python (verifique se Python está instalado e no PATH)', details: String(err?.message || err) });
      }
    });

    py.on('close', (code) => {
      // Remover arquivo temporário
      fs.unlink(inputPath, () => {});

      if (responded) return; // já respondido no handler de erro
      responded = true;

      if (code !== 0) {
        console.error('❌ Transcrição falhou. Código de saída:', code);
        // Tentar extrair JSON de erro do stdout (robusto a múltiplos objetos concatenados)
        const tryParseJson = (raw) => {
          try {
            return JSON.parse(raw);
          } catch {
            try {
              const matches = String(raw).match(/\{[\s\S]*?\}/g);
              if (matches && matches.length) {
                return JSON.parse(matches[matches.length - 1]);
              }
            } catch {}
            return null;
          }
        };

        const maybeJson = tryParseJson(stdout);
        if (maybeJson && maybeJson.ok === false) {
          const errMsg = String(maybeJson.error || '').toLowerCase();
          const isMediaErr = errMsg.includes('invalid data')
            || errMsg.includes('falha ao processar arquivo')
            || errMsg.includes('unsupported')
            || errMsg.includes('codec')
            || errMsg.includes('format');
          if (isMediaErr) {
            const payload = {
              ...maybeJson,
              code: 'UNSUPPORTED_MEDIA',
              suggestion: 'Converta o arquivo para WAV PCM 16 kHz mono, MP3, MP4, M4A ou WebM; ou tente reenviar.',
            };
            return res.status(400).json(payload);
          }
          return res.status(500).json(maybeJson);
        }

        return res.status(500).json({ ok: false, error: 'Falha ao transcrever', details: (stderr && stderr.trim()) || (stdout && stdout.trim()) || 'Sem detalhes' });
      }

      try {
        const payload = JSON.parse(stdout || '{}');
        return res.json(payload);
      } catch (e) {
        console.error('Erro parseando saída Python:', e, stdout);
        return res.status(500).json({ ok: false, error: 'Resposta inválida do transcritor' });
      }
    });
  } catch (err) {
    console.error('Erro no endpoint /api/transcribe:', err);
    return res.status(500).json({ ok: false, error: 'Erro interno' });
  }
});

// Robustez: não deixar o processo cair por exceções não tratadas
process.on('uncaughtException', (err) => {
  console.error('🔥 [uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('🔥 [unhandledRejection]', reason);
});