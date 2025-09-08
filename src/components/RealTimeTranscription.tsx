/*
--------------------------------------------------------
  Componente: Transcrição em Tempo Real
--------------------------------------------------------
- Exibe transcrição conforme é processada
- Animações de texto aparecendo
- Indicador de palavra atual sendo processada
- Controles de pausa/retomada
*/

import React, { useState, useEffect, useRef } from 'react';

interface RealTimeTranscriptionProps {
  isActive: boolean;
  isProcessing?: boolean;
  onComplete: (fullTranscription: string) => void;
  onPause: () => void;
  onResume: () => void;
  filename: string;
  mode: 'fast' | 'balanced' | 'perfect';
}

interface TranscriptionSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  isComplete: boolean;
}

const RealTimeTranscription: React.FC<RealTimeTranscriptionProps> = ({
  isActive,
  isProcessing = false,
  onComplete,
  onPause,
  onResume,
  filename,
  mode
}) => {
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<string>('');
  const [_internalIsProcessing, set_internalIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentRef = useRef<HTMLDivElement>(null);

  /*
  --------------------------------------------------------
    Simulação de Transcrição em Tempo Real
  --------------------------------------------------------
  */
  const sampleTranscription = [
    { text: "Olá", confidence: 0.98, delay: 500 },
    { text: "e", confidence: 0.95, delay: 200 },
    { text: "bem-vindos", confidence: 0.97, delay: 600 },
    { text: "ao", confidence: 0.99, delay: 150 },
    { text: "nosso", confidence: 0.96, delay: 300 },
    { text: "canal.", confidence: 0.98, delay: 400 },
    { text: "Hoje", confidence: 0.97, delay: 800 },
    { text: "vamos", confidence: 0.98, delay: 300 },
    { text: "falar", confidence: 0.96, delay: 250 },
    { text: "sobre", confidence: 0.99, delay: 300 },
    { text: "inteligência", confidence: 0.94, delay: 700 },
    { text: "artificial", confidence: 0.96, delay: 500 },
    { text: "e", confidence: 0.98, delay: 150 },
    { text: "como", confidence: 0.97, delay: 250 },
    { text: "ela", confidence: 0.99, delay: 200 },
    { text: "está", confidence: 0.98, delay: 250 },
    { text: "transformando", confidence: 0.95, delay: 800 },
    { text: "o", confidence: 0.99, delay: 100 },
    { text: "mundo", confidence: 0.97, delay: 400 },
    { text: "dos", confidence: 0.98, delay: 200 },
    { text: "negócios.", confidence: 0.96, delay: 600 },
    { text: "A", confidence: 0.98, delay: 800 },
    { text: "tecnologia", confidence: 0.95, delay: 600 },
    { text: "WinSPR", confidence: 0.97, delay: 400 },
    { text: "que", confidence: 0.98, delay: 200 },
    { text: "estamos", confidence: 0.96, delay: 400 },
    { text: "usando", confidence: 0.97, delay: 350 },
    { text: "aqui", confidence: 0.99, delay: 300 },
    { text: "representa", confidence: 0.94, delay: 600 },
    { text: "o", confidence: 0.99, delay: 100 },
    { text: "estado", confidence: 0.97, delay: 400 },
    { text: "da", confidence: 0.98, delay: 150 },
    { text: "arte", confidence: 0.96, delay: 300 },
    { text: "em", confidence: 0.98, delay: 150 },
    { text: "reconhecimento", confidence: 0.93, delay: 800 },
    { text: "de", confidence: 0.99, delay: 150 },
    { text: "fala.", confidence: 0.97, delay: 400 }
  ];

  /*
  --------------------------------------------------------
    Efeito: Iniciar Transcrição
  --------------------------------------------------------
  */
  useEffect(() => {
    if (isActive && isProcessing && !isPaused) {
      set_internalIsProcessing(true);
      setTotalDuration(sampleTranscription.length * 300); // Estimativa
      
      // Delay inicial para simular preparação
      setTimeout(() => {
        startRealTimeTranscription();
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isProcessing, isPaused]);

  /*
  --------------------------------------------------------
    Função: Iniciar Transcrição em Tempo Real
  --------------------------------------------------------
  */
  const startRealTimeTranscription = () => {
    let wordIndex = 0;
    let currentSegmentText = '';
    let segmentStartTime = Date.now();
    
    console.log('🎤 Iniciando transcrição em tempo real...');

    const processNextWord = () => {
      if (isPaused) {
        // Se pausado, reagendar para verificar novamente
        setTimeout(processNextWord, 100);
        return;
      }
      
      if (wordIndex >= sampleTranscription.length) {
        // Finalizar transcrição
        const finalText = segments.map(s => s.text).join(' ') + ' ' + currentSegmentText;
        console.log('✅ Transcrição concluída:', finalText);
        onComplete(finalText.trim());
        set_internalIsProcessing(false);
        return;
      }

      const word = sampleTranscription[wordIndex];
      currentSegmentText += (currentSegmentText ? ' ' : '') + word.text;
      setCurrentSegment(currentSegmentText);
      setCurrentTime(wordIndex * 300);
      setAudioProgress((wordIndex / sampleTranscription.length) * 100);
      
      console.log(`📝 Palavra ${wordIndex + 1}/${sampleTranscription.length}: "${word.text}"`);

      // A cada 5-8 palavras, criar um novo segmento
      if (wordIndex > 0 && (wordIndex % (5 + Math.floor(Math.random() * 4)) === 0 || wordIndex === sampleTranscription.length - 1)) {
        const newSegment: TranscriptionSegment = {
          id: `segment-${Date.now()}-${wordIndex}`,
          text: currentSegmentText,
          timestamp: segmentStartTime,
          confidence: Math.min(...currentSegmentText.split(' ').map((_, i) => 
            sampleTranscription[wordIndex - currentSegmentText.split(' ').length + 1 + i]?.confidence || 0.95
          )),
          isComplete: true
        };

        setSegments(prev => [...prev, newSegment]);
        setCurrentSegment('');
        currentSegmentText = '';
        segmentStartTime = Date.now();
      }

      wordIndex++;

      // Velocidade baseada no modo selecionado
      const baseDelay = word.delay;
      const modeMultiplier = mode === 'fast' ? 0.5 : mode === 'balanced' ? 1 : 1.5;
      const delay = baseDelay * modeMultiplier;

      setTimeout(processNextWord, delay);
    };

    processNextWord();
  };

  /*
  --------------------------------------------------------
    Função: Pausar/Retomar
  --------------------------------------------------------
  */
  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume();
    } else {
      setIsPaused(true);
      onPause();
    }
  };

  /*
  --------------------------------------------------------
    Efeito: Auto-scroll para o último segmento
  --------------------------------------------------------
  */
  useEffect(() => {
    if (segmentRef.current) {
      segmentRef.current.scrollTop = segmentRef.current.scrollHeight;
    }
  }, [segments, currentSegment]);

  /*
  --------------------------------------------------------
    Função: Formatar Tempo
  --------------------------------------------------------
  */
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[16px] border-[1px] border-[#E5E7EB] shadow-sm overflow-hidden">
      {/*
      --------------------------------------------------------
        Cabeçalho da Transcrição
      --------------------------------------------------------
      */}
      <div className="px-[24px] py-[16px] bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] border-b-[1px] border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[20px]">
                {_internalIsProcessing && !isPaused ? 'Transcrevendo em Tempo Real' : isPaused ? 'Transcrição Pausada' : 'Transcrição Concluída'}
              </h3>
              <p className="text-[12px] text-[#6B7280] leading-[16px]">
                {filename} • Modo {mode === 'fast' ? 'Rápido' : mode === 'balanced' ? 'Equilibrado' : 'Perfeito'}
              </p>
            </div>
          </div>

          {/*
          --------------------------------------------------------
            Controles de Reprodução
          --------------------------------------------------------
          */}
          {_internalIsProcessing && (
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#1777CF] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#0F5FA3] transition-all duration-200"
            >
              {isPaused ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4H10V20H6V4Z" fill="currentColor"/>
                  <path d="M14 4H18V20H14V4Z" fill="currentColor"/>
                </svg>
              )}
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
          )}
        </div>

        {/*
        --------------------------------------------------------
          Barra de Progresso do Áudio
        --------------------------------------------------------
        */}
        <div className="mt-[12px] space-y-[6px]">
          <div className="flex justify-between text-[11px] text-[#6B7280]">
            <span>{formatTime(currentTime)}</span>
            <span>{audioProgress.toFixed(1)}%</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-[4px] h-[4px] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1777CF] to-[#0F5FA3] rounded-[4px] transition-all duration-300"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/*
      --------------------------------------------------------
        Área de Transcrição em Tempo Real
      --------------------------------------------------------
      */}
      <div 
        ref={segmentRef}
        className="p-[24px] max-h-[400px] overflow-y-auto space-y-[12px]"
      >
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-[8px] p-[12px] bg-[#F9FAFB] rounded-[8px] border-[1px] border-[#E5E7EB]">
              <div className="flex-shrink-0 w-[6px] h-[6px] bg-[#10B981] rounded-full mt-[6px]" />
              <div className="flex-1">
                <p className="text-[14px] text-[#374151] leading-[20px]">
                  {segment.text}
                </p>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-[10px] text-[#9CA3AF]">
                    {formatTime(Date.now() - segment.timestamp)}
                  </span>
                  <div className="flex items-center gap-[4px]">
                    <div className={`w-[4px] h-[4px] rounded-full ${
                      segment.confidence > 0.95 ? 'bg-[#10B981]' : 
                      segment.confidence > 0.85 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                    }`} />
                    <span className="text-[10px] text-[#9CA3AF]">
                      {(segment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/*
        --------------------------------------------------------
          Segmento Atual (Em Processamento)
        --------------------------------------------------------
        */}
        {currentSegment && (
          <div className="animate-pulse">
            <div className="flex items-start gap-[8px] p-[12px] bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] rounded-[8px] border-[1px] border-[#1777CF] border-opacity-30">
              <div className="flex-shrink-0 w-[6px] h-[6px] bg-[#1777CF] rounded-full mt-[6px] animate-pulse" />
              <div className="flex-1">
                <p className="text-[14px] text-[#1E40AF] leading-[20px] font-medium">
                  {currentSegment}
                  <span className="inline-block w-[2px] h-[16px] bg-[#1777CF] ml-[2px] animate-pulse" />
                </p>
                <span className="text-[10px] text-[#3B82F6]">
                  Processando...
                </span>
              </div>
            </div>
          </div>
        )}

        {/*
        --------------------------------------------------------
          Estado Vazio
        --------------------------------------------------------
        */}
        {segments.length === 0 && !currentSegment && _internalIsProcessing && (
          <div className="text-center py-[32px]">
            <div className="w-[48px] h-[48px] bg-gradient-to-br from-[#1777CF] to-[#0F5FA3] rounded-[12px] flex items-center justify-center mx-auto mb-[16px] animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C12 1 15 4 19 4V11C19 16 12 23 12 23C12 23 5 16 5 11V4C9 4 12 1 12 1Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 13H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[14px] text-[#6B7280] leading-[20px]">
              Aguardando início da transcrição...
            </p>
          </div>
        )}
      </div>

      {/*
      --------------------------------------------------------
        Estatísticas da Transcrição
      --------------------------------------------------------
      */}
      {(segments.length > 0 || currentSegment) && (
        <div className="px-[24px] py-[12px] bg-[#F8FAFC] border-t-[1px] border-[#E5E7EB]">
          <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
            <span>
              {segments.length} segmentos • {segments.reduce((acc, s) => acc + s.text.split(' ').length, 0) + (currentSegment?.split(' ').length || 0)} palavras
            </span>
            <span>
              Confiança média: {segments.length > 0 ? (segments.reduce((acc, s) => acc + s.confidence, 0) / segments.length * 100).toFixed(0) : '0'}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeTranscription;