/*
--------------------------------------------------------
  Componente: Gerenciador de Arquivos
--------------------------------------------------------
- Grid responsivo para múltiplos arquivos
- Informações compactas de cada arquivo
- Botões de remoção individuais
- Scroll horizontal quando necessário
*/

import React from 'react';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  duration?: string;
  type: 'video' | 'audio';
  url?: string;
  // Referência opcional ao objeto File original para upload
  file?: File;
}

interface FileManagerProps {
  files: FileItem[];
  onRemoveFile: (fileId: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ files, onRemoveFile }) => {
  /*
  --------------------------------------------------------
    Função: Formatar Tamanho do Arquivo
  --------------------------------------------------------
  */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /*
  --------------------------------------------------------
    Função: Obter Ícone do Tipo de Arquivo
  --------------------------------------------------------
  */
  const getFileIcon = (type: 'video' | 'audio') => {
    if (type === 'video') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C12 1 15 4 19 4V11C19 16 12 23 12 23C12 23 5 16 5 11V4C9 4 12 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-[32px]">
        <div className="w-[48px] h-[48px] bg-[#F3F4F6] rounded-[12px] flex items-center justify-center mx-auto mb-[12px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[14px] text-[#6B7280] leading-[20px]">
          Nenhum arquivo selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[20px]">
        Arquivos Selecionados ({files.length})
      </h3>
      
      {/*
      --------------------------------------------------------
        Grid de Arquivos
      --------------------------------------------------------
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px] max-h-[200px] overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-[12px] p-[12px] bg-white border-[1px] border-[#E5E7EB] rounded-[8px] hover:border-[#1777CF] transition-all duration-200"
          >
            {/*
            --------------------------------------------------------
              Ícone do Tipo de Arquivo
            --------------------------------------------------------
            */}
            <div className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center ${
              file.type === 'video' 
                ? 'bg-[#FEF2F2] text-[#DC2626]' 
                : 'bg-[#FAF5FF] text-[#7C3AED]'
            }`}>
              {getFileIcon(file.type)}
            </div>

            {/*
            --------------------------------------------------------
              Informações do Arquivo
            --------------------------------------------------------
            */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1F2937] truncate leading-[16px]">
                {file.name}
              </p>
              <div className="flex items-center gap-[8px] text-[11px] text-[#6B7280] leading-[14px]">
                <span>{formatFileSize(file.size)}</span>
                {file.duration && (
                  <>
                    <span>•</span>
                    <span>{file.duration}</span>
                  </>
                )}
              </div>
            </div>

            {/*
            --------------------------------------------------------
              Botão de Remover
            --------------------------------------------------------
            */}
            <button
              onClick={() => onRemoveFile(file.id)}
              className="w-[24px] h-[24px] flex items-center justify-center text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-[4px] transition-all duration-200"
              title="Remover arquivo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;