/*
--------------------------------------------------------
  Componente: Seção de Upload e Links
--------------------------------------------------------
- bg-gradient-to-br ➔ Gradiente de fundo
- rounded-[16px] ➔ Bordas arredondadas
- p-[24px] ➔ Padding interno
- border-[2px] ➔ Borda tracejada para drag & drop
*/

import React, { useState } from 'react';

interface UploadSectionProps {
  onFileSelect: (files: File | File[]) => void;
  onUrlSubmit: (url: string) => void;
}

interface UrlItem {
  id: string;
  url: string;
  isValid: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelect, onUrlSubmit }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlList, setUrlList] = useState<UrlItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  /*
  --------------------------------------------------------
    Função: Validar URL
  --------------------------------------------------------
  */
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const validDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv', 'instagram.com'];
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  /*
  --------------------------------------------------------
    Função: Adicionar Nova URL
  --------------------------------------------------------
  */
  const handleAddUrl = () => {
    if (currentUrl.trim()) {
      const newUrl: UrlItem = {
        id: `url-${Date.now()}-${Math.random()}`,
        url: currentUrl.trim(),
        isValid: isValidUrl(currentUrl.trim())
      };
      
      // Verificar se a URL já existe
      const exists = urlList.some(item => item.url === newUrl.url);
      if (!exists) {
        setUrlList(prev => [...prev, newUrl]);
        setCurrentUrl('');
      }
    }
  };

  /*
  --------------------------------------------------------
    Função: Remover URL
  --------------------------------------------------------
  */
  const handleRemoveUrl = (urlId: string) => {
    setUrlList(prev => prev.filter(item => item.id !== urlId));
  };

  /*
  --------------------------------------------------------
    Função: Processar Todas as URLs
  --------------------------------------------------------
  */
  const handleProcessAllUrls = () => {
    const validUrls = urlList.filter(item => item.isValid);
    if (validUrls.length > 0) {
      // Processar cada URL válida
      validUrls.forEach(urlItem => {
        onUrlSubmit(urlItem.url);
      });
      // Limpar lista após processamento
      setUrlList([]);
    }
  };

  /*
  --------------------------------------------------------
    Função: Manipulação de Drag & Drop
  --------------------------------------------------------
  */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const filesArray = Array.from(files);
      onFileSelect(filesArray);
    }
  };

  // [debug] removido handler duplicado: handleFileInput(files: FileList | null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = e.target.files?.length ?? 0;
    console.log('🟨 [UploadSection] handleFileInput change', { count });
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFileSelect(files);
      e.target.value = '';
    }
  };

  /*
  --------------------------------------------------------
    Funções: Identificar Plataforma e Estilo
  --------------------------------------------------------
  */
  const getPlatformName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return 'YouTube';
      } else if (urlObj.hostname.includes('vimeo.com')) {
        return 'Vimeo';
      } else if (urlObj.hostname.includes('dailymotion.com')) {
        return 'Dailymotion';
      } else if (urlObj.hostname.includes('twitch.tv')) {
        return 'Twitch';
      } else if (urlObj.hostname.includes('instagram.com')) {
        return 'Instagram';
      } else if (urlObj.hostname.includes('facebook.com')) {
        return 'Facebook';
      } else {
        return 'URL Inválida';
      }
    } catch {
      return 'URL Inválida';
    }
  };

  const getPlatformStyle = (url: string) => {
    const platform = getPlatformName(url);
    switch (platform) {
      case 'YouTube':
        return { bgColor: 'bg-[#FEF2F2] text-[#DC2626]' };
      case 'Vimeo':
        return { bgColor: 'bg-[#EFF6FF] text-[#1E40AF]' };
      case 'Dailymotion':
        return { bgColor: 'bg-[#F0FDF4] text-[#166534]' };
      case 'Twitch':
        return { bgColor: 'bg-[#FAF5FF] text-[#7C3AED]' };
      case 'Instagram':
        return { bgColor: 'bg-[#FFFBEB] text-[#92400E]' };
      case 'Facebook':
        return { bgColor: 'bg-[#EFF6FF] text-[#1E40AF]' };
      default:
        return { bgColor: 'bg-[#F3F4F6] text-[#6B7280]' };
    }
  };

  const getPlatformIcon = (url: string) => {
    const platform = getPlatformName(url);
    switch (platform) {
      case 'YouTube':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.54 6.42C22.4 5.94 22.1 5.64 21.62 5.5C20.88 5.31 12 5.31 12 5.31S3.12 5.31 2.38 5.5C1.9 5.64 1.6 5.94 1.46 6.42C1.31 7.26 1.31 12 1.31 12S1.31 16.74 1.46 17.58C1.6 18.06 1.9 18.36 2.38 18.5C3.12 18.69 12 18.69 12 18.69S20.88 18.69 21.62 18.5C22.1 18.36 22.4 18.06 22.54 17.58C22.69 16.74 22.69 12 22.69 12S22.69 7.26 22.54 6.42Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9.75 15.02L15.5 12L9.75 8.98V15.02Z" fill="currentColor"/>
          </svg>
        );
      case 'Vimeo':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60707C11.7643 9.26327 11.0685 9.05885 10.3533 9.00766C9.63819 8.95647 8.92037 9.05973 8.24864 9.31028C7.5769 9.56083 6.9669 9.95302 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.6661 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  /*
  --------------------------------------------------------
    Função: Adicionar URL com Enter
  --------------------------------------------------------
  */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUrlClick();
    }
  };

  /*
  --------------------------------------------------------
    Função: Processar URL Individual
  --------------------------------------------------------
  */
  const handleUrlSubmit = () => {
    if (currentUrl.trim() && isValidUrl(currentUrl.trim())) {
      onUrlSubmit(currentUrl.trim());
      setCurrentUrl('');
    }
  };

  /*
  --------------------------------------------------------
    Debug: Log para verificar se a função está sendo chamada
  --------------------------------------------------------
  */
  const handleAddUrlClick = () => {
    console.log('🔍 Botão Adicionar clicado!');
    console.log('📝 URL atual:', currentUrl);
    console.log('✅ URL válida?', isValidUrl(currentUrl.trim()));
    handleUrlSubmit();
  };

  return (
    <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] rounded-[16px] p-[20px] border-[1px] border-[#E2E8F0]">
      {/*
      --------------------------------------------------------
        Abas de Navegação
      --------------------------------------------------------
      */}
      <div className="flex bg-[#FFFFFF] rounded-[12px] p-[4px] mb-[20px] border-[1px] border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-[12px] px-[16px] text-[14px] font-medium rounded-[8px] transition-all duration-200 ${
            activeTab === 'upload'
              ? 'bg-[#1777CF] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#1777CF]'
          }`}
        >
          <div className="flex items-center justify-center gap-[8px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload de Arquivo
          </div>
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-[12px] px-[16px] text-[14px] font-medium rounded-[8px] transition-all duration-200 ${
            activeTab === 'url'
              ? 'bg-[#1777CF] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#1777CF]'
          }`}
        >
          <div className="flex items-center justify-center gap-[8px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60707C11.7643 9.26327 11.0685 9.05885 10.3533 9.00766C9.63819 8.95647 8.92037 9.05973 8.24864 9.31028C7.5769 9.56083 6.9669 9.95302 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.6661 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Link do Vídeo
          </div>
        </button>
      </div>

      {/*
      --------------------------------------------------------
        Conteúdo da Aba Ativa
      --------------------------------------------------------
      */}
      {activeTab === 'upload' && (
        <div
          className={`border-[2px] border-dashed rounded-[12px] p-[48px] text-center transition-all duration-200 ${
            isDragging
              ? 'border-[#1777CF] bg-[#EFF6FF]'
              : 'border-[#D1D5DB] hover:border-[#1777CF] hover:bg-[#F8FAFC]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#1777CF] to-[#0F5FA3] rounded-[16px] flex items-center justify-center mx-auto mb-[12px]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 15L12 12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h3 className="text-[16px] font-semibold text-[#1F2937] mb-[6px] leading-[20px]">
            Arraste e solte seu arquivo aqui
          </h3>
          <p className="text-[13px] text-[#6B7280] mb-[16px] leading-[18px]">
            Suportamos MP4, MP3, WAV, M4A e outros formatos
          </p>
          
          <input
            type="file"
            accept="video/*,audio/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="inline-flex items-center gap-[8px] px-[24px] py-[12px] bg-[#1777CF] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#0F5FA3] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Escolher Arquivo(s)
          </label>
        </div>
      )}

      {activeTab === 'url' && (
        <div className="space-y-[20px]">
          {/*
          --------------------------------------------------------
            Cabeçalho com Título e Suporte
          --------------------------------------------------------
          */}
         <div className="space-y-[16px]">
           {/*
           --------------------------------------------------------
             Título Suportados em Destaque
           --------------------------------------------------------
           */}
           <div className="text-center">
             <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[20px] mb-[12px]">
               Suportados
             </h3>
           </div>


           {/*
           --------------------------------------------------------
             Card de Plataformas Suportadas (Estilo Apple)
           --------------------------------------------------------
           */}
           <div className="border-[2px] border-dashed border-[#D1D5DB] rounded-[12px] p-[16px] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all duration-200">
             <div className="flex items-center justify-center gap-[24px]">
               {/* YouTube */}
               <div className="flex flex-col items-center gap-[8px]">
                 <div className="w-[40px] h-[40px] bg-[#FF0000] rounded-[10px] flex items-center justify-center shadow-sm">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M22.54 6.42C22.4 5.94 22.1 5.64 21.62 5.5C20.88 5.31 12 5.31 12 5.31S3.12 5.31 2.38 5.5C1.9 5.64 1.6 5.94 1.46 6.42C1.31 7.26 1.31 12 1.31 12S1.31 16.74 1.46 17.58C1.6 18.06 1.9 18.36 2.38 18.5C3.12 18.69 12 18.69 12 18.69S20.88 18.69 21.62 18.5C22.1 18.36 22.4 18.06 22.54 17.58C22.69 16.74 22.69 12 22.69 12S22.69 7.26 22.54 6.42Z" stroke="currentColor" strokeWidth="2"/>
                     <path d="M9.75 15.02L15.5 12L9.75 8.98V15.02Z" fill="currentColor"/>
                   </svg>
                 </div>
                 <span className="text-[10px] font-medium text-[#6B7280]">YouTube</span>
               </div>

               {/* Instagram */}
               <div className="flex flex-col items-center gap-[8px]">
                 <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-[10px] flex items-center justify-center shadow-sm">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="1.5"/>
                     <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.1283C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="white" strokeWidth="1.5"/>
                     <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
                 <span className="text-[10px] font-medium text-[#6B7280]">Instagram</span>
               </div>

               {/* Facebook */}
               <div className="flex flex-col items-center gap-[8px]">
                 <div className="w-[40px] h-[40px] bg-[#1877F2] rounded-[10px] flex items-center justify-center shadow-sm">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
                 <span className="text-[10px] font-medium text-[#6B7280]">Facebook</span>
               </div>
             </div>
           </div>
         </div>

           {/*
           --------------------------------------------------------
             Título do Campo de Input
           --------------------------------------------------------
           */}
           <div>
             <label className="block text-[14px] font-medium text-[#374151] leading-[20px] mb-[8px]">
               Cole abaixo o link do seu vídeo
             </label>
           </div>


          {/*
          --------------------------------------------------------
            Campo de Input com Botão Adicionar
          --------------------------------------------------------
          */}
          <div className="flex gap-[10px] mt-[12px]">
            <div className="flex-1 relative">
              <input
                type="url"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://youtube.com/watch?v=... ou https://instagram.com/..."
                className="w-full px-[16px] py-[12px] border-[1px] border-[#D1D5DB] rounded-[8px] text-[14px] text-[#374151] placeholder-[#9CA3AF] hover:border-[#1777CF] hover:shadow-sm focus:outline-none focus:ring-[2px] focus:ring-[#1777CF] focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-[12px] flex items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60707C11.7643 9.26327 11.0685 9.05885 10.3533 9.00766C9.63819 8.95647 8.92037 9.05973 8.24864 9.31028C7.5769 9.56083 6.9669 9.95302 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.6661 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <button
              onClick={handleAddUrlClick}
              disabled={!currentUrl.trim()}
              className="px-[20px] py-[12px] bg-[#1777CF] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#0F5FA3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;