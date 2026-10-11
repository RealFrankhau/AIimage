'use client';

import { WorkForm } from '@/components/work/WorkForm';
import { createWorkAction } from '@/app/actions/works';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import type { Category } from '@/types';

interface WorkFormClientProps {
  initialCategories: Category[];
  initialAiTools: string[];
  initialStyles: string[];
}

export function WorkFormClient({ initialCategories, initialAiTools, initialStyles }: WorkFormClientProps) {
  const handleSubmit = async (data: any, imageFile: File | null) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'tags' && typeof value === 'string') {
          formData.append(key, value);
        } else if (key === 'image_width' || key === 'image_height') {
          formData.append(key, String(value));
        } else if (key === 'parameters' && typeof value === 'string') {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = await createWorkAction(formData);
    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <WorkForm
      categories={initialCategories}
      aiTools={initialAiTools}
      styles={initialStyles}
      isEditing={false}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}