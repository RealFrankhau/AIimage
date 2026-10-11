'use client';

import { WorkForm } from '@/components/work/WorkForm';
import { updateWorkAction } from '@/app/actions/works';
import { redirect } from 'next/navigation';
import type { Work, Category } from '@/types';

interface EditWorkFormClientProps {
  work: Work;
  initialCategories: Category[];
  initialAiTools: string[];
  initialStyles: string[];
}

export function EditWorkFormClient({ work, initialCategories, initialAiTools, initialStyles }: EditWorkFormClientProps) {
  const initialData = {
    title: work.title,
    prompt: work.prompt,
    negative_prompt: work.negative_prompt || '',
    ai_tool: work.ai_tool || '',
    model_name: work.model_name || '',
    style: work.style || '',
    category_id: work.category_id || '',
    tags: work.tags?.join(', ') || '',
    image_width: work.image_width || undefined,
    image_height: work.image_height || undefined,
    aspect_ratio: work.aspect_ratio || '',
    seed: work.seed || '',
    parameters: work.parameters ? JSON.stringify(work.parameters, null, 2) : '',
    notes: work.notes || '',
    created_at: work.created_at,
  };

  const handleSubmit = async (data: any, imageFile: File | null) => {
    const formData = new FormData();
    formData.append('id', work.id);
    
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

    const result = await updateWorkAction(formData);
    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <WorkForm
      initialData={initialData}
      categories={initialCategories}
      aiTools={initialAiTools}
      styles={initialStyles}
      isEditing={true}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}