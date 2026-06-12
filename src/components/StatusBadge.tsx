import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'pending';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'var(--success-bg)', text: 'var(--success-text)' },
  error: { bg: 'var(--error-bg)', text: 'var(--error-text)' },
  warning: { bg: 'var(--warning-bg)', text: 'var(--warning-text)' },
  info: { bg: 'var(--info-bg)', text: 'var(--info-text)' },
  pending: { bg: 'var(--warning-bg)', text: 'var(--warning-text)' },
};

export default function StatusBadge({ variant, label, size = 'sm' }: StatusBadgeProps) {
  const s = variantStyles[variant];
  return (
    <span
      className={`inline-block rounded-md font-bold ${size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'}`}
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {label}
    </span>
  );
}
