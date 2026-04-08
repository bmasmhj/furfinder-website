'use client';

import Link from 'next/link';

export default function TopNav() {
  return (
    <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-neutral-900">Pet Reunite AI</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-neutral-100 rounded-lg transition" title="Notifications">
          🔔
        </button>
        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold cursor-pointer">
          U
        </div>
      </div>
    </nav>
  );
}
