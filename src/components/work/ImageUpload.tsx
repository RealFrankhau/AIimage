'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/helpers';
import { validateImageFile } from '@/utils/helpers';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function ImageUpload({
  value,
  onChange,
  previewUrl,
  disabled = false,
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    onChange(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const hasPreview = previewUrl || value;

  return (
    <div
      className={cn(
        'relative border-2 rounded-lg transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {hasPreview ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            onClick={handleRemove}
            disabled={disabled || uploadProgress > 0}
            aria-label="Remove image"
          >
            {uploadProgress > 0 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
          {uploadProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="flex flex-col items-center justify-center p-8 text-center w-full"
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Upload image"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="sr-only"
            disabled={disabled}
            aria-label="Upload image"
          />
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Click or drag to upload</p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG, WebP up to {maxSizeMB}MB
          </p>
        </button>
      )}
    </div>
  );
}