/*
--------------------------------------------------------
  Componente: Painel de Seleção de Modo de Transcrição
--------------------------------------------------------
- Layout vertical compacto
- Três opções de modo empilhadas
- Botão de ação integrado
*/

import React from 'react';

export type TranscriptionMode = 'fast' | 'balanced' | 'perfect';

interface TranscriptionModePanelProps {
  selectedMode: TranscriptionMode;
  onModeSelect: (mode: TranscriptionMode) => void;
  onStartTranscription: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
}

const TranscriptionModePanel: React.FC<TranscriptionModePanelProps> = ({
  selectedMode,
  onModeSelect,
  onStartTranscription,
  isProcessing,
  hasFiles
}) => {
  const modes = [
    {
      id: 'fast' as TranscriptionMode,
      title: 'Rápido',
      description: 'Processamento acelerado',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'from-[#F59E0B] to-[#D97706]',
      bgColor: 'bg-[#FFFBEB]',
      borderColor: 'border-[#F59E0B]',
      textColor: 'text-[#92400E]'
    },
    {
      id: 'balanced' as TranscriptionMode,
      title: 'Equilibrado',
      description: 'Para precisão e velocidade',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'from-[#1777CF] to-[#0F5FA3]',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#1777CF]',
      textColor: 'text-[#1E40AF]'
    },
    {
      id: 'perfect' as TranscriptionMode,
      title: 'Perfeito',
      description: 'Máxima precisão',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1054 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'from-[#059669] to-[#047857]',
      bgColor: 'bg-[#ECFDF5]',
      borderColor: 'border-[#059669]',
      textColor: 'text-[#065F46]'
    }
  ];

  return (
    <div className="space-y-[24px]">
      {/*
      --------------------------------------------------------
        Título da Seção
      --------------------------------------------------------
      */}
      <div className="text-center">
        <h2 className="text-[20px] font-semibold text-[#1F2937] mb-[8px] leading-[28px]">
          Escolha o Modo de Transcrição
        </h2>
      </div>

      {/*
      --------------------------------------------------------
        Opções de Modo (Layout Vertical)
      --------------------------------------------------------
      */}
      <div className="space-y-[12px]">
        {modes.map((mode) => (
          <label
            key={mode.id}
            className={`block p-[16px] rounded-[12px] border-[2px] cursor-pointer transition-all duration-200 hover:shadow-sm ${
              selectedMode === mode.id
                ? `${mode.borderColor} ${mode.bgColor} shadow-sm`
                : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
            }`}
          >
            <input
              type="radio"
              name="transcription-mode"
              value={mode.id}
              checked={selectedMode === mode.id}
              onChange={() => onModeSelect(mode.id)}
              className="sr-only"
            />
            
            {/*
            --------------------------------------------------------
              Conteúdo da Opção
            --------------------------------------------------------
            */}
            <div className="flex items-center gap-[12px]">
              <div className={`w-[40px] h-[40px] bg-gradient-to-br ${mode.color} rounded-[8px] flex items-center justify-center text-white flex-shrink-0`}>
                {mode.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[20px] mb-[2px]">
                  {mode.title}
                </h3>
                <p className="text-[13px] text-[#6B7280] leading-[18px]">
                  {mode.description}
                </p>
              </div>
              
              {/*
              --------------------------------------------------------
                Indicador de Seleção
              --------------------------------------------------------
              */}
              <div className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 ${
                selectedMode === mode.id
                  ? `${mode.borderColor} bg-white`
                  : 'border-[#D1D5DB] bg-white'
              }`}>
                {selectedMode === mode.id && (
                  <div className={`w-[8px] h-[8px] rounded-full bg-gradient-to-br ${mode.color}`} />
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/*
      --------------------------------------------------------
        Linha Divisória
      --------------------------------------------------------
      */}
      <div className="border-t-[1px] border-[#E5E7EB]" />

      {/*
      --------------------------------------------------------
        Botão de Ação
      --------------------------------------------------------
      */}
      <div className="space-y-[12px]">
        <button
          onClick={() => {
            console.log('🟦 [UI] Botão Transcrever clicado', { hasFiles, isProcessing, selectedMode });
            onStartTranscription();
          }}
          disabled={!hasFiles || isProcessing}
          className="w-full px-[24px] py-[14px] bg-[#1777CF] text-white text-[16px] font-semibold rounded-[10px] hover:bg-[#0F5FA3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isProcessing ? 'Transcrevendo...' : 'Transcrever'}
        </button>
        
        {!hasFiles && (
          <p className="text-[12px] text-[#6B7280] text-center leading-[16px]">
            Adicione arquivos para começar a transcrição
          </p>
        )}
      </div>
    </div>
  );
};

export default TranscriptionModePanel;