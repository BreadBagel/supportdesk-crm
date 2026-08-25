import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Customer, Ticket } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Ticket as TicketIcon,
  X,
  Edit,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CustomersPageProps {
  onNavigateToTicketDetail: (id: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigateToTicketDetail }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected customer profile detail view
  const [selectedCustomer, setSelectedCustomer] = useState<(Customer & { tickets: Ticket[] }) | null>(null);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSelectCustomer = async (cust: Customer) => {
    try {
      setLoadingCustomerDetail(true);
      const fullCust = await api.getCustomerById(cust.id);
      setSelectedCustomer(fullCust);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch customer profile details');
    } finally {
      setLoadingCustomerDetail(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone || '');
    setFormCompany(cust.company || '');
    setFormNotes(cust.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          notes: formNotes.trim(),
        });
      } else {
        await api.createCustomer({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          notes: formNotes.trim(),
        });
      }

      setIsModalOpen(false);
      fetchCustomers();
      if (selectedCustomer && editingCustomer && selectedCustomer.id === editingCustomer.id) {
        handleSelectCustomer(editingCustomer);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this customer record?')) return;

    try {
      await api.deleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  return (
    <div id="customers-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer CRM Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isStaff
              ? 'Client CRM directory, contact profiles, and ticket history.'
              : 'Your customer account profile and registered organization overview.'}
          </p>
        </div>

        {isStaff && (
          <button
            id="add-customer-btn"
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-purple-gradient hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 border border-purple-400/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer Profile</span>
          </button>
        )}
      </div>

      {/* Grid: Search & Table vs Customer Detailed Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers Directory Column */}
        <div className={`space-y-4 ${selectedCustomer ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
            <input
              id="customer-search-input"
              type="text"
              placeholder="Search by customer name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60"
            />
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading customer profiles...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-rose-400 bg-rose-950/40">{error}</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">
                No customer records found matching your query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-purple-300 uppercase tracking-wider font-bold border-b border-purple-500/20">
                    <tr>
                      <th className="px-5 py-3.5">Customer Name</th>
                      <th className="px-5 py-3.5">Company</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Tickets</th>
                      {isStaff && <th className="px-5 py-3.5 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10 text-slate-300 font-medium">
                    {filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        id={`customer-row-${c.id}`}
                        onClick={() => handleSelectCustomer(c)}
                        className={`hover:bg-purple-950/30 cursor-pointer transition ${
                          selectedCustomer?.id === c.id ? 'bg-purple-900/40 font-bold' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="avatar-purple-ring">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-purple-300 font-extrabold flex items-center justify-center text-xs">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{c.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">Added {new Date(c.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center text-slate-300">
                            <Building2 className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                            {c.company || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4 space-y-0.5">
                          <div className="flex items-center text-slate-300">
                            <Mail className="w-3 h-3 mr-1.5 text-purple-400" />
                            {c.email}
                          </div>
                          {c.phone && (
                            <div className="flex items-center text-[10px] text-slate-500">
                              <Phone className="w-3 h-3 mr-1.5 text-slate-500" />
                              {c.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <TicketIcon className="w-3 h-3 mr-1" />
                            {c.ticketCount || 0}
                          </span>
                        </td>
                        {isStaff && (
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                id={`edit-customer-${c.id}`}
                                onClick={(e) => handleOpenEditModal(c, e)}
                                className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/50 rounded-lg transition"
                                title="Edit Customer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                id={`delete-customer-${c.id}`}
                                onClick={(e) => handleDeleteCustomer(c.id, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition"
                                title="Delete Customer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected Customer Profile Side Panel */}
        {selectedCustomer && (
          <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl p-5 space-y-5 h-fit sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
              <h2 className="text-sm font-bold text-white tracking-wide">Customer CRM Profile</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingCustomerDetail ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Loading profile...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="text-center py-2">
                  <div className="avatar-purple-ring inline-block mb-2 shadow-lg shadow-purple-500/20">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-purple-300 font-extrabold text-lg flex items-center justify-center">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base">{selectedCustomer.name}</h3>
                  <p className="text-slate-400 font-medium">{selectedCustomer.company || 'Individual Account'}</p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl space-y-2 border border-purple-500/15">
                  <div className="flex items-center text-slate-200 font-medium">
                    <Mail className="w-3.5 h-3.5 text-purple-400 mr-2" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center text-slate-200 font-medium">
                      <Phone className="w-3.5 h-3.5 text-purple-400 mr-2" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>

                {selectedCustomer.notes && (
                  <div>
                    <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block mb-1">
                      Account Notes
                    </span>
                    <p className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl text-slate-200 font-medium leading-relaxed">
                      {selectedCustomer.notes}
                    </p>
                  </div>
                )}

                {/* Associated Tickets */}
                <div className="pt-3 border-t border-purple-500/15 space-y-2">
                  <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
                    Linked Tickets ({selectedCustomer.tickets?.length || 0})
                  </span>

                  {!selectedCustomer.tickets || selectedCustomer.tickets.length === 0 ? (
                    <p className="text-slate-500 italic">No tickets associated with this customer.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedCustomer.tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onNavigateToTicketDetail(t.id)}
                          className="p-2.5 bg-slate-950/80 hover:bg-purple-950/40 rounded-xl border border-purple-500/20 cursor-pointer transition flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-bold text-purple-400 text-[11px]">{t.id}</div>
                            <div className="font-bold text-slate-200 text-xs truncate max-w-[180px]">
                              {t.subject}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Customer */}
      {isModalOpen && (
        <div id="customer-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-500/30 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <h2 className="text-lg font-bold text-white">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h2>
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

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  id="customer-form-name"
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  id="customer-form-email"
                  type="email"
                  required
                  placeholder="jane.smith@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  id="customer-form-phone"
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
                <input
                  id="customer-form-company"
                  type="text"
                  placeholder="Acme Inc."
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Notes</label>
                <textarea
                  id="customer-form-notes"
                  rows={3}
                  placeholder="Additional context regarding SLA or billing tier..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
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
                  id="submit-customer-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
