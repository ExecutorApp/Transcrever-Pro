/*
--------------------------------------------------------
  Componente: Lista de Arquivos com Progresso (Restaurado)
--------------------------------------------------------
- Layout simples com botão único no topo
- Cards compactos com informações essenciais
- Status por arquivo: Processando/Aguardando/Concluído
*/

import React, { useState } from 'react';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  duration?: string;
  type: 'video' | 'audio';
  url?: string;
}

interface FileProgressListProps {
  files: FileItem[];
  onRemoveFile: (fileId: string) => void;
  isProcessing: boolean;
  onProcessingComplete: () => void;
  onAddMoreFiles: () => void;
  // Progresso global de processamento (0-100)
  processingProgress?: number;
  // Novo: estágio do processamento para exibir status correto quando não está processando
  processingStage?: 'idle' | 'processing' | 'completed';
}

const FileProgressList: React.FC<FileProgressListProps> = ({
  files,
  onRemoveFile,
  isProcessing,
  onProcessingComplete,
  onAddMoreFiles,
  processingProgress = 0,
  processingStage = 'idle',
}) => {
  // Removidos estados e lógicas de modal/baixar por serem redundantes
  const [/*deprecated*/] = useState(false);

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
          {files.length.toString().padStart(2, '0')} itens
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
              {files.map((file, idx) => (
                <div
                  key={file.id}
                  className="bg-white border-[1px] border-[#E5E7EB] rounded-[8px] p-[16px] hover:border-[#1777CF] transition-all duration-200"
                >
                  <div className="flex items-center gap-[12px]">
                    {/**
                    --------------------------------------------------------
                      Ícone do Arquivo
                    --------------------------------------------------------
                    */}
                    <div className="w-[40px] h-[40px] bg-[#DC2626] rounded-[8px] flex items-center justify-center text-white flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    {/**
                    --------------------------------------------------------
                      Informações do Arquivo
                    --------------------------------------------------------
                    */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-[#1F2937] truncate leading-[18px] mb-[2px]">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-[8px] text-[11px] leading-[14px]">
                        <span className="text-[#6B7280]">{formatFileSize(file.size)}</span>
                        {file.duration && (
                          <>
                            <span className="text-[#6B7280]">•</span>
                            <span className="text-[#6B7280]">{file.duration}</span>
                          </>
                        )}
                        {isProcessing ? (
                          idx === 0 ? (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#1777CF] font-medium">Processando {processingProgress}%</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#F59E0B] font-medium">Aguardando</span>
                            </>
                          )
                        ) : (
                          processingStage === 'completed' ? (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#10B981] font-medium">Concluído</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#6B7280]">•</span>
                              <span className="text-[#F59E0B] font-medium">Aguardando</span>
                            </>
                          )
                        )}
                      </div>
                      {isProcessing && idx === 0 && (
                        <div className="mt-[8px] w-full bg-[#F3F4F6] rounded-[6px] h-[6px] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#1777CF] to-[#0F5FA3] rounded-[6px] transition-all duration-500 ease-out"
                            style={{ width: `${processingProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/**
                    --------------------------------------------------------
                      Ações do Item (removido download)
                    --------------------------------------------------------
                    */}
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
                  </div>
                </div>
              ))}
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