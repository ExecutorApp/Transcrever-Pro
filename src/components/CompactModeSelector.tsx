/*
--------------------------------------------------------
  Componente: Seletor de Modo Compacto
--------------------------------------------------------
- Layout horizontal com radio buttons estilizados
- Ocupa menos espaço vertical
- Design mais limpo e funcional
*/

import React from 'react';

export type TranscriptionMode = 'fast' | 'balanced' | 'perfect';

interface CompactModeSelectorProps {
  selectedMode: TranscriptionMode;
  onModeSelect: (mode: TranscriptionMode) => void;
}

const CompactModeSelector: React.FC<CompactModeSelectorProps> = ({
  selectedMode,
  onModeSelect
}) => {
  const modes = [
    {
      id: 'fast' as TranscriptionMode,
      title: 'Rápido',
      subtitle: '~2-3 min',
      description: 'Qualidade básica, processamento acelerado',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      subtitle: '~5-7 min',
      description: 'Meio-termo entre velocidade e precisão',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      subtitle: '~10-15 min',
      description: 'Máxima precisão e fidelidade',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <div className="space-y-[12px]">
      <div className="text-center">
        <h2 className="text-[18px] font-semibold text-[#1F2937] mb-[4px] leading-[24px]">
          Escolha o Modo de Transcrição
        </h2>
        <p className="text-[13px] text-[#6B7280] leading-[18px]">
          Selecione a qualidade e velocidade desejada para o processamento
        </p>
      </div>

      {/*
      --------------------------------------------------------
        Radio Buttons Horizontais
      --------------------------------------------------------
      */}
      <div className="flex flex-col sm:flex-row gap-[8px]">
        {modes.map((mode) => (
          <label
            key={mode.id}
            className={`flex-1 p-[16px] rounded-[8px] border-[2px] cursor-pointer transition-all duration-200 hover:shadow-sm ${
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
              Conteúdo do Radio Button
            --------------------------------------------------------
            */}
            <div className="flex items-start gap-[8px]">
              <div className={`w-[32px] h-[32px] bg-gradient-to-br ${mode.color} rounded-[6px] flex items-center justify-center text-white flex-shrink-0`}>
                {mode.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-[2px]">
                  <h3 className="text-[14px] font-semibold text-[#1F2937] leading-[18px]">
                    {mode.title}
                  </h3>
                  <span className={`text-[11px] font-medium leading-[14px] ${
                    selectedMode === mode.id ? mode.textColor : 'text-[#6B7280]'
                  }`}>
                    {mode.subtitle}
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-[16px]">
                  {mode.description}
                </p>
              </div>
              
              {/*
              --------------------------------------------------------
                Indicador de Seleção
              --------------------------------------------------------
              */}
              <div className={`w-[16px] h-[16px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 ${
                selectedMode === mode.id
                  ? `${mode.borderColor} bg-white`
                  : 'border-[#D1D5DB] bg-white'
              }`}>
                {selectedMode === mode.id && (
                  <div className={`w-[6px] h-[6px] rounded-full bg-gradient-to-br ${mode.color}`} />
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CompactModeSelector;