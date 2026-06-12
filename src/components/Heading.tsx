import React from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingProps {
  level?: HeadingLevel;
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

const sizeMap: Record<HeadingLevel, string> = {
  h1: 'text-[32px] md:text-[36px] font-extrabold tracking-tight',
  h2: 'text-[28px] font-extrabold',
  h3: 'text-[18px] font-bold',
  h4: 'text-[15px] font-bold',
};

export default function Heading({ level = 'h2', children, subtitle, className = '' }: HeadingProps) {
  const Tag = level;
  return (
    <div className={`${subtitle ? 'mb-6' : ''} ${className}`}>
      <Tag className={`${sizeMap[level]} text-[var(--text-primary)]`}>{children}</Tag>
      {subtitle && <p className="text-[14px] text-[var(--text-secondary)] font-medium mt-1">{subtitle}</p>}
    </div>
  );
}
