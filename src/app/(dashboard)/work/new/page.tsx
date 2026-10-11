import { getCategories, getUniqueValues } from '@/lib/queries';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkFormClient } from './WorkFormClient';
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">New Work</h1>
          <p className="text-muted-foreground mt-1">Add a new AI generation to your library</p>
        </div>
        <WorkFormClient
          initialCategories={categories}
          initialAiTools={uniqueValues.ai_tools}
          initialStyles={uniqueValues.styles}
        />
      </div>
    </DashboardLayout>
  );
}