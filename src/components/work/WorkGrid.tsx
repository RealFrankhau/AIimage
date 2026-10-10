'use client';

import { WorkCard } from './WorkCard';
import type { Work } from '@/types';

interface WorkGridProps {
  works: Work[];
  viewMode: 'grid' | 'list';
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function WorkGrid({ works, viewMode, onDelete, emptyMessage, emptyAction }: WorkGridProps) {
  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No works found</h3>
        <p className="mt-1 text-muted-foreground">{emptyMessage || 'Get started by adding your first AI generation.'}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3" role="list">
        {works.map((work) => (
          <WorkCard key={work.id} work={work} viewMode="list" onDelete={() => onDelete?.(work.id)} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
      role="list"
    >
      {works.map((work) => (
        <WorkCard key={work.id} work={work} viewMode="grid" onDelete={() => onDelete?.(work.id)} />
      ))}
    </div>
  );
}