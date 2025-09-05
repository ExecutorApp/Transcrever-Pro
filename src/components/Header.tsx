/*
--------------------------------------------------------
  Componente: Header com Título Centralizado e Ícone de Pasta
--------------------------------------------------------
- justify-between ➔ Distribui espaço entre elementos
- py-[20px] ➔ Padding vertical aumentado
- bg-[#FFFFFF] ➔ Fundo branco mantido
- border-b-[1px] ➔ Borda inferior sutil mantida
*/

import React, { useState, useEffect } from 'react';
import { GradientText } from './ui/gradient-text';
import DirectorySelector from './DirectorySelector';

const Header = () => {
  const [outputDirectory, setOutputDirectory] = useState('');

  // Inicializa o diretório a partir do localStorage, se existir
  useEffect(() => {
    try {
      const saved = localStorage.getItem('outputDirectory');
      if (saved) {
        setOutputDirectory(saved);
      }
    } catch (e) {
      console.warn('Não foi possível ler outputDirectory do localStorage:', e);
    }
  }, []);

  const handleDirectoryChange = (directory: string) => {
    setOutputDirectory(directory);
    // Persistir preferência para outros componentes acessarem (ex.: App.tsx)
    try {
      localStorage.setItem('outputDirectory', directory);
    } catch (e) {
      console.warn('Não foi possível salvar outputDirectory no localStorage:', e);
    }
    // Aqui você pode implementar a lógica para salvar a preferência
    // ou comunicar com outros componentes
    console.log('Diretório selecionado:', directory);
  };

  return (
    <header className="flex justify-between items-center px-[24px] py-[20px] bg-[#FFFFFF] border-b-[1px] border-[#E5E7EB] sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      {/* Espaço vazio para manter o título centralizado */}
      <div className="w-9"></div>
      
      {/*
      --------------------------------------------------------
        Título com Gradiente Animado (Centralizado)
      --------------------------------------------------------
      */}
      <GradientText 
        colors={["#1777CF", "#9c40ff", "#1777CF"]}
        animationSpeed={6}
        className="text-[24px] md:text-[28px] font-bold tracking-[-0.02em]"
      >
        Transcrever Pro
      </GradientText>
      
      {/*
      --------------------------------------------------------
        Ícone de Pasta (Extremo Direito)
      --------------------------------------------------------
      */}
      <DirectorySelector
        onDirectoryChange={handleDirectoryChange}
        currentDirectory={outputDirectory}
      />
    </header>
  );
};

export default Header;