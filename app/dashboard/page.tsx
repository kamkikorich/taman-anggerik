import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import BalanceCard from '@/components/BalanceCard';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const userRole = (session.user as any).role;
  const userName = (session.user as any).name;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="https://i.postimg.cc/Tw0BvfwH/Screenshot-2026-06-22-211709.png" alt="KRT Logo" className="w-auto h-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">KRT Taman Anggerik Keningau</h1>
                <p className="text-xs text-gray-500">Sistem Pengurusan Kewangan Digital</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              {(userRole === 'bendahari' || userRole === 'pengerusi') && (
                <a href="/users" className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">Pengguna</a>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BalanceCard />
        <TransactionForm userRole={userRole} userId={(session.user as any).id} />
        <TransactionList userRole={userRole} />
      </main>
    </div>
  );
}
