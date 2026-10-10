import { getWorkById, getCategories, getUniqueValues } from '@/lib/queries';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkForm } from '@/components/work/WorkForm';
import { updateWorkAction } from '@/app/actions/works';
import { getSession } from '@/app/actions/auth';
import { notFound, redirect } from 'next/navigation';

interface EditWorkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkPage({ params }: EditWorkPageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const work = await getWorkById(id);

  if (!work) {
    notFound();
  }

  const [categories, uniqueValues] = await Promise.all([
    getCategories(),
    getUniqueValues(),
  ]);

  const handleSubmit = async (data: any, imageFile: File | null) => {
    const formData = new FormData();
    formData.append('id', id);
    
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

  // Convert work data to form format
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Edit Work</h1>
          <p className="text-muted-foreground mt-1">Update your AI generation details</p>
        </div>
        <WorkForm
          initialData={initialData}
          categories={categories}
          aiTools={uniqueValues.ai_tools}
          styles={uniqueValues.styles}
          isEditing={true}
          onSubmit={handleSubmit}
          onCancel={() => window.history.back()}
        />
      </div>
    </DashboardLayout>
  );
}