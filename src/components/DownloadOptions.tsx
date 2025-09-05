/*
--------------------------------------------------------
  Componente: Opções de Download
--------------------------------------------------------
- grid-cols-1 md:grid-cols-3 ➔ Layout responsivo
- hover:scale-105 ➔ Efeito de hover com escala
- transform transition-all ➔ Animações suaves
*/

import React from 'react';

interface DownloadOptionsProps {
  onDownloadVideo: () => void;
  onDownloadAudio: () => void;
  onDownloadTranscription: () => void;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  onDownloadVideo,
  onDownloadAudio,
  onDownloadTranscription
}) => {
  const downloadOptions = [
    {
      title: 'Vídeo Completo',
      description: 'Baixe o vídeo original em alta qualidade',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
        </svg>
      ),
      color: 'from-[#DC2626] to-[#B91C1C]',
      bgColor: 'bg-[#FEF2F2]',
      hoverColor: 'hover:bg-[#FEE2E2]',
      onClick: onDownloadVideo
    },
    {
      title: 'Apenas Áudio',
      description: 'Extraia somente o áudio em formato MP3',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C12 1 15 4 19 4V11C19 16 12 23 12 23C12 23 5 16 5 11V4C9 4 12 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'from-[#7C3AED] to-[#6D28D9]',
      bgColor: 'bg-[#FAF5FF]',
      hoverColor: 'hover:bg-[#F3E8FF]',
      onClick: onDownloadAudio
    },
    {
      title: 'Transcrição',
      description: 'Baixe a transcrição em formato TXT',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'from-[#059669] to-[#047857]',
      bgColor: 'bg-[#ECFDF5]',
      hoverColor: 'hover:bg-[#D1FAE5]',
      onClick: onDownloadTranscription
    }
  ];

  return (
    <div className="space-y-[16px]">
      <div className="text-center">
        <h2 className="text-[20px] font-semibold text-[#1F2937] mb-[8px] leading-[28px]">
          Opções de Download
        </h2>
        <p className="text-[14px] text-[#6B7280] leading-[20px]">
          Escolha o formato que você deseja baixar
        </p>
      </div>

      {/*
      --------------------------------------------------------
        Grid de Opções de Download
      --------------------------------------------------------
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {downloadOptions.map((option, index) => (
          <div
            key={index}
            onClick={option.onClick}
            className={`p-[24px] rounded-[16px] border-[1px] border-[#E5E7EB] cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${option.bgColor} ${option.hoverColor}`}
          >
            {/*
            --------------------------------------------------------
              Ícone e Título
            --------------------------------------------------------
            */}
            <div className="text-center">
              <div className={`w-[64px] h-[64px] bg-gradient-to-br ${option.color} rounded-[16px] flex items-center justify-center mx-auto mb-[16px] text-white`}>
                {option.icon}
              </div>
              
              <h3 className="text-[16px] font-semibold text-[#1F2937] mb-[8px] leading-[20px]">
                {option.title}
              </h3>
              
              <p className="text-[13px] text-[#6B7280] leading-[18px] mb-[16px]">
                {option.description}
              </p>
              
              {/*
              --------------------------------------------------------
                Botão de Download
              --------------------------------------------------------
              */}
              <button className={`w-full py-[8px] px-[16px] bg-gradient-to-r ${option.color} text-white text-[14px] font-medium rounded-[8px] hover:opacity-90 transition-all duration-200 shadow-sm`}>
                Baixar Agora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadOptions;