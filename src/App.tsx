import React, { useState } from 'react';
import { Toaster } from './components/ui/toaster';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import FileProgressList from './components/FileProgressList';
import UrlProgressList from './components/UrlProgressList';
import RealTimeTranscription from './components/RealTimeTranscription';
import TranscriptionModePanel, { type TranscriptionMode } from './components/TranscriptionModePanel';

import { getFileBaseName, buildDefaultTranscriptContent } from './lib/utils';
import { API_TRANSCRIBE, API_SAVE_TRANSCRIPTION, API_HEALTH } from './constants';

import { FileItem } from './components/FileManager';
import { toast } from './hooks/use-toast';

// Estados e tipos locais
type CurrentState = 'upload' | 'mode-selection' | 'real-time-transcription' | 'result' | 'download';

interface DownloadItem {
  id: string;
  url: string;
  platform: string;
  title?: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  error?: string;
}

const App: React.FC = () => {
  // Hooks de estado principais
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [currentState, setCurrentState] = useState<CurrentState>('upload');
  const [selectedMode, setSelectedMode] = useState<TranscriptionMode>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transcriptionData, setTranscriptionData] = useState<{ text: string; language: string; filename: string }>({ text: '', language: '', filename: '' });

  // Manipuladores de entrada
  const handleFileSelect = (files: File | File[]) => {
    const filesArray = Array.isArray(files) ? files : [files];
    if (!filesArray || filesArray.length === 0) return;
    const items: FileItem[] = filesArray.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type && file.type.startsWith('audio') ? 'audio' : 'video',
      file,
      status: 'pending',
      progress: 0,
    }));
    setUploadedFiles((prev) => [...prev, ...items]);
    setCurrentState('mode-selection');
  };

  const handleUrlSubmit = (url: string) => {
    const normalized = (url || '').trim();
    if (!normalized) return;
    const platform = normalized.includes('youtu') ? 'youtube' : normalized.includes('instagram') ? 'instagram' : normalized.includes('facebook') ? 'facebook' : 'other';
    const item: DownloadItem = {
      id: `dl-${Date.now()}-${Math.random()}`,
      url: normalized,
      platform,
      progress: 0,
      status: 'downloading',
    };
    setDownloadItems((prev) => [...prev, item]);
    setCurrentState('mode-selection');
  };

/*
--------------------------------------------------------
  Função: Mover Download para Arquivos
--------------------------------------------------------
*/
const moveDownloadToFiles = (downloadId: string, fileInfo?: any) => {
  const downloadItem = downloadItems.find(item => item.id === downloadId);
  if (!downloadItem) return;

 const filename = fileInfo?.filename || `${downloadItem.platform}_video_${Date.now()}.mp4`;
 const duration = fileInfo?.duration || `${Math.floor(Math.random() * 20) + 5}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  
  const newFile: FileItem = {
    id: `file-${Date.now()}-${Math.random()}`,
    name: filename,
    size: fileInfo?.size || Math.floor(Math.random() * 100000000) + 10000000,
    duration,
    type: 'video',
    url: downloadItem.url
  };

  setUploadedFiles(prev => [...prev, newFile]);
  setDownloadItems(prev => prev.filter(item => item.id !== downloadId));
};

/*
--------------------------------------------------------
  Função: Remover Arquivo
--------------------------------------------------------
*/
const handleRemoveFile = (fileId: string) => {
  setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  
  // Se não há mais arquivos, voltar para upload
  if (uploadedFiles.length === 1 && downloadItems.length === 0) {
    setCurrentState('upload');
  }
};

/*
--------------------------------------------------------
  Função: Adicionar Mais Arquivos (sem sair da tela)
--------------------------------------------------------
*/
const handleBackToUpload = () => {
  // Criar um input file temporário para adicionar mais arquivos
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*,audio/*';
  input.multiple = true;
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      const filesArray = Array.from(target.files);
      handleFileSelect(filesArray);
    }
  };
  input.click();
};

/*
--------------------------------------------------------
  Função: Voltar para Adicionar URLs
--------------------------------------------------------
*/
const handleBackToUrls = () => {
  setCurrentState('upload');
};

/*
--------------------------------------------------------
  Função: Reordenar Arquivos (DnD)
--------------------------------------------------------
*/
const handleReorderFiles = (fromIndex: number, toIndex: number) => {
  setUploadedFiles(prev => {
    const arr = [...prev];
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return arr;
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    return arr;
  });
};

/*
--------------------------------------------------------
  Função: Preparar Dados de Processamento
--------------------------------------------------------
*/

// Função para salvamento automático via API
  const saveTranscriptionAutomatically = async (file: FileItem) => {
    const outputDirectory = localStorage.getItem('outputDirectory') || '';
    if (!outputDirectory || !file.transcription) {
      return;
    }

    try {
      // Usar o conteúdo real da transcrição
      const content = file.transcription;
      // Usar o nome original do arquivo sem extensão + .txt
      const originalBaseName = getFileBaseName(file.name);
      const filename = `${originalBaseName}.txt`;
      
      const response = await fetch(API_SAVE_TRANSCRIPTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directory: outputDirectory,
          filename: filename,
          content: content
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log(`✅ Arquivo salvo automaticamente: ${result.filename}`);
        toast({ 
          title: 'Arquivo Salvo', 
          description: `${result.filename} salvo automaticamente em ${outputDirectory}!` 
        } as any);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error);
      toast({ 
        title: 'Erro no Salvamento', 
        description: `Erro ao salvar ${file.name} automaticamente.` 
      } as any);
    }
  };

// Salvar arquivo de texto (.txt) usando API de salvamento automático
const saveTranscriptionOutputs = async (originalName: string, text: string) => {
  try {
    const directory = localStorage.getItem('outputDirectory') || '';
    if (!directory) {
      toast({
        title: 'Selecione uma pasta de destino',
        description: 'Defina a pasta onde os arquivos serão salvos clicando no ícone de pasta no topo.',
        variant: 'destructive',
      } as any);
      return;
    }

    const base = getFileBaseName(originalName || 'transcricao');
    const filename = `${base}.txt`;
    
    if (!text) {
      toast({ title: 'Nenhum conteúdo para salvar', description: 'A transcrição está vazia.', variant: 'destructive' } as any);
      return;
    }

    try {
      // Usar a API de salvamento automático
      const response = await fetch(API_SAVE_TRANSCRIPTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directory: directory,
          filename: filename,
          content: text
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log(`✅ Arquivo salvo automaticamente: ${result.filename}`);
        toast({ 
          title: 'Arquivo Salvo', 
          description: `${result.filename} salvo automaticamente em ${directory}!` 
        } as any);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error);
      
      // Fallback: Se a API falhar, usar download via Blob
      const contentWithBOM = text.startsWith('\uFEFF') ? text : `\uFEFF${text}`;
      const blob = new Blob([contentWithBOM], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({ 
        title: 'Download iniciado', 
        description: `Erro no salvamento automático. Baixando ${filename}` 
      } as any);
    }
  } catch (e: any) {
    toast({ title: 'Erro ao salvar transcrição', description: e?.message || String(e), variant: 'destructive' } as any);
  }
};

// Utilitário simples de healthcheck
async function pingHealth(timeoutMs = 1500): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(API_HEALTH, { signal: ctrl.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

// Enviar primeiro arquivo para o backend e acompanhar progresso
const transcribeFile = (fileItem: FileItem, mode: TranscriptionMode, language?: string, opts?: { manageGlobalState?: boolean }) => {
  const manageGlobalState = opts?.manageGlobalState ?? true;
  return new Promise<void>((resolve, reject) => {
    if (!fileItem?.file) {
      // marca erro no item
      setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
      toast({ title: 'Arquivo indisponível', description: 'Não foi possível acessar o arquivo para upload.', variant: 'destructive' } as any);
      if (manageGlobalState) {
        setIsProcessing(false);
        setProcessingStage('idle');
      }
      return reject(new Error('Missing File object'));
    }

    // inicia estado do item
    setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing', progress: 0 } : f));

    const form = new FormData();
    form.append('file', fileItem.file);
    form.append('mode', mode);
    if (language) form.append('language', language);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_TRANSCRIBE);

    // Progresso de upload: mapeado para 0-30%
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.min(30, Math.round((e.loaded / e.total) * 30));
      setProcessingProgress(pct);
      setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: pct, status: 'processing' } : f));
    };

    let processingInterval: number | undefined;
    xhr.onloadstart = () => {
      // Enquanto o servidor processa, animar 30% -> 95% lentamente
      if (processingInterval) window.clearInterval(processingInterval);
      processingInterval = window.setInterval(() => {
        setProcessingProgress((prev) => (prev < 95 ? prev + 1 : prev));
        setUploadedFiles(prev => prev.map(f => {
          if (f.id !== fileItem.id) return f;
          const next = typeof f.progress === 'number' ? f.progress + 1 : 31;
          return { ...f, progress: next > 95 ? 95 : next };
        }));
      }, 800);
    };

    // Implementa retry limitado para falhas de conexão
    let attempt = 0;
    const maxAttempts = 3;
    const scheduleRetry = async (reason: string) => {
      attempt += 1;
      console.warn(`⚠️ Transcribe retry ${attempt}/${maxAttempts}. Motivo: ${reason}`);
      const healthy = await pingHealth();
      if (!healthy) {
        console.warn('⚠️ Healthcheck falhou, aguardando backend voltar...');
      }
      const backoff = Math.min(500 * attempt, 2000);
      await new Promise(r => setTimeout(r, backoff));
      if (attempt < maxAttempts) {
        // reabrir e reenviar
        xhr.open('POST', API_TRANSCRIBE);
        xhr.send(form);
      } else {
        if (processingInterval) window.clearInterval(processingInterval);
        if (manageGlobalState) {
          setIsProcessing(false);
          setProcessingStage('idle');
        }
        setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
        toast({ title: 'Falha ao enviar arquivo', description: 'Conexão com backend indisponível. Tente novamente.', variant: 'destructive' } as any);
        reject(new Error('Connection refused after retries'));
      }
    };

    xhr.onerror = () => {
      // Detecção de erro de conexão para retry
      scheduleRetry('xhr.onerror');
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (processingInterval) window.clearInterval(processingInterval);
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const resp = JSON.parse(xhr.responseText || '{}');
            if (resp?.ok) {
              setProcessingProgress(100);
              if (manageGlobalState) {
                setIsProcessing(false);
                setProcessingStage('completed');
              }
              setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'completed', progress: 100 } : f));
              // Atualizar painel de resultado (opcional)
              const normalizedText = (resp.text || '').normalize ? (resp.text || '').normalize('NFC') : (resp.text || '');
              setTranscriptionData({
                text: normalizedText,
                language: resp.language || 'auto',
                filename: fileItem.name,
              });
              // Salvar arquivo .txt
              saveTranscriptionOutputs(fileItem.name, normalizedText)
                .then(() => {
                  toast({ title: 'Transcrição concluída', description: 'Arquivo gerado com sucesso.' } as any);
                  resolve();
                })
                .catch(() => resolve());
            } else {
              if (manageGlobalState) {
                setIsProcessing(false);
                setProcessingStage('idle');
              }
              setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
              toast({ title: 'Erro na transcrição', description: resp?.error || 'Falha ao transcrever o arquivo.', variant: 'destructive' } as any);
              reject(new Error(resp?.error || 'Transcription failed'));
            }
          } else {
            // Novo: tentar extrair mensagem detalhada do backend (JSON) mesmo em status 4xx/5xx
            let description = `Status ${xhr.status}`;
            let derivedTitle: string = 'Erro no servidor';
            try {
              const errJson = JSON.parse(xhr.responseText || '{}');
              if (errJson && errJson.ok === false) {
                description = errJson.error || description;
                if (errJson.suggestion) {
                  description = `${description} — ${errJson.suggestion}`;
                }
                // Se for erro de mídia não suportada (mapeado no backend), ajustar título
                if (errJson.code === 'UNSUPPORTED_MEDIA' || /invalid data|unsupported|codec|format/i.test(String(errJson.error || ''))) {
                  derivedTitle = 'Erro na transcrição';
                }
              }
            } catch (parseErr) {
              console.warn('Falha ao parsear JSON de erro do backend:', parseErr);
            }

            if (manageGlobalState) {
              setIsProcessing(false);
              setProcessingStage('idle');
            }
            setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
            toast({ title: derivedTitle, description: description, variant: 'destructive' } as any);
            reject(new Error(description));
          }
        } catch (e: any) {
          if (manageGlobalState) {
            setIsProcessing(false);
            setProcessingStage('idle');
          }
          setUploadedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' } : f));
          toast({ title: 'Resposta inválida do backend', description: e?.message || String(e), variant: 'destructive' } as any);
          reject(e);
        }
      }
    };

    // Enviar a requisição após configurar handlers
    xhr.send(form);
  });
};

// Processar a fila de transcrições de forma sequencial
const processTranscriptionQueue = async () => {
  if (isProcessing) {
    console.warn('⚠️ Já existe um processamento em andamento. Ignorando nova solicitação.');
    return;
  }

  const queue = uploadedFiles.filter(f => !!f.file && f.status !== 'completed');
  if (queue.length === 0) {
    toast({ title: 'Nenhum arquivo para transcrever', description: 'Adicione um arquivo local válido para iniciar a transcrição.', variant: 'destructive' } as any);
    return;
  }

  setIsProcessing(true);
  setProcessingStage('processing');
  setProcessingProgress(0);

  for (const item of queue) {
    try {
      await transcribeFile(item, selectedMode, 'pt', { manageGlobalState: false });
      
      // Aguardar um pouco antes de processar o próximo arquivo
      const remainingFiles = queue.indexOf(item) < queue.length - 1;
      if (remainingFiles) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch {
      // erros já notificados via toast e estado por item
    }
  }

  setIsProcessing(false);
  setProcessingStage('completed');
  setProcessingProgress(100);
  
  // Verificar se todos os arquivos foram processados
  const allCompleted = uploadedFiles.every(file => 
    file.status === 'completed' || file.status === 'error'
  );
  
  if (allCompleted) {
    toast({
      title: "Processamento Concluído",
      description: "Todas as transcrições foram processadas e salvas automaticamente.",
    } as any);
  }
  
  toast({ title: 'Processamento concluído', description: `${queue.length} arquivo(s) processado(s).` } as any);
};

// Função: Iniciar Transcrição (Atualizada)
const handleStartTranscription = () => {
  console.log('🟪 [App] handleStartTranscription', {
    uploadedFilesCount: uploadedFiles.length,
    downloadItemsCount: downloadItems.length,
    firstUploaded: uploadedFiles[0] ? { id: uploadedFiles[0].id, hasFile: !!uploadedFiles[0].file, name: uploadedFiles[0].name, url: uploadedFiles[0].url } : null,
    isProcessing,
    processingStage,
    selectedMode
  });

  if (isProcessing) {
    console.warn('⚠️ Processamento já em andamento.');
    return;
  }

  // Encontrar primeiro arquivo realmente disponível (com objeto File)
  const first = uploadedFiles.find(f => !!f.file);

  if (!first) {
    // Sem arquivo válido: informar usuário e garantir reset de estados
    toast({ title: 'Nenhum arquivo para transcrever', description: 'Adicione um arquivo local válido para iniciar a transcrição.', variant: 'destructive' } as any);
    setIsProcessing(false);
    setProcessingStage('idle');
    setProcessingProgress(0);
    console.warn('⚠️ [App] Nenhum arquivo File disponível. uploadedFiles:', uploadedFiles, 'downloadItemsCount:', downloadItems.length);
    return;
  }
  
  // Disparar processamento sequencial de toda a fila
  processTranscriptionQueue();
  // Não mudar de tela - manter na mesma tela com progresso
};

// Função: Processamento Concluído
const handleProcessingComplete = async () => {
  setIsProcessing(false);
  setProcessingStage('completed');
  console.log('✅ Todos os arquivos foram processados com sucesso!');

  try {
    const directory = localStorage.getItem('outputDirectory') || '';
    if (!directory) {
      toast({
        title: 'Selecione uma pasta de destino',
        description: 'Defina a pasta onde os arquivos serão salvos clicando no ícone de pasta no topo.',
        variant: 'destructive',
      } as any);
      return;
    }

    // Se houver arquivos enviados, salvar uma transcrição para cada um com o mesmo nome (extensão .txt)
    const filesToSave = Array.isArray(uploadedFiles) ? uploadedFiles : [];
    if (filesToSave.length === 0) {
      toast({
        title: 'Nenhum arquivo para transcrever',
        description: 'Adicione um arquivo ou URL e tente novamente.',
        variant: 'destructive',
      } as any);
      return;
    }

    const nowStr = new Date().toLocaleString();

    for (const f of filesToSave) {
      const base = getFileBaseName(f.name);
      const filename = `${base}.txt`;
      const content = buildDefaultTranscriptContent(f.name, nowStr);

      if (typeof window !== 'undefined' && (window as any).desktop?.saveTextFile && directory) {
        const res = await (window as any).desktop.saveTextFile({ directory, filename, content });
        if (!res?.ok) {
          toast({
            title: `Falha ao salvar ${filename}`,
            description: res?.error || 'Tente novamente.',
            variant: 'destructive',
          } as any);
        }
      } else {
        // Fallback web/Electron: download via Blob (com BOM)
        const contentWithBOM = content.startsWith('\uFEFF') ? content : `\uFEFF${content}`;
        const blob = new Blob([contentWithBOM], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: 'Download iniciado', description: `Baixando ${filename}` } as any);
      }
    }

    toast({ title: 'Transcrição salva', description: 'Os arquivos de transcrição foram gerados com sucesso.' } as any);
  } catch (e: any) {
    toast({
      title: 'Erro ao salvar transcrição',
      description: e?.message || String(e),
      variant: 'destructive',
    } as any);
  }
  // Permanecer na mesma tela - usuário pode baixar arquivos ou adicionar mais
};

// Efeito: Simular Progresso de Processamento Global
// REMOVIDO: simulação de progresso. O progresso agora é atualizado a partir
// do envio real (upload) e do processamento no backend via XHR.

// Efeito de simulação removido: progresso agora é atualizado por XHR (upload) e tick de processamento enquanto aguarda a resposta do backend.

// Função: Obter Nome do Arquivo Principal
const getPrimaryFilename = (): string => {
  if (uploadedFiles.length === 0) return '';
  if (uploadedFiles.length === 1) return uploadedFiles[0].name;
  return `${uploadedFiles.length} arquivos`;
};

// Função: Transcrição Concluída (atualizada)
const handleTranscriptionComplete = async (fullTranscription: string) => {
  setTranscriptionData({
    text: fullTranscription,
    language: 'Português (Brasil)',
    filename: getPrimaryFilename()
  });
  setCurrentState('result');

  // Salvar automaticamente quando houver transcrição completa (modo em tempo real)
  const primaryFile = uploadedFiles[0];
  if (primaryFile) {
    const updatedFile = { ...primaryFile, transcription: fullTranscription, status: 'completed' as const };
    await saveTranscriptionAutomatically(updatedFile);
  }
};

// Função: Resetar Aplicação
const handleResetApp = () => {
  setUploadedFiles([]);
  setDownloadItems([]);
  setCurrentState('upload');
  setSelectedMode('balanced');
  setTranscriptionData({
    text: '',
    language: '',
    filename: ''
  });
};

// Funções de Controle da Transcrição
const handlePauseTranscription = () => {
  console.log('Transcrição pausada');
};

const handleResumeTranscription = () => {
  console.log('Transcrição retomada');
};

// Funções de Ação da Transcrição
const handleEditTranscription = (newText: string) => {
  setTranscriptionData(prev => ({ ...prev, text: newText }));
};

const handleTranslateTranscription = (targetLanguage: string) => {
  // Aqui seria implementada a integração com serviço de tradução
  console.log('Traduzir para:', targetLanguage);
};

const handleDownloadTranscriptionFile = async (format: 'txt') => {
  const filenameBase = transcriptionData.filename || 'transcricao';
  const filename = `${filenameBase}.${format}`;
  const content = transcriptionData.text || '';

  // Verificar se há pasta de destino configurada
  const directory = localStorage.getItem('outputDirectory') || '';
  if (!directory) {
    toast({
      title: 'Selecione uma pasta de destino',
      description: 'Defina a pasta onde os arquivos serão salvos clicando no ícone de pasta no topo.',
      variant: 'destructive',
    } as any);
    return;
  }

  try {
    // Usar a API de salvamento automático
    const response = await fetch(API_SAVE_TRANSCRIPTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        directory: directory,
        filename: filename,
        content: content
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Arquivo salvo automaticamente: ${result.filename}`);
      toast({ 
        title: 'Arquivo Salvo', 
        description: `${result.filename} salvo automaticamente em ${directory}!` 
      } as any);
    } else {
      throw new Error(result.error || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro ao salvar automaticamente:', error);
    
    // Fallback: Se a API falhar, usar download via Blob
    const contentWithBOM = content.startsWith('\uFEFF') ? content : `\uFEFF${content}`;
    const blob = new Blob([contentWithBOM], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({ 
      title: 'Download iniciado', 
      description: `Erro no salvamento automático. Baixando ${filename}` 
    } as any);
  }
};

// Funções de Download
const handleDownloadVideo = () => {
  console.log('Baixar vídeo completo');
  setCurrentState('download');
};

const handleDownloadAudio = () => {
  console.log('Baixar apenas áudio');
  setCurrentState('download');
};

const handleDownloadTranscription = () => {
  console.log('Baixar transcrição');
  setCurrentState('download');
};

return (
  <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] font-sans">
    <Header />
    <Toaster />
    
    {/*
    --------------------------------------------------------
      Container Principal
    --------------------------------------------------------
    */}
    <main className="w-full px-[10px] py-[16px]">
      {/*
      --------------------------------------------------------
        Seção Hero (apenas no estado inicial)
      --------------------------------------------------------
      */}
      {currentState === 'upload' && (
        <div className="text-center mb-[24px]">
          <h1 className="text-[32px] font-bold mb-[8px]">
            <span className="bg-gradient-to-r from-[#1777CF] to-[#0F5FA3] bg-clip-text text-transparent">
              Transcrição automática de vídeo ou áudio
            </span>
          </h1>
          <p className="text-[18px] text-[#6B7280] mb-[24px]">
            Transcrição automática com precisão profissional em minutos.
          </p>
        </div>
      )}

      {/*
      --------------------------------------------------------
        Conteúdo Principal Baseado no Estado
      --------------------------------------------------------
      */}
      <div className="space-y-[20px]">
        {currentState === 'upload' && (
       <div className="max-w-[1000px] mx-auto px-[16px]">
         <UploadSection
           onFileSelect={handleFileSelect}
           onUrlSubmit={handleUrlSubmit}
         />
       </div>
        )}

        {currentState === 'mode-selection' && (
          <div className="h-[calc(100vh-140px)] flex gap-[16px] overflow-hidden">
            {/*
            --------------------------------------------------------
              Container 1: Downloads de URLs
            --------------------------------------------------------
            */}
            <div className="flex-1 h-full min-w-0">
              <div className="w-full bg-white rounded-[16px] p-[24px] shadow-lg border-[1px] border-[#E5E7EB] h-full flex flex-col">
                <UrlProgressList
                  downloadItems={downloadItems}
                  onAddMoreUrls={handleBackToUrls}
                  onAddUrl={handleUrlSubmit}
                />
              </div>
            </div>

            {/*
            --------------------------------------------------------
              Container 2: Uploads de Arquivos
            --------------------------------------------------------
            */}
            <div className="flex-1 h-full min-w-0">
              <div className="w-full bg-white rounded-[16px] p-[24px] shadow-lg border-[1px] border-[#E5E7EB] h-full flex flex-col">
                <FileProgressList
                  files={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                  isProcessing={isProcessing}
                  onProcessingComplete={handleProcessingComplete}
                  onAddMoreFiles={handleBackToUpload}
                  processingProgress={Math.round(processingProgress)}
                  processingStage={processingStage}
                  onReorder={handleReorderFiles}
                />
              </div>
            </div>

            {/*
            --------------------------------------------------------
              Container 3: Escolha de Transcrição
            --------------------------------------------------------
            */}
            <div className="w-[300px] h-full flex-shrink-0">
              <div className="w-full bg-white rounded-[16px] p-[24px] shadow-lg border-[1px] border-[#E5E7EB] h-full flex flex-col justify-center">
                <TranscriptionModePanel
                  selectedMode={selectedMode}
                  onModeSelect={setSelectedMode}
                  onStartTranscription={handleStartTranscription}
                  isProcessing={isProcessing}
                  hasFiles={uploadedFiles.some(f => !!f.file)}
                />
              </div>
            </div>
          </div>
        )}

        {currentState === 'real-time-transcription' && (
          <div className="w-full bg-white rounded-[16px] p-[24px] shadow-lg border-[1px] border-[#E5E7EB]">
            <RealTimeTranscription
              isActive={true}
              isProcessing={isProcessing}
              onComplete={handleTranscriptionComplete}
              onPause={handlePauseTranscription}
              onResume={handleResumeTranscription}
              filename={getPrimaryFilename()}
              mode={selectedMode}
            />
          </div>
        )}

        {currentState === 'result' && (
          <div className="w-full bg-white rounded-[16px] p-[24px] shadow-lg border-[1px] border-[#E5E7EB]">
            <h2 className="text-xl font-semibold mb-2">Transcrição concluída</h2>
            <p className="text-gray-600">Você pode baixar ou editar a transcrição nos controles disponíveis.</p>
          </div>
        )}

      </div>
    </main>
  </div>
);
};

export default App;