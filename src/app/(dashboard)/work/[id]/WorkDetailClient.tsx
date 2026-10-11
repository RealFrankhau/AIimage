'use client';

import { useState } from 'react';
import Link from 'next/link';
// import Image from 'next/image';
import { 
  Copy, 
  Edit, 
  Trash2, 
  Heart, 
  Download, 
  Maximize, 
  Minimize,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatDateTime, cn } from '@/utils/helpers';
import { toggleFavoriteAction, deleteWorkAction } from '@/app/actions/works';
import { useTransition } from 'react';
import { toast } from 'sonner';
import type { Work } from '@/types';

interface WorkDetailClientProps {
  work: Work;
  imageUrl: string;
}

export function WorkDetailClient({ work, imageUrl }: WorkDetailClientProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
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
        window.location.href = '/dashboard';
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

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${work.title.replace(/[^a-z0-9]/gi, '_')}.${work.image_path.split('.').pop() || 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{work.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDateTime(work.created_at)}
              {work.updated_at !== work.created_at && ` • Updated ${formatDateTime(work.updated_at)}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavoriteToggle}
            disabled={isTogglingFavorite}
            className={cn('gap-2', work.is_favorite && 'text-yellow-500 border-yellow-500/50')}
          >
            <Heart className={cn('h-4 w-4', work.is_favorite && 'fill-current')} />
            {work.is_favorite ? 'Favorited' : 'Favorite'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/work/${work.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Work
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

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Image Panel */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {!imageLoadError ? (
                  <img
                    src={imageUrl}
                    alt={work.title}
                    className="w-full h-full object-contain"
                    onError={() => setImageLoadError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mb-4 text-destructive/50" />
                    <p>Failed to load image</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      Open in new tab
                    </Button>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsImageModalOpen(true)}
                    aria-label="View fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm"
                    onClick={handleDownload}
                    aria-label="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPrompt}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Prompt
            </Button>
            {work.negative_prompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyNegativePrompt}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Negative Prompt
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Image
            </Button>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
          {/* Prompt Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                {work.prompt}
              </div>
            </CardContent>
          </Card>

          {work.negative_prompt && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Negative Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                  {work.negative_prompt}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                {work.ai_tool && (
                  <>
                    <dt className="text-muted-foreground">AI Tool</dt>
                    <dd className="font-medium">{work.ai_tool}</dd>
                  </>
                )}
                {work.model_name && (
                  <>
                    <dt className="text-muted-foreground">Model</dt>
                    <dd className="font-medium">{work.model_name}</dd>
                  </>
                )}
                {work.style && (
                  <>
                    <dt className="text-muted-foreground">Style</dt>
                    <dd className="font-medium">{work.style}</dd>
                  </>
                )}
                {work.category && (
                  <>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{work.category.name}</dd>
                  </>
                )}
                {(work.image_width || work.image_height) && (
                  <>
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd className="font-medium">
                      {work.image_width} × {work.image_height}px
                      {work.aspect_ratio && ` (${work.aspect_ratio})`}
                    </dd>
                  </>
                )}
                {work.seed && (
                  <>
                    <dt className="text-muted-foreground">Seed</dt>
                    <dd className="font-medium font-mono">{work.seed}</dd>
                  </>
                )}
              </dl>

              {work.parameters && (
                <div>
                  <dt className="text-muted-foreground text-sm mb-1">Parameters</dt>
                  <dd className="font-mono text-sm bg-muted p-3 rounded-lg max-h-48 overflow-y-auto">
                    {typeof work.parameters === 'object' 
                      ? JSON.stringify(work.parameters, null, 2)
                      : String(work.parameters)}
                  </dd>
                </div>
              )}

              {work.tags && work.tags.length > 0 && (
                <div>
                  <dt className="text-muted-foreground text-sm mb-1">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {work.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded bg-secondary">
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {work.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{work.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>{work.title}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[4/3] bg-black">
            <img
              src={imageUrl}
              alt={work.title}
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}