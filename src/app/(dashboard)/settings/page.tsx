import { getCategories } from '@/lib/queries';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsPageClient } from './SettingsPageClient';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const categories = await getCategories();

  return (
    <DashboardLayout>
      <SettingsPageClient 
        categories={categories}
        userName={session.user_metadata?.full_name || session.email?.split('@')[0] || 'User'}
        userEmail={session.email || ''}
      />
    </DashboardLayout>
  );
}