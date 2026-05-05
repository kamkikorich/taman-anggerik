'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
    >
      Log Keluar
    </button>
  );
}
