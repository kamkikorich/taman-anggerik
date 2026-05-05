'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function BalanceCard() {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      setBalance(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Bank Balance */}
      <div className="group relative bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -z-10 group-hover:bg-blue-100 transition-colors"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Baki Bank Rakyat</p>
        </div>
        <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
          {formatCurrency(balance?.bank?.balance || 0)}
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">+{formatCurrency(balance?.bank?.penerimaan || 0)}</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">-{formatCurrency(balance?.bank?.perbelanjaan || 0)}</span>
          </div>
        </div>
      </div>

      {/* Cash Balance */}
      <div className="group relative bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -z-10 group-hover:bg-emerald-100 transition-colors"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Baki Tunai Tangan</p>
        </div>
        <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
          {formatCurrency(balance?.tunai?.balance || 0)}
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">+{formatCurrency(balance?.tunai?.penerimaan || 0)}</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">-{formatCurrency(balance?.tunai?.perbelanjaan || 0)}</span>
          </div>
        </div>
      </div>

      {/* Total Balance */}
      <div className="group relative bg-slate-900 rounded-[2rem] shadow-xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] -z-10 group-hover:bg-white/15 transition-colors"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jumlah Dana KRT</p>
        </div>
        <p className="text-4xl font-black text-white tracking-tighter mb-4">
          {formatCurrency(balance?.total || 0)}
        </p>
        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Status: Stabil & Terjamin</span>
        </div>
      </div>
    </div>
  );
}
