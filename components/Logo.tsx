
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const scales = {
    sm: 'scale-[0.3]',
    md: 'scale-[0.5]',
    lg: 'scale-[0.75]',
    xl: 'scale-[0.9]'
  };

  return (
    <div className={`flex flex-col items-start ${scales[size]} ${className} origin-left transition-all`}>
      <div className="relative flex items-center">
        {/* Bloco Verde Principal (Esquerda) */}
        <div className="w-48 h-48 bg-[#007a33] border-[6px] border-black relative z-0 shrink-0">
          <div className="absolute inset-0 border-[6px] border-white/10"></div>
        </div>

        {/* Bloco Branco com Texto (Sobreposto) */}
        <div className="absolute left-10 w-[450px] h-24 bg-white border-[6px] border-black z-10 flex items-center px-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-black font-[900] text-[84px] tracking-[-0.05em] leading-none italic" style={{ fontFamily: 'serif' }}>
            TERRA
          </span>
          <span className="ml-3 text-[#007a33] font-[900] text-[84px] tracking-tighter leading-none italic">
            PRO
          </span>
        </div>
      </div>

      {/* Barras de Texto Inferiores fiéis ao PDF */}
      <div className="mt-6 w-[550px] space-y-2 z-20">
        <div className="bg-[#007a33] border-l-[12px] border-black py-2 px-6 flex items-center">
          <span className="text-white font-[900] text-2xl uppercase tracking-[0.1em] italic">
            TRANSPORTADORA TERRAPLANAGEM
          </span>
        </div>
        <div className="bg-black py-2 px-6 flex items-center justify-center">
          <span className="text-white font-[900] text-3xl uppercase tracking-[0.4em]">
            LOCAÇÃO DE MÁQUINAS
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
