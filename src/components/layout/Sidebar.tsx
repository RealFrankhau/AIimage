'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FolderOpen, Heart, Tag, Clock, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/helpers';

const navigation = [
  { name: 'All Works', href: '/dashboard', icon: FolderOpen },
  { name: 'Favorites', href: '/dashboard?filter=favorites', icon: Heart },
  { name: 'Categories', href: '/dashboard?view=categories', icon: Tag },
  { name: 'Recently Added', href: '/dashboard?sort=recent', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getActiveItem = () => {
    const filter = searchParams.get('filter');
    const view = searchParams.get('view');
    const sort = searchParams.get('sort');

    if (pathname === '/settings') return 'Settings';
    if (filter === 'favorites') return 'Favorites';
    if (view === 'categories') return 'Categories';
    if (sort === 'recent') return 'Recently Added';
    return 'All Works';
  };

  const activeItem = getActiveItem();

  return (
    <aside className="hidden lg:flex lg:w-64 flex-col border-r bg-background">
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = activeItem === item.name;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Private AI Generation Library
        </p>
      </div>
    </aside>
  );
}