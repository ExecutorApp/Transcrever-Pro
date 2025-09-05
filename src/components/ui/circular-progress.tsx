/*
--------------------------------------------------------
  Componente: Progresso Circular
--------------------------------------------------------
- SVG animado com progresso de 0 a 100%
- Cores customizáveis
- Tamanho responsivo
- Animações suaves
*/

import React from 'react';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 40,
  strokeWidth = 3,
  color = '#1777CF',
  backgroundColor = '#E5E7EB',
  showPercentage = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Círculo de fundo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Círculo de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Porcentagem centralizada */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#374151]">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;