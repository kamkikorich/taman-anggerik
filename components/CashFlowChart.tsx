'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CashFlowChart({ transactions }: { transactions: any[] }) {
  const [view, setView] = useState<'bar' | 'line'>('bar');

  // Group by month
  const monthlyData: Record<string, { month: string; penerimaan: number; perbelanjaan: number }> = {};
  for (const t of transactions) {
    const month = t.date.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { month, penerimaan: 0, perbelanjaan: 0 };
    if (t.type === 'penerimaan') monthlyData[month].penerimaan += parseFloat(t.amount);
    else monthlyData[month].perbelanjaan += parseFloat(t.amount);
  }

  const data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Aliran Tunai (Cash Flow)</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('bar')} className={`px-3 py-1 text-sm rounded ${view === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Bar</button>
          <button onClick={() => setView('line')} className={`px-3 py-1 text-sm rounded ${view === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Line</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {view === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => `RM${v.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="penerimaan" fill="#10b981" name="Penerimaan" />
            <Bar dataKey="perbelanjaan" fill="#ef4444" name="Perbelanjaan" />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => `RM${v.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="penerimaan" stroke="#10b981" name="Penerimaan" />
            <Line type="monotone" dataKey="perbelanjaan" stroke="#ef4444" name="Perbelanjaan" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
