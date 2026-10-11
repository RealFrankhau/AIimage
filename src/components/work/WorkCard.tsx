'use client';

import React from 'react';
import Link from 'next/link';
// import Image from 'next/image';
import { Heart, MoreVertical, Edit, Trash2, Copy, Download, Star } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { SimpleCard, SimpleCardContent } from '@/components/ui/simple-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/helpers';
import type { Work } from '@/types';
import { toggleFavoriteAction, deleteWorkAction } from '@/app/actions/works';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface WorkCardProps {
  work: Work;
  viewMode?: 'grid' | 'list';
  onDelete?: () => void;
}

export function WorkCard({ work, viewMode = 'grid', onDelete }: WorkCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = React.useState(false);
  const [, startTransition] = useTransition();

  const handleFavoriteToggle = () => {
    setIsTogglingFavorite(true);
    startTransition(async () => {
      const result = await toggleFavoriteAction(work.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(work.is_favorite ? 'Removed from favorites' : 'Added to favorites');
      }
      setIsTogglingFavorite(false);
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this work? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteWorkAction(work.id);
      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
      } else {
        toast.success('Work deleted');
        onDelete?.();
      }
    });
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(work.prompt);
    toast.success('Prompt copied to clipboard');
  };

  const handleCopyNegativePrompt = async () => {
    if (work.negative_prompt) {
      await navigator.clipboard.writeText(work.negative_prompt);
      toast.success('Negative prompt copied to clipboard');
    }
  };

  const imageUrl = `/api/image?path=${encodeURIComponent(work.image_path)}&w=400&h=300`;

  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <Link href={`/work/${work.id}`} className="flex-shrink-0 w-24 h-24 relative">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted relative">
            <img
              src={imageUrl}
              alt={work.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link href={`/work/${work.id}`} className="block">
              <h3 className="font-medium text-lg truncate hover:text-primary transition-colors">
                {work.title}
              </h3>
            </Link>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {work.category && (
                <span className="px-2 py-0.5 rounded bg-secondary">{work.category.name}</span>
              )}
              {work.ai_tool && <span>{work.ai_tool}</span>}
              {work.style && <span>{work.style}</span>}
              <span>{formatDate(work.created_at)}</span>
            </div>
            <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">{work.prompt}</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              disabled={isTogglingFavorite}
              aria-label={work.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={work.is_favorite ? 'text-yellow-500' : 'text-muted-foreground'}
            >
              <Heart className={cn('h-4 w-4', work.is_favorite && 'fill-current')} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyPrompt}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </DropdownMenuItem>
                {work.negative_prompt && (
                  <DropdownMenuItem onClick={handleCopyNegativePrompt}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Negative Prompt
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/work/${work.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleCard className="overflow-hidden transition-shadow hover:shadow-md flex flex-col h-full">
      <Link href={`/work/${work.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-muted">
          <img
            src={imageUrl}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
        {/* Favorite button overlay */}
        <div className="absolute top-2 right-2">
          <Button
            variant="default"
            size="icon"
            onClick={handleFavoriteToggle}
            disabled={isTogglingFavorite}
            className={cn(
              'bg-background/80 backdrop-blur-sm',
              work.is_favorite ? 'bg-yellow-500 text-yellow-50-foreground' : ''
            )}
            aria-label={work.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-4 w-4', work.is_favorite && 'fill-current')} />
          </Button>
        </div>
        {/* More menu overlay */}
        <div className="absolute bottom-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="icon" className="bg-background/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyPrompt}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Prompt
              </DropdownMenuItem>
              {work.negative_prompt && (
                <DropdownMenuItem onClick={handleCopyNegativePrompt}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Negative Prompt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/work/${work.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
      <SimpleCardContent className="flex-1 flex flex-col p-4">
        <Link href={`/work/${work.id}`} className="block">
          <h3 className="font-medium truncate hover:text-primary transition-colors">{work.title}</h3>
        </Link>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {work.category && (
            <span className="px-2 py-0.5 text-xs rounded bg-secondary">{work.category.name}</span>
          )}
          {work.ai_tool && (
            <span className="px-2 py-0.5 text-xs rounded bg-muted">{work.ai_tool}</span>
          )}
          {work.style && (
            <span className="px-2 py-0.5 text-xs rounded bg-muted">{work.style}</span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(work.created_at)}</span>
          {work.is_favorite && <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />}
        </div>
      </SimpleCardContent>
    </SimpleCard>
  );
}