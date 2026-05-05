'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate, isValidDate } from '@/lib/utils';
import CashFlowChart from './CashFlowChart';

export default function TransactionList({ userRole }: { userRole: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [broughtForward, setBroughtForward] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [filterWallet, setFilterWallet] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mounted, setMounted] = useState(false);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (filterWallet) params.set('wallet', filterWallet);
      if (filterType) params.set('type', filterType);

      const res = await fetch(`/api/transactions?${params}`);
      const result = await res.json();
      if (result && Array.isArray(result.transactions)) {
        setTransactions(result.transactions);
        setBroughtForward(result.broughtForward || 0);
      } else if (Array.isArray(result)) {
        setTransactions(result);
        setBroughtForward(0);
      } else {
        console.error('API returned unexpected format:', result);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  if (!mounted) return <div className="p-12 text-center text-gray-500">Memulakan...</div>;

  const handleDelete = async (id: string) => {
    try {
      console.log('Attempting to delete:', id);
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memadam transaksi');
      }
      await fetchTransactions();
      alert('Transaksi berjaya dipadam!');
    } catch (error: any) {
      alert('Ralat: ' + error.message);
      console.error('Error:', error);
    }
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setEditForm({
      date: t.date,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
      wallet: t.wallet
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.location.href = `/report?${params}`;
  };

  const handleLockMonth = async () => {
    if (!confirm('Kunci data bulan ini? Tidak boleh edit selepas ini.')) return;
    try {
      await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: new Date().toISOString().substring(0, 7) + '-01' })
      });
      alert('Bulan dikunci!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Calculate running balances
  let runningBalance = broughtForward;
  const transactionsWithBalance = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => {
      const amt = parseFloat(t.amount);
      if (t.type === 'penerimaan') runningBalance += amt;
      else runningBalance -= amt;
      return { ...t, runningBalance };
    })
    .reverse(); // Back to descending for display

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
      {/* Filters */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-2 border-r border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tempoh</span>
          </div>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-2 py-1 bg-transparent text-sm focus:outline-none" />
          <span className="text-gray-300">→</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-2 py-1 bg-transparent text-sm focus:outline-none" />
          <button onClick={fetchTransactions} className="ml-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-200">Tapis</button>
        </div>

        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Muat Turun PDF
          </button>
          {userRole === 'pengerusi' && (
            <button onClick={handleLockMonth} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-purple-200">Kunci Bulan</button>
          )}
        </div>

        <div className="flex-1 md:block hidden"></div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <select value={filterWallet} onChange={e => { setFilterWallet(e.target.value); setTimeout(fetchTransactions, 0); }} className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer">
              <option value="">Semua Dompet</option>
              <option value="bank">Bank</option>
              <option value="tunai">Tunai</option>
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setTimeout(fetchTransactions, 0); }} className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer">
              <option value="">Semua Jenis</option>
              <option value="penerimaan">Penerimaan</option>
              <option value="perbelanjaan">Perbelanjaan</option>
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M17 7h.01M17 11h.01M17 15h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {transactions.length > 0 && (
        <div className="p-6 bg-gradient-to-b from-white to-gray-50/30">
          <CashFlowChart transactions={transactions} />
        </div>
      )}

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tarikh</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Butiran & Kategori</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Dompet</th>
              <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] text-right bg-emerald-50/30">Debit (Masuk)</th>
              <th className="px-6 py-4 text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] text-right bg-rose-50/30">Kredit (Keluar)</th>
              <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] text-right">Baki</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-medium animate-pulse">Memuatkan data transaksi pintar...</td></tr>
            ) : transactionsWithBalance.length === 0 ? (
              <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-medium italic">Tiada rekod transaksi dijumpai untuk kriteria ini</td></tr>
            ) : (
              transactionsWithBalance.map((t) => (
                <tr key={t.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === t.id ? (
                      <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-inner" />
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{formatDate(t.date).split('/')[0]}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter leading-none">{formatDate(t.date).split('/').slice(1).join('/')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === t.id ? (
                      <div className="space-y-2">
                        <input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-inner" placeholder="Kategori" />
                        <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-inner" placeholder="Butiran" />
                      </div>
                    ) : (
                      <div className="max-w-xs">
                        <p className="text-sm font-black text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">{t.category}</p>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed truncate" title={t.description}>{t.description}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === t.id ? (
                      <select value={editForm.wallet} onChange={e => setEditForm({ ...editForm, wallet: e.target.value })} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-inner">
                        <option value="bank">Bank</option>
                        <option value="tunai">Tunai</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${t.wallet === 'bank' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {t.wallet === 'bank' ? 'Bank' : 'Tunai'}
                      </span>
                    )}
                  </td>
                  {/* Debit Column */}
                  <td className="px-6 py-4 text-right bg-emerald-50/10 group-hover:bg-emerald-50/20 transition-colors">
                    {t.type === 'penerimaan' ? (
                      <span className="text-sm font-black text-emerald-600">{formatCurrency(t.amount)}</span>
                    ) : <span className="text-gray-200">--</span>}
                  </td>
                  {/* Credit Column */}
                  <td className="px-6 py-4 text-right bg-rose-50/10 group-hover:bg-rose-50/20 transition-colors">
                    {t.type === 'perbelanjaan' ? (
                      <span className="text-sm font-black text-rose-600">{formatCurrency(t.amount)}</span>
                    ) : <span className="text-gray-200">--</span>}
                  </td>
                  {/* Running Balance Column */}
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-black ${t.runningBalance < 0 ? 'text-red-700' : 'text-gray-900'}`}>
                      {formatCurrency(t.runningBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === t.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveEdit(t.id)} className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition">✓</button>
                        <button onClick={cancelEdit} className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition">✕</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {userRole === 'bendahari' && (
                          <>
                            <button onClick={() => startEdit(t)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm" title="Kemaskini">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition shadow-sm" title="Padam">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - Refined */}
      <div className="md:hidden divide-y divide-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse font-medium">Memuatkan transaksi...</div>
        ) : transactionsWithBalance.length === 0 ? (
          <div className="p-12 text-center text-gray-400 italic">Tiada rekod dijumpai</div>
        ) : (
          transactionsWithBalance.map((t) => (
            <div key={t.id} className="p-5 active:bg-gray-50 transition-colors">
              {editingId === t.id ? (
                <div className="space-y-4">
                  <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-inner" />
                  <input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-inner" placeholder="Kategori" />
                  <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-inner" placeholder="Butiran" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={editForm.wallet} onChange={e => setEditForm({ ...editForm, wallet: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-inner">
                      <option value="bank">Bank</option>
                      <option value="tunai">Tunai</option>
                    </select>
                    <input type="number" step="0.01" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-right font-bold shadow-inner" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => saveEdit(t.id)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Simpan Perubahan</button>
                    <button onClick={cancelEdit} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${t.wallet === 'bank' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                          {t.wallet === 'bank' ? 'Bank' : 'Tunai'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tight">{formatDate(t.date)}</span>
                      </div>
                      <h3 className="text-sm font-black text-gray-900">{t.category}</h3>
                      <p className="text-xs text-gray-500 font-medium leading-tight">{t.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black ${t.type === 'penerimaan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'penerimaan' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Baki: {formatCurrency(t.runningBalance)}</p>
                    </div>
                  </div>

                  {userRole === 'bendahari' && (
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                      <button onClick={() => startEdit(t)} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">Ubah</button>
                      <button onClick={() => handleDelete(t.id)} className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">Padam</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
