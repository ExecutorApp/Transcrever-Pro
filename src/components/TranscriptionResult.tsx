/*
--------------------------------------------------------
  Componente: Resultado da Transcrição
--------------------------------------------------------
- max-h-[400px] ➔ Altura máxima com scroll
- overflow-y-auto ➔ Scroll vertical
- whitespace-pre-wrap ➔ Preserva quebras de linha
- resize-none ➔ Remove redimensionamento
*/

import React, { useState } from 'react';

interface TranscriptionResultProps {
  transcription: string;
  language: string;
  filename: string;
  onEdit: (newText: string) => void;
  onTranslate: (targetLanguage: string) => void;
  onDownload: (format: 'txt') => void;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  transcription,
  language,
  filename,
  onEdit,
  onTranslate,
  onDownload
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcription);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  /*
  --------------------------------------------------------
    Função: Salvar Edição
  --------------------------------------------------------
  */
  const handleSaveEdit = () => {
    onEdit(editedText);
    setIsEditing(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(transcription);
  };

  return (
    <div className="bg-white rounded-[16px] border-[1px] border-[#E5E7EB] shadow-sm overflow-hidden">
      {/*
      --------------------------------------------------------
        Cabeçalho do Resultado
      --------------------------------------------------------
      */}
      <div className="px-[24px] py-[16px] bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] border-b-[1px] border-[#E5E7EB]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-[18px] font-semibold text-[#1F2937] mb-[4px] leading-[24px]">
              Transcrição Concluída
            </h3>
            <div className="flex flex-wrap items-center gap-[12px] text-[12px]">
              <div className="flex items-center gap-[4px]">
                <div className="w-[8px] h-[8px] bg-[#10B981] rounded-full" />
                <span className="text-[#065F46] font-medium">Processamento concluído</span>
              </div>
              <span className="text-[#6B7280]">•</span>
              <span className="text-[#6B7280]">Idioma: {language}</span>
              <span className="text-[#6B7280]">•</span>
              <span className="text-[#6B7280]">Arquivo: {filename}</span>
            </div>
          </div>
        </div>
      </div>

      {/*
      --------------------------------------------------------
        Área de Texto da Transcrição
      --------------------------------------------------------
      */}
      <div className="p-[24px]">
        {isEditing ? (
          <div className="space-y-[12px]">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-[300px] p-[16px] border-[1px] border-[#D1D5DB] rounded-[8px] text-[14px] text-[#374151] leading-[20px] resize-none focus:outline-none focus:ring-[2px] focus:ring-[#1777CF] focus:border-transparent"
              placeholder="Edite sua transcrição aqui..."
            />
            <div className="flex justify-end gap-[8px]">
              <button
                onClick={() => setIsEditing(false)}
                className="px-[16px] py-[8px] text-[14px] font-medium text-[#6B7280] hover:text-[#374151] transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-[16px] py-[8px] bg-[#1777CF] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#0F5FA3] transition-all duration-200"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div
            className="max-h=[400px] overflow-y-auto p-[16px] bg-[#F9FAFB] rounded-[8px] border-[1px] border-[#E5E7EB]"
          >
            <p className="text-[14px] text-[#374151] leading-[22px] whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
        )}
      </div>

      {/*
      --------------------------------------------------------
        Barra de Ações
      --------------------------------------------------------
      */}
      <div className="px-[24px] py-[16px] bg-[#F8FAFC] border-t-[1px] border-[#E5E7EB]">
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          {/*
          --------------------------------------------------------
            Ações Principais
          --------------------------------------------------------
          */}
          <div className="flex flex-wrap items-center gap-[8px]">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-[6px] px-[12px] py-[6px] text-[12px] font-medium text-[#6B7280] hover:text-[#1777CF] hover:bg-white rounded-[6px] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Copiar
            </button>
            
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-[6px] px-[12px] py-[6px] text-[12px] font-medium text-[#6B7280] hover:text-[#1777CF] hover:bg-white rounded-[6px] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Editar
            </button>
          </div>

          {/*
          --------------------------------------------------------
            Tradução e Downloads
          --------------------------------------------------------
          */}
          <div className="flex flex-wrap items-center gap-[8px]">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-[8px] py-[4px] text-[12px] border-[1px] border-[#D1D5DB] rounded-[4px] bg-white focus:outline-none focus:ring-[1px] focus:ring-[#1777CF]"
            >
              <option value="pt-BR">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="fr">Francês</option>
            </select>
            
            <button
              onClick={() => onTranslate(selectedLanguage)}
              className="flex items-center gap-[6px] px-[12px] py-[6px] text-[12px] font-medium text-[#6B7280] hover:text-[#1777CF] hover:bg-white rounded-[6px] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8L3 6L5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H13C15.2091 6 17 7.79086 17 10V10C17 12.2091 15.2091 14 13 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 16L21 18L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 18H11C8.79086 18 7 16.2091 7 14V14C7 11.7909 8.79086 10 11 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Traduzir
            </button>
            
            <button
              onClick={() => onDownload('txt')}
              className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#1777CF] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#0F5FA3] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baixar TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;