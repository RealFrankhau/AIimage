import { getWorkById } from '@/lib/queries';
import { getSignedUrl } from '@/lib/storage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkDetailClient } from './WorkDetailClient';
import { notFound } from 'next/navigation';
import { getSession } from '@/app/actions/auth';

interface WorkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const session = await getSession();
  if (!session) {
    // This will be handled by middleware, but just in case
    return null;
  }

  const { id } = await params;
  const work = await getWorkById(id);

  if (!work) {
    notFound();
  }

  // Generate signed URL for the image
  const { url: imageUrl } = await getSignedUrl(work.image_path, 3600);

  return (
    <DashboardLayout>
      <WorkDetailClient work={work} imageUrl={imageUrl} />
    </DashboardLayout>
  );
}