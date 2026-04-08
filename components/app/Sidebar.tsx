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
    <aside className="hidden md:flex w-64 bg-white border-r border-neutral-200 flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-brand-600">
          <span>🐾</span>
          <span>Pet Reunite</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-brand-100 text-brand-700 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <button className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition">
          Logout
        </button>
      </div>
    </aside>
  );
}
