import React from 'react';
import Image from 'next/image';

interface CroweLogicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'default' | 'gradient' | 'glow';
  className?: string;
}

const sizeMap = {
  xs: { image: 20, text: 'text-xs' },
  sm: { image: 24, text: 'text-sm' },
  md: { image: 32, text: 'text-base' },
  lg: { image: 40, text: 'text-lg' },
  xl: { image: 48, text: 'text-xl' }
};

export default function CroweLogicLogo({
  size = 'md',
  showText = true,
  showTagline = false,
  variant = 'default',
  className = ''
}: CroweLogicLogoProps) {
  const { image: imageSize, text: textSize } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image with Effects */}
      <div className="relative">
        {variant === 'glow' && (
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-50`} />
        )}
        <Image
          src="/crowe-avatar.png"
          alt="Crowe Logic"
          width={imageSize}
          height={imageSize}
          className={`relative rounded-lg ${
            variant === 'gradient' ? 'border-2 border-gradient-to-r from-blue-400 to-purple-400' : ''
          } ${variant === 'glow' ? 'border border-white/20' : ''}`}
          priority
        />
      </div>

      {/* Text Branding */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${textSize} bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
              Crowe Logic
            </span>
            {size !== 'xs' && (
              <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} px-2 py-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-blue-300`}>
                PLATFORM
              </span>
            )}
          </div>
          {showTagline && size !== 'xs' && (
            <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} text-white/40`}>
              Intelligent Development Environment
            </span>
          )}
        </div>
      )}
    </div>
  );
}