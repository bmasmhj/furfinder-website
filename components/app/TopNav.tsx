'use client';

import Link from 'next/link';

export default function TopNav() {
  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">The Fur Finder</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 transition hover:bg-muted" title="Notifications">
          🔔
        </button>
        <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary font-bold text-white">
          U
        </div>
      </div>
    </nav>
  );
}
