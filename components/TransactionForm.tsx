'use client';

import { useState } from 'react';

const categories = {
  penerimaan: ['Baki Awal', 'Yuran Keahlian', 'Sumbangan', 'Geran', 'Lain-lain'],
  perbelanjaan: ['Makan Minum', 'Beli Barang', 'Sewa Dewan', 'Pengangkutan', 'Lain-lain'],
};

export default function TransactionForm({ userRole, userId }: { userRole: string; userId: string }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'penerimaan',
    category: '',
    description: '',
    amount: '',
    wallet: 'bank',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (userRole !== 'bendahari') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }

      setSuccess('Transaksi berjaya ditambah!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'penerimaan',
        category: '',
        description: '',
        amount: '',
        wallet: 'bank',
      });

      // Refresh balance
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 mb-8 transition-all hover:shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -z-10 opacity-50"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rekod Transaksi</h2>
          <p className="text-slate-500 text-sm font-medium">Sila masukkan butiran kewangan dengan teliti</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-bounce-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tarikh Transaksi</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Aliran</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="penerimaan">Penerimaan (Debit)</option>
              <option value="perbelanjaan">Perbelanjaan (Kredit)</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold appearance-none cursor-pointer"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories[formData.type as keyof typeof categories].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Wallet */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sumber Kewangan</label>
            <select
              value={formData.wallet}
              onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="bank">Bank Rakyat (1102279328)</option>
              <option value="tunai">Tunai di Tangan</option>
            </select>
          </div>

          {/* Amount */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Nilai (RM)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">RM</div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-xl font-black text-slate-900"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Butiran & Nota</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium min-h-[80px]"
            placeholder="Nyatakan tujuan transaksi atau butiran tambahan..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : 'Simpan Transaksi Pintar'}
          </button>
        </div>
      </form>
    </div>
  );
}
