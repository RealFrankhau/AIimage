'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';
import type { Category } from '@/types';

const workSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  prompt: z.string().min(1, 'Prompt is required'),
  negative_prompt: z.string().optional(),
  ai_tool: z.string().optional(),
  model_name: z.string().optional(),
  style: z.string().optional(),
  category_id: z.string().optional(),
  tags: z.string().optional(),
  image_width: z.coerce.number().positive().optional(),
  image_height: z.coerce.number().positive().optional(),
  aspect_ratio: z.string().optional(),
  seed: z.string().optional(),
  parameters: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
});

type WorkFormData = z.infer<typeof workSchema>;

interface WorkFormProps {
  initialData?: Partial<WorkFormData> & { image_path?: string };
  categories: Category[];
  aiTools: string[];
  styles: string[];
  isEditing?: boolean;
  onSubmit: (data: WorkFormData, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_AI_TOOLS = ['Midjourney', 'DALL-E 3', 'Stable Diffusion', 'Flux', 'Leonardo', 'Firefly', 'Other'];
const DEFAULT_STYLES = [
  'Photorealistic', 'Illustration', 'Oil Painting', 'Watercolor', 'Pixel Art',
  'Anime', '3D Render', 'Vector', 'Sketch', 'Abstract', 'Cinematic', 'Other'
];

export function WorkForm({
  initialData,
  categories,
  aiTools,
  styles,
  isEditing = false,
  onSubmit,
  onCancel,
}: WorkFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      title: '',
      prompt: '',
      negative_prompt: '',
      ai_tool: '',
      model_name: '',
      style: '',
      category_id: '',
      tags: '',
      image_width: undefined,
      image_height: undefined,
      aspect_ratio: '',
      seed: '',
      parameters: '',
      notes: '',
      created_at: new Date().toISOString(),
      ...initialData,
    },
  });

  // Create preview URL when image file changes
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(initialData?.image_path ? `/api/image?path=${initialData.image_path}&w=400&h=300` : null);
  }, [imageFile, initialData?.image_path]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (!file && initialData?.image_path) {
      // Keep the existing image if user removes new file during edit
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const isValid = await form.trigger();
    if (!isValid) return;

    if (!isEditing && !imageFile) {
      toast.error('Image is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      await onSubmit(data, imageFile);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAiTools = [...new Set([...DEFAULT_AI_TOOLS, ...aiTools])].sort();
  const allStyles = [...new Set([...DEFAULT_STYLES, ...styles])].sort();

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={imageFile}
            onChange={handleImageChange}
            previewUrl={previewUrl}
            disabled={isSubmitting}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {isEditing 
              ? 'Leave empty to keep current image. Upload a new file to replace it.'
              : 'Upload your AI generated image (JPEG, PNG, WebP, max 10MB)'}
          </p>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Required Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Controller
              name="title"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="title"
                  placeholder="Enter a title for your work"
                  disabled={isSubmitting}
                />
              )}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt *</Label>
            <Controller
              name="prompt"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="prompt"
                  placeholder="Enter the full prompt used to generate this image"
                  rows={4}
                  disabled={isSubmitting}
                />
              )}
            />
            {form.formState.errors.prompt && (
              <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="negative_prompt">Negative Prompt</Label>
            <Controller
              name="negative_prompt"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="negative_prompt"
                  placeholder="Negative prompt (optional)"
                  rows={3}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai_tool">AI Tool</Label>
              <Controller
                name="ai_tool"
                control={form.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onValueChange={(value) => field.onChange(value || '')}
                  >
                    <SelectTrigger id="ai_tool" disabled={isSubmitting}>
                      <SelectValue placeholder="Select AI tool" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {allAiTools.map((tool) => (
                        <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_name">Model</Label>
              <Controller
                name="model_name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="model_name"
                    placeholder="e.g., v6, SDXL, Flux Dev"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Controller
                name="style"
                control={form.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onValueChange={(value) => field.onChange(value || '')}
                  >
                    <SelectTrigger id="style" disabled={isSubmitting}>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {allStyles.map((style) => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Controller
                name="category_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onValueChange={(value) => field.onChange(value || '')}
                  >
                    <SelectTrigger id="category_id" disabled={isSubmitting}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="image_width">Width (px)</Label>
              <Controller
                name="image_width"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="image_width"
                    type="number"
                    min="1"
                    placeholder="1024"
                    disabled={isSubmitting}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_height">Height (px)</Label>
              <Controller
                name="image_height"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="image_height"
                    type="number"
                    min="1"
                    placeholder="1024"
                    disabled={isSubmitting}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspect_ratio">Aspect Ratio</Label>
              <Controller
                name="aspect_ratio"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="aspect_ratio"
                    placeholder="1:1, 16:9, etc."
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seed">Seed</Label>
              <Controller
                name="seed"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="seed"
                    placeholder="Random seed value"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="created_at">Created At</Label>
              <Controller
                name="created_at"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="created_at"
                    type="datetime-local"
                    disabled={isSubmitting}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters (JSON)</Label>
            <Controller
              name="parameters"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="parameters"
                  placeholder='{"steps": 30, "cfg": 7, "sampler": "euler_a"}'
                  rows={3}
                  disabled={isSubmitting}
                  className="font-mono text-sm"
                />
              )}
            />
            {form.formState.errors.parameters && (
              <p className="text-sm text-destructive">Invalid JSON format</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="notes"
                  placeholder="Any additional notes about this work..."
                  rows={3}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditing ? 'Update Work' : 'Create Work'
          )}
        </Button>
      </div>
    </form>
  );
}