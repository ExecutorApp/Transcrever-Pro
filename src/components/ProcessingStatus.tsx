/*
--------------------------------------------------------
  Componente: Status de Processamento
--------------------------------------------------------
- animate-pulse ➔ Animação pulsante
- transition-all ➔ Transições suaves
- bg-gradient-to-r ➔ Gradiente na barra de progresso
*/

import React from 'react';

interface ProcessingStatusProps {
  stage: string;
  progress: number;
  estimatedTime?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  stage,
  progress,
  estimatedTime
}) => {
  return (
    <div className="bg-white rounded-[16px] p-[24px] border-[1px] border-[#E5E7EB] shadow-sm">
      {/*
      --------------------------------------------------------
        Cabeçalho do Status
      --------------------------------------------------------
      */}
      <div className="flex items-center gap-[12px] mb-[20px]">
        <div className="w-[48px] h-[48px] bg-gradient-to-br from-[#1777CF] to-[#0F5FA3] rounded-[12px] flex items-center justify-center animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-[18px] font-semibold text-[#1F2937] leading-[24px]">
            Processando seu arquivo
          </h3>
          <p className="text-[14px] text-[#6B7280] leading-[20px]">
            {stage}
          </p>
        </div>
      </div>

      {/*
      --------------------------------------------------------
        Barra de Progresso
      --------------------------------------------------------
      */}
      <div className="space-y-[12px]">
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-medium text-[#374151]">
            Progresso
          </span>
          <span className="text-[14px] font-semibold text-[#1777CF]">
            {progress}%
          </span>
        </div>
        
        <div className="w-full bg-[#F3F4F6] rounded-[8px] h-[8px] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1777CF] to-[#0F5FA3] rounded-[8px] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {estimatedTime && (
          <p className="text-[12px] text-[#6B7280] text-center leading-[16px]">
            Tempo estimado: {estimatedTime}
          </p>
        )}
      </div>

      {/*
      --------------------------------------------------------
        Etapas do Processamento
      --------------------------------------------------------
      */}
      <div className="mt-[20px] space-y-[8px]">
        <div className="flex items-center gap-[8px] text-[12px]">
          <div className="w-[4px] h-[4px] bg-[#10B981] rounded-full" />
          <span className="text-[#065F46] font-medium">Download concluído</span>
        </div>
        <div className="flex items-center gap-[8px] text-[12px]">
          <div className={`w-[4px] h-[4px] rounded-full ${progress > 30 ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'}`} />
          <span className={`font-medium ${progress > 30 ? 'text-[#065F46]' : 'text-[#6B7280]'}`}>
            Extração de áudio
          </span>
        </div>
        <div className="flex items-center gap-[8px] text-[12px]">
          <div className={`w-[4px] h-[4px] rounded-full ${progress > 60 ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'}`} />
          <span className={`font-medium ${progress > 60 ? 'text-[#065F46]' : 'text-[#6B7280]'}`}>
            Transcrição WinSPR
          </span>
        </div>
        <div className="flex items-center gap-[8px] text-[12px]">
          <div className={`w-[4px] h-[4px] rounded-full ${progress > 90 ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'}`} />
          <span className={`font-medium ${progress > 90 ? 'text-[#065F46]' : 'text-[#6B7280]'}`}>
            Finalização
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;