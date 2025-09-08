/*
--------------------------------------------------------
  Componente: Lista de Arquivos com Progresso (Restaurado)
--------------------------------------------------------
- Layout simples com botão único no topo
- Cards compactos com informações essenciais
- Status por arquivo: Processando/Aguardando/Concluído
- Reordenação via HTML5 Drag-and-Drop (sem libs)
*/

import React, { useState } from 'react';
import { FileItem } from './FileManager';

interface FileProgressListProps {
  files: FileItem[];
  onRemoveFile: (fileId: string) => void;
  isProcessing: boolean;
  onProcessingComplete: () => void;
  onAddMoreFiles: () => void;
  // Progresso global (usado como fallback quando item não tem progress)
  processingProgress?: number;
  // Mantido por compatibilidade, não usado para desenhar status por item
  processingStage?: 'idle' | 'processing' | 'completed';
  // Novo: callback para reordenar itens
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const FileProgressList: React.FC<FileProgressListProps> = ({
  files,
  onRemoveFile,
  isProcessing,
  onProcessingComplete,
  onAddMoreFiles,
  processingProgress = 0,
  processingStage = 'idle',
  onReorder,
}) => {
  // Removidos estados e lógicas de modal/baixar por serem redundantes
  const [/*deprecated*/] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Contagens para o cabeçalho (XX/YY Itens)
  const totalCount = files.length;
  const completedCount = files.filter((f) => f.status === 'completed').length;
  const format2d = (n: number) => n.toString().padStart(2, '0');

  /*
  --------------------------------------------------------
    DnD helpers (HTML5)
  --------------------------------------------------------
  */
  const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return; // bloquear reorder durante processamento
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };
  const handleDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    e.preventDefault();
    const from = dragIndex ?? parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!Number.isNaN(from) && from !== index) {
      onReorder(from, index);
    }
    setDragIndex(null);
  };
  const handleDragEnd = () => setDragIndex(null);

  /*
  --------------------------------------------------------
    Funções auxiliares de UI removidas
  --------------------------------------------------------
  StatusIcon removido conforme solicitação do usuário para
  simplificar o layout e remover ícones redondos.
  */

  /*
  --------------------------------------------------------
    Função: Obter Ícone do Tipo de Arquivo
  --------------------------------------------------------
  */
  const getFileIcon = (type: 'video' | 'audio') => {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/**
      --------------------------------------------------------
        Cabeçalho Padronizado
      --------------------------------------------------------
      */}
      <div className="flex items-center justify-between mb-[16px]">
        <h3 className="text-[18px] font-semibold text-[#1F2937] leading-[24px]">
          Uploads de Arquivos
        </h3>
        <span className="text-[14px] text-[#6B7280] bg-[#F3F4F6] px-[12px] py-[4px] rounded-[20px]">
          {`${format2d(completedCount)}/${format2d(totalCount)} Itens`}
        </span>
      </div>

      {/**
      --------------------------------------------------------
        Botão de Adicionar Mais Arquivos (remoção de Download Todos)
      --------------------------------------------------------
      */}
      <div className="mb-[16px]">
        <div className="flex gap-[8px]">
          <button
            onClick={onAddMoreFiles}
            disabled={isProcessing}
            className="flex-1 px-[16px] py-[12px] bg-[#1777CF] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#0F5FA3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            + Adicionar Arquivos
          </button>
          {/** Botão de Limpar Lista */}
          <button
            onClick={() => {
              if (isProcessing || files.length === 0) return;
              files.forEach((f) => onRemoveFile(f.id));
            }}
            disabled={isProcessing || files.length === 0}
            title="Limpar lista"
            aria-label="Limpar lista"
            className="w-[44px] h-[44px] bg-[#F3F4F6] text-[#6B7280] rounded-[8px] hover:bg-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center"
          >
            <svg width="40" height="36" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <g>
                <path d="M43.49 4.587c.68.68.68 1.78 0 2.46L23.643 26.9l1.815 1.81a5.206 5.206 0 0 1 .642 6.6c-.299.442-.944.476-1.322.1L12.572 23.24c-.378-.377-.344-1.02.099-1.318a5.246 5.246 0 0 1 6.621.64l1.885 1.88L41.023 4.587a1.748 1.748 0 0 1 2.466 0zM4.76 30.207a.495.495 0 0 1 .47-.138c3.102.773 6.282-1.666 8.02-3.33l-2.063-2.055c-1.44 1.354-3.846 3.215-6.44 3.53-.718.086-.997.985-.486 1.494l.5.498zM19.106 43.82c.019.032.024.068.036.102.325-.08.603-.332.65-.711.314-2.588 2.182-4.986 3.54-6.422l-9.366-9.336c-1.612 1.556-4.44 3.765-7.504 3.765-.242 0-.485-.014-.728-.043l1.496 1.491a.489.489 0 0 1 .445-.144c2.788.555 5.076-1.685 5.1-1.707a.5.5 0 1 1 .705.708c-.096.096-2.132 2.09-4.891 2.09a5.75 5.75 0 0 1-.432-.022l6.608 6.588c-.644-3.268 3.368-7.33 3.56-7.52a.499.499 0 1 1 .705.708c-.047.046-4.635 4.677-3.007 7.38.12.2.076.445-.082.604l1.751 1.746c-.836-2.78 1.224-4.882 1.249-4.906a.5.5 0 0 1 .707.707c-.09.09-2.162 2.232-.542 4.922z" fill="#1777CF"/>
              </g>
            </svg>
          </button>
          {/** Botão de Baixar Todos removido por redundância */}
        </div>
      </div>

      {/**
      --------------------------------------------------------
        Área de Conteúdo Sempre Visível
      --------------------------------------------------------
      */}
      <div className="flex-1 min-h-0">
        <div className="h-full bg-[#F8FAFC] rounded-[12px] p-[12px] border-[1px] border-[#E5E7EB] overflow-y-auto">
          {files.length === 0 ? (
            /**
            --------------------------------------------------------
              Estado Vazio Padronizado
            --------------------------------------------------------
            */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-[48px] h-[48px] bg-[#E5E7EB] rounded-[12px] flex items-center justify-center mx-auto mb-[12px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[14px] text-[#6B7280] leading-[20px]">
                  Adicione uma nova URL ou arquivo para começar.
                </p>
              </div>
            </div>
          ) : (
            /**
            --------------------------------------------------------
              Lista de Arquivos Simples
            --------------------------------------------------------
            */
            <div className="space-y-[12px]">
              {files.map((file, idx) => {
                const status = file.status || (isProcessing && idx === 0 ? 'processing' : 'pending');
                const progress = typeof file.progress === 'number' ? file.progress : (isProcessing && idx === 0 ? processingProgress : 0);
                return (
                  <div
                    key={file.id}
                    className={`bg-white border-[1px] rounded-[8px] p-[16px] hover:border-[#1777CF] transition-all duration-200 ${dragIndex === idx ? 'border-[#1777CF]' : 'border-[#E5E7EB]'}`}
                    draggable={!isProcessing}
                    onDragStart={handleDragStart(idx)}
                    onDragOver={handleDragOver(idx)}
                    onDrop={handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-[12px]">
                      {/** Ícone */}
                      <div className="relative w-[40px] h-[40px] bg-[#DC2626] rounded-[8px] flex items-center justify-center text-white flex-shrink-0">
                        {getFileIcon(file.type)}
                        {status === 'completed' && (
                          <span className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full bg-[#10B981] flex items-center justify-center shadow-sm" title="Concluído">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M7 12.5L10.5 16L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </div>

                      {/** Informações */}
                      <div className="flex-1 min-w-0">
                        {/** Primeira linha: apenas o título */}
                        <h4 className="text-[14px] font-semibold text-[#1F2937] truncate leading-[18px] mb-[4px]">
                          {file.name}
                        </h4>
                        
                        {/** Segunda linha: tamanho, status e progresso */}
                        <div className="flex items-center gap-[8px] text-[11px] leading-[14px] mb-[8px]">
                          <span className="text-[#6B7280]">{formatFileSize(file.size)}</span>
                          {file.duration && (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#6B7280]">{file.duration}</span>
                            </>
                          )}
                          {status === 'processing' ? (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#1777CF] font-medium">
                                Processando {progress}%
                              </span>
                            </>
                          ) : status === 'completed' ? (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#10B981] font-medium">
                                Concluído
                              </span>
                            </>
                          ) : status === 'error' ? (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#DC2626] font-medium">
                                Erro
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#F59E0B] font-medium">
                                Aguardando
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/** Barra de progresso (sempre visível quando em processamento) */}
                        {status === 'processing' && (
                          <div className="w-full bg-[#F3F4F6] rounded-[6px] h-[6px] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#1777CF] to-[#0F5FA3] rounded-[6px] transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/** Ações */}
                      <div className="flex items-center gap-[8px]">
                        {!isProcessing && (
                          <button
                            onClick={() => onRemoveFile(file.id)}
                            className="w-[32px] h-[32px] bg-[#F3F4F6] text-[#6B7280] rounded-[6px] hover:bg-[#E5E7EB] transition-all duration-200 shadow-sm flex items-center justify-center flex-shrink-0"
                            title="Remover"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                        {isProcessing && (
                          <div className="w-[32px] h-[32px] flex items-center justify-center text-[#9CA3AF]" title="Aguarde">
                            {/* placeholder para alinhamento - svg removido conforme solicitado */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/**
      --------------------------------------------------------
        Modal de Download removido
      --------------------------------------------------------
      */}
    </div>
  );
};

// Utilitário local preservado
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileProgressList;