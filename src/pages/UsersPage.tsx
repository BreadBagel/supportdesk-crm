import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { RoleBadge } from '../components/Badge';
import {
  Plus,
  Trash2,
  X,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('AGENT');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to change role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('All fields are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      await api.createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword.trim(),
        role: formRole,
      });

      setIsModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="users-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Account Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Administrator security console for user accounts, role permissions, and staff provisioning.
          </p>
        </div>

        <button
          id="add-user-btn"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-purple-gradient hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 border border-purple-400/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading user accounts...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400 bg-rose-950/40">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-purple-300 uppercase tracking-wider font-bold border-b border-purple-500/20">
                <tr>
                  <th className="px-5 py-3.5">User Profile</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-slate-300 font-medium">
                {users.map((u) => (
                  <tr key={u.id} id={`user-row-${u.id}`} className="hover:bg-purple-950/30 transition">
                    <td className="px-5 py-4 flex items-center space-x-3">
                      <div className="avatar-purple-ring">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-purple-300 font-extrabold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center text-slate-300">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <RoleBadge role={u.role} />
                        {/* Quick Role Select Dropdown */}
                        <select
                          id={`select-role-${u.id}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-slate-950 border border-purple-500/20 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="ADMIN">Administrator</option>
                          <option value="AGENT">Support Agent</option>
                          <option value="CUSTOMER">Customer</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        id={`delete-user-${u.id}`}
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Provision New User */}
      {isModalOpen && (
        <div id="user-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-500/30 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Provision User Account</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-950/80 text-rose-300 text-xs rounded-xl font-medium border border-rose-800/80">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  id="user-form-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  id="user-form-email"
                  type="email"
                  required
                  placeholder="alex.rivera@supportdesk.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password *</label>
                <input
                  id="user-form-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Role *</label>
                <select
                  id="user-form-role"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="AGENT">Support Agent</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-purple-500/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-user-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
