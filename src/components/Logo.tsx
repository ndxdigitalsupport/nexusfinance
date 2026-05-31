import React from 'react';
// @ts-ignore
import logoImg from '../logo.png';

interface LogoProps {
  className?: string;
  size?: number; // width/height of the emblem/container
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'gradient';
}

export default function Logo({
  className = '',
  size = 48,
  showText = false,
  showTagline = false,
  variant = 'gradient'
}: LogoProps) {
  // If we want to show the full combined logo in all its glory (icon + text + tagline)
  if (showText) {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={logoImg}
          alt="Nexusfinance Logo"
          className="object-contain select-none pointer-events-none"
          style={{ width: size * 2.2, height: 'auto' }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Icon-only mode: Display only the interlocking "N" graphic. 
  // The official logo image is a 1:1 square with the icon occupying the top ~56%.
  // We crop the bottom text elegantly using overflow-hidden and absolute positioning.
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div 
        className="relative overflow-hidden flex items-center justify-center select-none pointer-events-none" 
        style={{ width: size, height: size }}
      >
        <img
          src={logoImg}
          alt="Nexusfinance Icon"
          className="absolute max-w-none origin-top"
          style={{ 
            width: size * 1.8,  // Scale up slightly to isolate the "N" emblem
            height: 'auto',
            top: '-6%',         // Align top
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
