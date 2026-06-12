import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-16 text-center flex flex-col items-center">
      <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-2xl flex items-center justify-center mb-5 border border-[var(--border-primary)]/50">
        <Icon className="w-10 h-10 text-[var(--text-tertiary)]" />
      </div>
      <p className="text-[var(--text-primary)] font-extrabold text-[17px]">{title}</p>
      {description && <p className="text-[var(--text-tertiary)] text-[13px] mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
