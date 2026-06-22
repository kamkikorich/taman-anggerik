import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserManagement from '@/components/UserManagement';

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect('/login');
  const userRole = (session.user as any).role;
  if (userRole !== 'bendahari' && userRole !== 'pengerusi') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="https://i.postimg.cc/Tw0BvfwH/Screenshot-2026-06-22-211709.png" alt="KRT Logo" className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">waju.my</h1>
                <p className="text-xs text-gray-500">Pengurusan Pengguna</p>
              </div>
            </div>
            <a href="/dashboard" className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">← Kembali</a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UserManagement />
      </main>
    </div>
  );
}
