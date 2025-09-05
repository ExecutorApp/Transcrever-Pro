/*
--------------------------------------------------------
  Componente: Lista de Progresso de URLs (Otimizado)
--------------------------------------------------------
- Container dedicado para downloads de URLs
- Layout compacto sem botões de download
- Exibe status: Aguardando/Processando/Concluído/Erro
- Barra de progresso apenas para o primeiro item em processamento
*/

import React, { useState } from 'react';

interface DownloadItem {
  id: string;
  url: string;
  platform: string;
  title?: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  error?: string;
}

interface UrlProgressListProps {
  downloadItems: DownloadItem[];
  onAddUrl?: (url: string) => void;
  onAddMoreUrls?: () => void;
}

const UrlProgressList: React.FC<UrlProgressListProps> = ({
  downloadItems,
  onAddUrl,
  onAddMoreUrls
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  // Índice do primeiro item em processamento
  const firstDownloadingIndex = downloadItems.findIndex(i => i.status === 'downloading');

  /*
  --------------------------------------------------------
    Função: Validar URL
  --------------------------------------------------------
  */
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const validDomains = ['youtube.com', 'youtu.be', 'instagram.com', 'facebook.com'];
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  /*
  --------------------------------------------------------
    Função: Adicionar URL
  --------------------------------------------------------
  */
  const handleAddUrl = () => {
    if (currentUrl.trim() && isValidUrl(currentUrl.trim())) {
      if (onAddUrl) {
        onAddUrl(currentUrl.trim());
      }
      setCurrentUrl('');
    }
  };

  /*
  --------------------------------------------------------
    Função: Adicionar URL com Enter
  --------------------------------------------------------
  */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUrl();
    }
  };

  /*
  --------------------------------------------------------
    Função: Obter Ícone da Plataforma
  --------------------------------------------------------
  */
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.54 6.42C22.4 5.94 22.1 5.64 21.62 5.5C20.88 5.31 12 5.31 12 5.31S3.12 5.31 2.38 5.5C1.9 5.64 1.6 5.94 1.46 6.42C1.31 7.26 1.31 12 1.31 12S1.31 16.74 1.46 17.58C1.6 18.06 1.9 18.36 2.38 18.5C3.12 18.69 12 18.69 12 18.69S20.88 18.69 21.62 18.5C22.1 18.36 22.4 18.06 22.54 17.58C22.69 16.74 22.69 12 22.69 12S22.69 7.26 22.54 6.42Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9.75 15.02L15.5 12L9.75 8.98V15.02Z" fill="currentColor"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.1283C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  /*
  --------------------------------------------------------
    Função: Obter Estilo da Plataforma
  --------------------------------------------------------
  */
  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'bg-[#DC2626] text-white';
      case 'instagram':
        return 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white';
      case 'facebook':
        return 'bg-[#1877F2] text-white';
      default:
        return 'bg-[#6B7280] text-white';
    }
  };

  /*
  --------------------------------------------------------
    Função: Encurtar URL
  --------------------------------------------------------
  */
  const shortenUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // const completedItems = downloadItems.filter(item => item.status === 'completed');

  return (
    <div className="flex flex-col h-full min-h-0">
      {/**
      --------------------------------------------------------
        Cabeçalho Padronizado
      --------------------------------------------------------
      */}
      <div className="flex items-center justify-between mb-[16px]">
        <h3 className="text-[18px] font-semibold text-[#1F2937] leading-[24px]">
          Downloads de URLs
        </h3>
        <span className="text-[14px] text-[#6B7280] bg-[#F3F4F6] px-[12px] py-[4px] rounded-[20px]">
          {downloadItems.length.toString().padStart(2, '0')} itens
        </span>
      </div>

      {/**
      --------------------------------------------------------
        Campo de Input para URLs (sem botão Baixar Todos)
      --------------------------------------------------------
      */}
      <div className="flex gap-[8px] mb-[16px]">
        <input
          type="url"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Cole o link do vídeo aqui..."
          className="flex-1 px-[12px] py-[8px] border-[1px] border-[#D1D5DB] rounded-[6px] text-[14px] text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-[2px] focus:ring-[#1777CF] focus:border-transparent transition-all duration-200"
        />
        <button
          onClick={handleAddUrl}
          disabled={!currentUrl.trim()}
          className="px-[16px] py-[8px] bg-[#1777CF] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#0F5FA3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          Adicionar Link
        </button>
      </div>

      {/**
      --------------------------------------------------------
        Área de Conteúdo Sempre Visível
      --------------------------------------------------------
      */}
      <div className="flex-1 min-h-0">
        <div className="h-full bg-[#F8FAFC] rounded-[12px] p-[12px] border-[1px] border-[#E5E7EB] overflow-y-auto">
          {downloadItems.length === 0 ? (
            /**
            --------------------------------------------------------
              Estado Vazio Padronizado
            --------------------------------------------------------
            */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-[48px] h-[48px] bg-[#E5E7EB] rounded-[12px] flex items-center justify-center mx-auto mb-[12px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60707C11.7643 9.26327 11.0685 9.05885 10.3533 9.00766C9.63819 8.95647 8.92037 9.05973 8.24864 9.31028C7.5769 9.56083 6.9669 9.95302 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.6661 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              Lista de Downloads Compacta
            --------------------------------------------------------
            */
            <div className="space-y-[12px]">
              {downloadItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border-[1px] border-[#E5E7EB] rounded-[8px] p-[16px] hover:border-[#1777CF] transition-all duration-200"
                >
                  <div className="flex items-center gap-[12px]">
                    {/**
                    --------------------------------------------------------
                      Avatar da Plataforma
                    --------------------------------------------------------
                    */}
                    <div className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center flex-shrink-0 ${getPlatformStyle(item.platform)}`}>
                      {getPlatformIcon(item.platform)}
                    </div>

                    {/**
                    --------------------------------------------------------
                      Informações do Download
                    --------------------------------------------------------
                    */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium mb-[2px] leading-[14px]">
                        {item.status === 'downloading' ? (
                          index === firstDownloadingIndex ? (
                            <span className="text-[#1777CF]">Processando {Math.max(0, Math.min(item.progress, 100))}%</span>
                          ) : (
                            <span className="text-[#F59E0B]">Aguardando</span>
                          )
                        ) : item.status === 'completed' ? (
                          <span className="text-[#10B981]">Concluído</span>
                        ) : (
                          <span className="text-[#EF4444]">Erro{item.error ? `: ${item.error}` : ''}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] truncate leading-[12px]">
                        {shortenUrl(item.url)}
                      </div>

                      {item.status === 'downloading' && index === firstDownloadingIndex && (
                        <div className="mt-[8px] w-full bg-[#F3F4F6] rounded-[6px] h-[6px] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#1777CF] to-[#0F5FA3] rounded-[6px] transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(0, Math.min(item.progress, 100))}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/**
                    --------------------------------------------------------
                      Ações do Item removidas (sem botão de download)
                    --------------------------------------------------------
                    */}
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

export default UrlProgressList;