import { getWorks, getCategories, getUniqueValues } from '@/lib/queries';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkGrid } from '@/components/work/WorkGrid';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';

interface DashboardPageProps {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    view?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const query = params.q || '';
  const filter = params.filter;
  const view = params.view;
  const viewMode = (params.view === 'list' ? 'list' : 'grid') as 'grid' | 'list';
  const sort = params.sort;
  const page = parseInt(params.page || '1');

  const filters = {
    query,
    is_favorite: filter === 'favorites',
    sort_by: (sort === 'recent' ? 'created_at' : sort === 'updated' ? 'updated_at' : 'created_at') as 'created_at' | 'updated_at' | 'title',
    sort_order: 'desc' as const,
    page,
    limit: 24,
  };

  const [worksResult, categories, uniqueValues] = await Promise.all([
    getWorks(filters),
    getCategories(),
    getUniqueValues(),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {filter === 'favorites' ? 'Favorites' : view === 'categories' ? 'Categories' : 'All Works'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {worksResult.total} work{worksResult.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link href="/work/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Work
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form action="/dashboard" method="GET" className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                value={query}
                placeholder="Search works, prompts, tags..."
                className="pl-10"
              />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Works Grid */}
        <WorkGrid
          works={worksResult.data}
          viewMode={viewMode}
          emptyMessage={query ? 'No works match your search.' : 'Your library is empty. Add your first AI generation!'}
          emptyAction={
            <Link href="/work/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Work
              </Button>
            </Link>
          }
        />

        {/* Pagination */}
        {worksResult.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <a
                href={`/dashboard?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-accent"
              >
                Previous
              </a>
            )}
            <span className="px-3 py-2 text-sm text-muted-foreground">
              Page {page} of {worksResult.total_pages}
            </span>
            {page < worksResult.total_pages && (
              <a
                href={`/dashboard?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-accent"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Need to import Link
import Link from 'next/link';