import { getWorkById, getCategories, getUniqueValues } from '@/lib/queries';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EditWorkFormClient } from './EditWorkFormClient';
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

  return (
    <DashboardLayout>
      <EditWorkFormClient
        work={work}
        initialCategories={categories}
        initialAiTools={uniqueValues.ai_tools}
        initialStyles={uniqueValues.styles}
      />
    </DashboardLayout>
  );
}