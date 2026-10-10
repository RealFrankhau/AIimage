import { getCategories, getUniqueValues } from '@/lib/queries';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkForm } from '@/components/work/WorkForm';
import { createWorkAction } from '@/app/actions/works';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function NewWorkPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const [categories, uniqueValues] = await Promise.all([
    getCategories(),
    getUniqueValues(),
  ]);

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">New Work</h1>
          <p className="text-muted-foreground mt-1">Add a new AI generation to your library</p>
        </div>
        <WorkForm
          categories={categories}
          aiTools={uniqueValues.ai_tools}
          styles={uniqueValues.styles}
          isEditing={false}
          onSubmit={handleSubmit}
          onCancel={() => window.history.back()}
        />
      </div>
    </DashboardLayout>
  );
}