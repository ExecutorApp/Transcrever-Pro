/*
--------------------------------------------------------
  Componente: Seletor de Modo de Transcrição
--------------------------------------------------------
- grid-cols-1 md:grid-cols-3 ➔ Layout responsivo
- gap-[16px] ➔ Espaçamento entre cards
- cursor-pointer ➔ Indica interatividade
- transition-all ➔ Animações suaves
*/

import React from 'react';

export type TranscriptionMode = 'fast' | 'balanced' | 'perfect';

interface TranscriptionModeSelectorProps {
  selectedMode: TranscriptionMode;
  onModeSelect: (mode: TranscriptionMode) => void;
}

const TranscriptionModeSelector: React.FC<TranscriptionModeSelectorProps> = ({
  selectedMode,
  onModeSelect
}) => {
  const modes = [
    {
      id: 'fast' as TranscriptionMode,
      title: 'Rápido',
      subtitle: '~2-3 minutos',
      description: 'Processamento acelerado com qualidade básica. Ideal para rascunhos e conteúdo simples.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      subtitle: '~5-7 minutos',
      description: 'Meio-termo perfeito entre velocidade e precisão. Recomendado para a maioria dos casos.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      subtitle: '~10-15 minutos',
      description: 'Máxima precisão e fidelidade. Perfeito para conteúdo profissional e acadêmico.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <div className="space-y-[16px]">
      <div className="text-center">
        <h2 className="text-[20px] font-semibold text-[#1F2937] mb-[8px] leading-[28px]">
          Escolha o Modo de Transcrição
        </h2>
        <p className="text-[14px] text-[#6B7280] leading-[20px]">
          Selecione a qualidade e velocidade desejada para o processamento
        </p>
      </div>

      {/*
      --------------------------------------------------------
        Grid de Modos de Transcrição
      --------------------------------------------------------
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className={`p-[20px] rounded-[12px] border-[2px] cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMode === mode.id
                ? `${mode.borderColor} ${mode.bgColor} shadow-md`
                : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
            }`}
          >
            {/*
            --------------------------------------------------------
              Ícone e Título do Modo
            --------------------------------------------------------
            */}
            <div className="flex items-start gap-[12px] mb-[12px]">
              <div className={`w-[40px] h-[40px] bg-gradient-to-br ${mode.color} rounded-[8px] flex items-center justify-center text-white`}>
                {mode.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[20px]">
                  {mode.title}
                </h3>
                <p className={`text-[12px] font-medium leading-[16px] ${
                  selectedMode === mode.id ? mode.textColor : 'text-[#6B7280]'
                }`}>
                  {mode.subtitle}
                </p>
              </div>
              
              {/*
              --------------------------------------------------------
                Indicador de Seleção
              --------------------------------------------------------
              */}
              <div className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center ${
                selectedMode === mode.id
                  ? `${mode.borderColor} bg-white`
                  : 'border-[#D1D5DB] bg-white'
              }`}>
                {selectedMode === mode.id && (
                  <div className={`w-[8px] h-[8px] rounded-full bg-gradient-to-br ${mode.color}`} />
                )}
              </div>
            </div>

            {/*
            --------------------------------------------------------
              Descrição do Modo
            --------------------------------------------------------
            */}
            <p className="text-[13px] text-[#6B7280] leading-[18px]">
              {mode.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptionModeSelector;