'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'My Reports', href: '/reports', icon: '📋' },
  { label: 'Matches', href: '/matches', icon: '🎯' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <span>🐾</span>
          <span>Pet Reunite</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 transition ${
                isActive
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button className="w-full px-4 py-2 text-left text-sm text-muted-foreground transition hover:text-foreground">
          Logout
        </button>
      </div>
    </aside>
  );
}
