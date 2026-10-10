'use client';

import type { Work } from '../../types';

export function WorkCard({ work, viewMode = 'grid', onDelete }: { work: Work; viewMode?: 'grid' | 'list'; onDelete?: () => void }) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3>{work.title}</h3>
      <p>{work.prompt}</p>
    </div>
  );
}