import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
// Removendo browser-fs-access pois directoryOpen não seleciona diretórios, apenas abre arquivos

interface DirectorySelectorProps {
  onDirectoryChange?: (directory: string) => void;
  currentDirectory?: string;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  onDirectoryChange,
  currentDirectory = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState(currentDirectory);
  const [isSelecting, setIsSelecting] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [pathStatus, setPathStatus] = useState<'valid' | 'invalid' | 'unknown'>('unknown');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const selectingRef = useRef(false); // trava síncrona contra reentrância/double-click
  const inFlightPickerRef = useRef<Promise<any> | null>(null); // cache da promessa em voo
  const callCounterRef = useRef(0); // id para correlação de chamadas
  const GLOBAL_LOCK_KEY = '__tp_showDirectoryPicker_lock__'; // trava global na janela
  const ignoreResultRef = useRef(false); // quando o usuário salva/fecha, ignorar resultados tardios
  const isElectron = typeof window !== 'undefined' && !!window.desktop?.selectDirectory;

  // Sincroniza com currentDirectory apenas se selectedDirectory estiver vazio
  useEffect(() => {
    if (!selectedDirectory && currentDirectory) {
      setSelectedDirectory(currentDirectory);
    }
  }, [currentDirectory, selectedDirectory]);

  const handleSave = () => {
    if (onDirectoryChange) {
      onDirectoryChange(selectedDirectory);
    }
    // Permite finalizar mesmo se um picker estiver aberto: apenas ignoramos o resultado tardio
    ignoreResultRef.current = true;
    setIsSelecting(false);
    selectingRef.current = false;
    inFlightPickerRef.current = null;
    (window as any)[GLOBAL_LOCK_KEY] = false;
    setIsOpen(false);
  };
 
  const handleCancel = () => {
    setSelectedDirectory(currentDirectory);
    // Também ignora resultados em voo ao cancelar
    ignoreResultRef.current = true;
    setIsSelecting(false);
    selectingRef.current = false;
    inFlightPickerRef.current = null;
    (window as any)[GLOBAL_LOCK_KEY] = false;
    setIsOpen(false);
  };

  const validatePath = (path: string) => {
    if (!path.trim()) {
      setPathStatus('unknown');
      setSuggestions([]);
      return;
    }

    // Validação básica de formato de caminho
    const isWindows = /^[A-Za-z]:[\\\//]/.test(path); // Aceita tanto \ quanto /
    const isUnix = /^\//.test(path) || /^~\//.test(path);
    const isRelative = /^\.\//.test(path) || /^\.\./.test(path);

    if (isWindows || isUnix || isRelative) {
      setPathStatus('valid');
      setSuggestions([]);
    } else {
      setPathStatus('invalid');
      generateSuggestions(path);
    }
  };

  const generateSuggestions = (input: string) => {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const suggestions: string[] = [];

    if (isWindows) {
      const windowsPaths = [
        'C:\\Users\\Usuario\\Documents\\Transcricoes',
        'C:\\Users\\Usuario\\Downloads\\Transcricoes',
        'C:\\Users\\Usuario\\Desktop\\Transcricoes',
        'C:\\Transcricoes'
      ];
      
      if (input.toLowerCase().includes('doc')) {
        suggestions.push(windowsPaths[0]);
      } else if (input.toLowerCase().includes('down')) {
        suggestions.push(windowsPaths[1]);
      } else if (input.toLowerCase().includes('desk')) {
        suggestions.push(windowsPaths[2]);
      } else {
        suggestions.push(...windowsPaths.slice(0, 3));
      }
    } else {
      const unixPaths = [
        '/home/user/Documents/Transcricoes',
        '/home/user/Downloads/Transcricoes',
        '/home/user/Desktop/Transcricoes',
        '~/Transcricoes'
      ];
      
      if (input.toLowerCase().includes('doc')) {
        suggestions.push(unixPaths[0]);
      } else if (input.toLowerCase().includes('down')) {
        suggestions.push(unixPaths[1]);
      } else if (input.toLowerCase().includes('desk')) {
        suggestions.push(unixPaths[2]);
      } else {
        suggestions.push(...unixPaths.slice(0, 3));
      }
    }

    setSuggestions(suggestions.slice(0, 3));
  };

  const handleSelectDirectory = async () => {
    // Preparar seleção e permitir que resultados tardios sejam aplicados (reset do ignore)
    ignoreResultRef.current = false;
    const callId = ++callCounterRef.current;
    const now = new Date().toISOString();
    console.log(`🔍 [DirectorySelector] (${callId}) === INÍCIO DA SELEÇÃO DE DIRETÓRIO @ ${now} ===`);
    console.log('🔍 [DirectorySelector] === INÍCIO DA SELEÇÃO DE DIRETÓRIO ===');
    console.log('📊 [DirectorySelector] Estado atual:', { isSelecting, selectedDirectory });
    console.log('🌐 [DirectorySelector] User Agent:', navigator.userAgent);
    console.log('🔧 [DirectorySelector] Verificando APIs disponíveis...');
    console.log('🔧 [DirectorySelector] showDirectoryPicker disponível:', 'showDirectoryPicker' in window);
    console.log('🔧 [DirectorySelector] window.showDirectoryPicker:', typeof (window as any).showDirectoryPicker);
 
    // Trava síncrona para evitar múltiplas aberturas (duplo clique)
    if (selectingRef.current) {
      console.log(`⛔ [DirectorySelector] (${callId}) Seleção já em andamento (ref), ignorando nova tentativa...`);
      return;
    }

    // Trava por promessa em voo (idempotência)
    if (inFlightPickerRef.current) {
      console.warn(`🔁 [DirectorySelector] (${callId}) Já existe uma chamada em progresso, ignorando.`);
      return;
    }

    // Trava global na janela (protege múltiplos componentes)
    if ((window as any)[GLOBAL_LOCK_KEY]) {
      console.warn(`🔒 [DirectorySelector] (${callId}) Trava global ativa, ignorando.`);
      return;
    }

    if (isSelecting) {
      console.log(`⚠️ [DirectorySelector] (${callId}) Já está selecionando, ignorando...`);
      return;
    }

    selectingRef.current = true; // ativa trava imediata
    (window as any)[GLOBAL_LOCK_KEY] = true; // ativa trava global
    setIsSelecting(true);
    setHelpMessage('');
    setError('');
 
    try {
      // [MODO DESKTOP] Se estiver em Electron, usar diálogo nativo do sistema operacional
      if (window.desktop?.selectDirectory) {
        console.log('🖥️ [DirectorySelector] Ambiente Electron detectado. Abrindo diálogo nativo...');
        try {
          const chosen = await window.desktop.selectDirectory({
            title: 'Selecionar Pasta de Destino',
            defaultPath: selectedDirectory || currentDirectory || undefined,
          });
          if (ignoreResultRef.current) {
            console.log('ℹ️ [DirectorySelector] (Electron) Resultado recebido após fechamento/salvamento. Ignorando.');
            return;
          }
          if (chosen) {
            console.log('📂 [DirectorySelector] (Electron) Caminho escolhido:', chosen);
            setSelectedDirectory(chosen);
            validatePath(chosen);
            setHelpMessage('✅ Pasta selecionada com sucesso.');
          } else {
            console.log('🚫 [DirectorySelector] (Electron) Seleção cancelada pelo usuário.');
            setHelpMessage('Seleção cancelada.');
          }
        } catch (e) {
          console.error('❌ [DirectorySelector] (Electron) Falha ao abrir seletor nativo:', e);
          setError('Falha ao abrir o seletor de pastas do sistema.');
        }
        return; // Não seguir para o fluxo web
      }

      // Verificar se showDirectoryPicker está disponível e se estamos em contexto seguro
      if ('showDirectoryPicker' in window && typeof (window as any).showDirectoryPicker === 'function') {
        console.log('🚀 [DirectorySelector] API showDirectoryPicker detectada, tentando usar...');
        console.log('🔒 [DirectorySelector] Contexto seguro:', window.isSecureContext);
        console.log('🌐 [DirectorySelector] Protocolo:', window.location.protocol);
        
        try {
          console.log('📞 [DirectorySelector] Chamando showDirectoryPicker...');
          
          // Remover timeout artificial - a API deve funcionar independente do tamanho da pasta
          const startTime = Date.now();
          console.log('🕐 [DirectorySelector] Iniciando seleção em:', new Date(startTime).toLocaleTimeString());
          console.log('📞 [DirectorySelector] Chamando showDirectoryPicker() - aguardando usuário...');
          
          // Chamar a API diretamente sem timeout artificial
          const pickerPromise: Promise<any> = (window as any).showDirectoryPicker();
          inFlightPickerRef.current = pickerPromise;
          const directoryHandle = await pickerPromise;
          
          const totalTime = Date.now() - startTime;
          console.log('✅ [DirectorySelector] Seleção concluída em:', totalTime + 'ms');
          console.log('📂 [DirectorySelector] Pasta selecionada pelo usuário');

          console.log('📂 [DirectorySelector] Resposta do showDirectoryPicker:', directoryHandle);
         
          if (ignoreResultRef.current) {
            console.log('ℹ️ [DirectorySelector] Resultado recebido após fechamento/salvamento. Ignorando.');
            return;
          }

          if (directoryHandle) {
            console.log('✅ [DirectorySelector] DirectoryHandle recebido:', {
              name: directoryHandle.name,
              kind: directoryHandle.kind
            });
            
            // Tentar obter o caminho real da pasta
            let displayPath = directoryHandle.name;
            
            // Verificar se existe uma forma de obter o caminho completo
            try {
              // Algumas implementações podem ter propriedades adicionais
              if (directoryHandle.getDirectoryHandle || directoryHandle.resolve) {
                console.log('🔍 [DirectorySelector] Tentando obter caminho completo...');
                // Para agora, usar apenas o nome da pasta
                displayPath = directoryHandle.name;
              }
              
              // Se não conseguir o caminho completo, usar o nome da pasta
              console.log('📂 [DirectorySelector] Usando nome da pasta:', displayPath);
            } catch (pathError) {
              console.log('⚠️ [DirectorySelector] Não foi possível obter caminho completo, usando nome:', directoryHandle.name);
              displayPath = directoryHandle.name;
            }
            
            console.log('📂 [DirectorySelector] Caminho final:', displayPath);
            setSelectedDirectory(displayPath);
            validatePath(displayPath);
            setHelpMessage('✅ Pasta selecionada com sucesso!');
            console.log('✅ [DirectorySelector] Seleção concluída com sucesso!');
          } else {
            console.log('❌ [DirectorySelector] DirectoryHandle é null/undefined');
            setError('Nenhuma pasta foi selecionada.');
          }
        } catch (apiError: any) {
          const name = apiError?.name;
          const message: string = apiError?.message || '';

          // Caso específico: já existe um picker ativo (duplo clique / reentrância)
          if (name === 'NotAllowedError' && message.includes('File picker already active')) {
            console.warn('🔁 [DirectorySelector] showDirectoryPicker ignorado: já existe um seletor ativo.');
            console.warn('Detalhes:', { name, message });
            setHelpMessage('O seletor de pastas já está aberto. Conclua ou feche-o e tente novamente. Evite clicar várias vezes.');
            return; // não tratar como erro, apenas informar
          }

          // Para os demais casos, manter logs de erro
          console.error('❌ [DirectorySelector] Erro na API showDirectoryPicker:', apiError);
          console.error('❌ [DirectorySelector] Tipo do erro:', name);
          console.error('❌ [DirectorySelector] Mensagem do erro:', message);
          
          if (name === 'AbortError') {
            console.log('🚫 [DirectorySelector] Usuário cancelou a seleção');
            setHelpMessage('Seleção cancelada pelo usuário ou pasta bloqueada pelo navegador. Escolha uma subpasta (ex.: Documents\\Transcricoes) e tente novamente.');
            return;
          } else if (name === 'NotAllowedError') {
            console.log('🔒 [DirectorySelector] Permissão negada pelo navegador');
            setError('Permissão negada pelo navegador. Digite o caminho da pasta manualmente no campo acima.');
            setHelpMessage('💡 A API de seleção de pastas pode estar bloqueada. Use o campo de texto para inserir o caminho.');
            return; // Não fazer fallback, deixar o usuário digitar manualmente
          } else {
            console.log('🚫 [DirectorySelector] Erro desconhecido, tentando fallback...');
            // Tentar fallback
            throw apiError;
          }
        }
      } else {
        console.log('🔄 [DirectorySelector] API showDirectoryPicker não disponível, usando fallback...');
        throw new Error('API não disponível');
      }
    } catch (fallbackError: any) {
      console.log('🔄 [DirectorySelector] Iniciando fallback com webkitdirectory...');
      
      try {
        // Fallback: usar input file com webkitdirectory
        const input = document.createElement('input');
        input.type = 'file';
        (input as any).webkitdirectory = true;
        input.multiple = true;
        
        console.log('📁 [DirectorySelector] Input criado:', {
          type: input.type,
          webkitdirectory: (input as any).webkitdirectory,
          multiple: input.multiple
        });
        
        input.onchange = (event: any) => {
          if (ignoreResultRef.current) {
            console.log('ℹ️ [DirectorySelector] Fallback resultado ignorado (fechado/salvo).');
            setIsSelecting(false);
            selectingRef.current = false; // libera trava ao finalizar fallback
            inFlightPickerRef.current = null; // limpa promessa
            (window as any)[GLOBAL_LOCK_KEY] = false; // libera trava global
            return;
          }

          console.log('📁 [DirectorySelector] Input onchange disparado');
          const files = event.target.files;
          console.log('📁 [DirectorySelector] Arquivos selecionados:', files?.length || 0);
          
          if (files && files.length > 0) {
            const firstFile = files[0];
            console.log('📁 [DirectorySelector] Primeiro arquivo:', {
              name: firstFile.name,
              webkitRelativePath: firstFile.webkitRelativePath
            });
            
            if (firstFile.webkitRelativePath) {
              const pathParts = firstFile.webkitRelativePath.split('/');
              const directoryName = pathParts[0];
              
              console.log('📁 [DirectorySelector] Nome do diretório extraído:', directoryName);
              
              // Construir o caminho de exibição
              const isWindows = navigator.userAgent.includes('Windows');
              const displayPath = isWindows 
                ? `C:\\Users\\Usuario\\Documents\\${directoryName}`
                : `/home/user/Documents/${directoryName}`;
              
              console.log('📂 [DirectorySelector] Caminho construído (fallback):', displayPath);
              setSelectedDirectory(displayPath);
              validatePath(displayPath);
              setHelpMessage('✅ Pasta selecionada com sucesso!');
              console.log('✅ [DirectorySelector] Seleção concluída com fallback!');
            } else {
              console.log('❌ [DirectorySelector] webkitRelativePath não disponível');
              setError('Erro ao processar a pasta selecionada.');
            }
          } else {
            console.log('❌ [DirectorySelector] Nenhum arquivo selecionado no fallback');
            setError('Nenhuma pasta foi selecionada.');
          }
          setIsSelecting(false);
          selectingRef.current = false; // libera trava ao finalizar fallback
          inFlightPickerRef.current = null; // limpa promessa
          (window as any)[GLOBAL_LOCK_KEY] = false; // libera trava global
        };
        
        input.onerror = (error) => {
          if (ignoreResultRef.current) {
            console.log('ℹ️ [DirectorySelector] Fallback erro ignorado (fechado/salvo).');
            setIsSelecting(false);
            selectingRef.current = false; // libera trava em erro
            inFlightPickerRef.current = null; // limpa promessa
            (window as any)[GLOBAL_LOCK_KEY] = false; // libera trava global
            return;
          }

          console.error('❌ [DirectorySelector] Erro no input:', error);
          setError('Erro ao abrir o seletor de arquivos.');
          setIsSelecting(false);
          selectingRef.current = false; // libera trava em erro
          inFlightPickerRef.current = null; // limpa promessa
          (window as any)[GLOBAL_LOCK_KEY] = false; // libera trava global
        };
        
        console.log('📁 [DirectorySelector] Disparando click no input...');
        input.click();
        console.log('📁 [DirectorySelector] Click disparado, aguardando resposta do usuário...');
        return; // Não executar o finally aqui pois o onchange vai lidar com setIsSelecting
      } catch (inputError: any) {
        console.error('❌ [DirectorySelector] Erro no fallback:', inputError);
        setError('Erro ao abrir o seletor de arquivos. Digite o caminho da pasta manualmente no campo acima.');
      }
    } finally {
      setIsSelecting(false);
      selectingRef.current = false; // garante liberação da trava
      inFlightPickerRef.current = null; // garante limpeza
      (window as any)[GLOBAL_LOCK_KEY] = false; // libera trava global
      console.log('🏁 [DirectorySelector] Processo finalizado');
    }
  };

  return (
    <>
      {/* Ícone de pasta no header */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          // Se não há pasta selecionada, define uma pasta padrão inteligente
          if (!selectedDirectory && !currentDirectory) {
            const smartDefault = navigator.platform.toLowerCase().includes('win') 
              ? 'C:\\Users\\Usuario\\Documents\\Transcricoes'
              : '/home/user/Documents/Transcricoes';
            setSelectedDirectory(smartDefault);
            validatePath(smartDefault);
          } else if (!selectedDirectory && currentDirectory) {
            setSelectedDirectory(currentDirectory);
          }
          setHelpMessage('💡 Clique em "Selecionar" para escolher uma pasta ou edite o caminho acima.');
          setIsOpen(true);
        }}
        className="h-9 w-9 hover:bg-gray-100 transition-colors"
        title="Selecionar pasta de destino"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" xmlSpace="preserve" className="h-7 w-7" style={{color: '#1777CF'}}>
          <g>
            <path d="M313.2 316.3c-5.9-5.9-15.4-5.9-21.2 0l-21 21v-93.8c0-8.3-6.7-15-15-15s-15 6.7-15 15v93.8l-21-21c-5.9-5.9-15.4-5.9-21.2 0-5.9 5.9-5.9 15.4 0 21.2l46.6 46.6c5.9 5.9 15.4 5.9 21.2 0l46.6-46.6c5.9-5.8 5.9-15.3 0-21.2z" fill="currentColor" opacity="1"></path>
            <path d="M0 157.1V78.5c0-16.6 13.4-30 30-30h123.4c12.9 0 25.4 4.2 35.8 11.8L233.1 93c10.4 7.7 22.9 11.8 35.8 11.8H482c16.6 0 30 13.4 30 30V157c-7.3-8.3-18.1-13.6-30-13.6H30c-11.9.1-22.7 5.4-30 13.7zm512 26.4v250c0 16.6-13.4 30-30 30H30c-16.6 0-30-13.4-30-30v-250c0-16.6 13.4-30 30-30h452c16.6 0 30 13.4 30 30zm-131 125c0-69-56-125-125-125s-125 56-125 125 56 125 125 125 125-56 125-125z" fill="currentColor" opacity="1"></path>
          </g>
        </svg>
      </Button>

      {/* Modal de seleção de diretório */}
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          // Ao fechar, ignorar resultados tardios e limpar travas
          if (!open) {
            ignoreResultRef.current = true;
            setIsSelecting(false);
            selectingRef.current = false;
            inFlightPickerRef.current = null;
            (window as any)[GLOBAL_LOCK_KEY] = false;
          }
          setIsOpen(open);
        }}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Selecionar Pasta de Destino
            </DialogTitle>
            <DialogDescription>
              Escolha uma pasta onde os arquivos transcritos serão salvos. Alguns diretórios padrão do sistema podem ser bloqueados pelo navegador; selecione uma subpasta como "Documents\\Transcricoes".
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="directory-path" className="text-sm font-medium">
                Caminho da Pasta
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input
                      id="directory-path"
                      value={selectedDirectory}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedDirectory(value);
                        setHelpMessage('');
                        setError('');
                        validatePath(value);
                      }}
                      readOnly={isElectron}
                      placeholder={isElectron ? 'Selecione usando o botão ao lado (Electron)' : 'Ex: C\\Users\\SeuNome\\Documents\\Transcricoes'}
                      className={`pr-10 ${
                        pathStatus === 'valid' ? 'border-green-500' : 
                        pathStatus === 'invalid' ? 'border-red-500' : ''
                      }`}
                    />
                    {pathStatus === 'valid' && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {pathStatus === 'invalid' && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Sugestões:</p>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedDirectory(suggestion);
                            validatePath(suggestion);
                            setSuggestions([]);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border text-gray-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSelectDirectory}
                  disabled={isSelecting || selectingRef.current}
                  variant="outline"
                  className="px-3"
                  type="button"
                >
                  {isSelecting ? 'Selecionando...' : 'Selecionar'}
                </Button>
              </div>
            </div>
            
            {helpMessage && (
              <div className={`rounded-md p-3 ${
                helpMessage.includes('✅') ? 'bg-green-50 border border-green-200' :
                helpMessage.includes('💡') ? 'bg-blue-50 border border-blue-200' :
                helpMessage.includes('📁') ? 'bg-gray-50 border border-gray-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm ${
                  helpMessage.includes('✅') ? 'text-green-800' :
                  helpMessage.includes('💡') ? 'text-blue-800' :
                  helpMessage.includes('📁') ? 'text-gray-800' :
                  'text-yellow-800'
                }`}>
                  {helpMessage}
                </p>
              </div>
            )}
            
            {error && (
              <div className="rounded-md p-3 bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">
                  {error}
                </p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>Os arquivos transcritos serão salvos nesta pasta.</p>
              {selectedDirectory ? (
                <p className="mt-1">
                  <strong>Pasta selecionada:</strong> {selectedDirectory}
                </p>
              ) : (
                <p className="mt-1">
                  <strong>Exemplo:</strong> C:\\Users\\SeuNome\\Documents\\Transcricoes
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} type="button">
              Fechar
            </Button>
            <Button onClick={handleSave} type="button">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DirectorySelector;