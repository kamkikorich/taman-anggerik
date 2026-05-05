'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, Check, X, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'bendahari',
  });
  const [editForm, setEditForm] = useState<any>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add user');
      }

      setSuccess(`Pengguna "${data.name}" berjaya ditambah!`);
      setFormData({ name: '', email: '', password: '', role: 'bendahari' });
      setShowAddForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess(`Pengguna "${data.name}" berjaya dikemaskini!`);
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Adakah anda pasti mahu memadam pengguna "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess(`Pengguna "${name}" berjaya dipadam!`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Memuatkan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Pengurusan Pengguna</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Pengguna Baru</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nama penuh"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="email@waju.my"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Minimum 6 aksara"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peranan</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="bendahari">Bendahari</option>
                  <option value="pengerusi">Pengerusi</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table - Desktop */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Peranan</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {editingId === user.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-2 py-1 border rounded text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === user.id ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="px-2 py-1 border rounded text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{user.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === user.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="bendahari">Bendahari</option>
                        <option value="pengerusi">Pengerusi</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'pengerusi'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'pengerusi' ? 'Pengerusi' : 'Bendahari'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === user.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => saveEdit(user.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => startEdit(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y">
          {users.map((user) => (
            <div key={user.id} className="p-4">
              {editingId === user.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Nama"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Email"
                  />
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="bendahari">Bendahari</option>
                    <option value="pengerusi">Pengerusi</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(user.id)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2 bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'pengerusi'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'pengerusi' ? 'Pengerusi' : 'Bendahari'}
                    </span>
                    <button
                      onClick={() => startEdit(user)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Tiada pengguna dijumpai
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
