import React from 'react';

export const CEKMOBIL_LOGO_URL = '/assets/aistudio/WhatsApp_Image_2026-10-22_at_09.13.30_37a8352c.jpeg';

interface CekmobilLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'print';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  imageOnly?: boolean;
}

export const CekmobilLogo: React.FC<CekmobilLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  imageOnly = false,
}) => {
  const isLight = variant === 'light';
  const isPrint = variant === 'print';

  const markSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-base';

  if (imageOnly) {
    return (
      <div className={`relative ${markSize} shrink-0 rounded-full overflow-hidden shadow-xs ring-1 ring-red-500/40 bg-black ${className}`}>
        <img
          src={CEKMOBIL_LOGO_URL}
          alt="Logo Cekmobil.id"
          className="w-full h-full object-cover select-none"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Cekmobil.id Circular Image Badge */}
      <div
        className={`relative ${markSize} shrink-0 rounded-full overflow-hidden shadow-xs ring-1 ${
          isPrint ? 'ring-zinc-800' : 'ring-red-500/40'
        } bg-black flex items-center justify-center`}
      >
        <img
          src={CEKMOBIL_LOGO_URL}
          alt="Logo Cekmobil.id"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline tracking-tight">
          <span
            className={`font-black uppercase tracking-wider ${titleSize} ${
              isLight || isPrint ? 'text-zinc-900' : 'text-white'
            }`}
          >
            CEKMOBIL
          </span>
          <span className={`font-black text-red-600 ${titleSize} ml-0.5`}>
            .ID
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] font-semibold tracking-wide uppercase truncate -mt-0.5 ${
              isLight || isPrint ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            SMK Otomotif Cekmobil
          </span>
        )}
      </div>
    </div>
  );
};
