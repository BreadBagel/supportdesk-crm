import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Ticket, TicketPriority, TicketStatus, TicketCategory, Customer, User } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Eye,
  MessageSquare,
  X,
  Kanban,
  Table as TableIcon,
  ChevronRight,
  Clock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface TicketsPageProps {
  onNavigateToDetail: (id: string) => void;
  openCreateModalDirectly?: boolean;
  onCloseCreateModalDirectly?: () => void;
}

const KANBAN_COLUMNS: { status: TicketStatus; label: string; dot: string; glow: string }[] = [
  { status: 'OPEN', label: 'Open Issues', dot: 'bg-cyan-400', glow: 'border-cyan-500/30 shadow-cyan-500/10' },
  { status: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-amber-400', glow: 'border-amber-500/30 shadow-amber-500/10' },
  { status: 'PENDING', label: 'Pending Review', dot: 'bg-purple-400', glow: 'border-purple-500/40 shadow-purple-500/20' },
  { status: 'RESOLVED', label: 'Resolved', dot: 'bg-emerald-400', glow: 'border-emerald-500/30 shadow-emerald-500/10' },
  { status: 'CLOSED', label: 'Closed Archive', dot: 'bg-slate-500', glow: 'border-slate-700/60' },
];

export const TicketsPage: React.FC<TicketsPageProps> = ({
  onNavigateToDetail,
  openCreateModalDirectly = false,
  onCloseCreateModalDirectly,
}) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View mode state (Kanban vs Table)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(openCreateModalDirectly);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [agentsList, setAgentsList] = useState<User[]>([]);

  // Create Form State
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<TicketPriority>('MEDIUM');
  const [formCategory, setFormCategory] = useState<TicketCategory>('TECHNICAL');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formAssignedAgentId, setFormAssignedAgentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (openCreateModalDirectly) {
      setIsCreateModalOpen(true);
    }
  }, [openCreateModalDirectly]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedPriority !== 'ALL') params.priority = selectedPriority;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;

      const data = await api.getTickets(params);
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [searchQuery, selectedStatus, selectedPriority, selectedCategory]);

  const loadModalData = async () => {
    if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
      try {
        const custs = await api.getCustomers();
        setCustomersList(custs);
        if (custs.length > 0 && !formCustomerId) {
          setFormCustomerId(custs[0].id);
        }

        const users = await api.getUsers();
        const agents = users.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN');
        setAgentsList(agents);
      } catch (err) {
        console.error('Failed to load customers/agents for create modal', err);
      }
    }
  };

  const handleOpenCreateModal = () => {
    loadModalData();
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormSubject('');
    setFormDescription('');
    setFormError(null);
    if (onCloseCreateModalDirectly) {
      onCloseCreateModalDirectly();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) {
      setFormError('Subject and Description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      await api.createTicket({
        subject: formSubject.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        category: formCategory,
        customerId: formCustomerId || undefined,
        assignedAgentId: formAssignedAgentId || null,
      });

      handleCloseCreateModal();
      fetchTickets();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await api.deleteTicket(id);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  const handleQuickStatusChange = async (ticketId: string, nextStatus: TicketStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateTicket(ticketId, { status: nextStatus });
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  return (
    <div id="tickets-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Support Tickets</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {tickets.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'CUSTOMER'
              ? 'View, track, and manage your technical support requests.'
              : 'Kanban & list controls for customer service dispatch and issue tracking.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle Switch (Kanban vs Table) */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-purple-500/20 flex items-center space-x-1">
            <button
              id="switch-view-kanban"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban'
                  ? 'bg-purple-gradient text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              id="switch-view-table"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-purple-gradient text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            id="create-ticket-btn"
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-purple-gradient hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 border border-purple-400/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Futuristic Command Palette Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* GitHub / Claude Command-Style Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
            <input
              id="ticket-search-input"
              type="text"
              placeholder="Search tickets by ID, subject, customer, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-purple-500/20 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60"
            />
          </div>

          {/* Priority & Category Dropdowns */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <select
              id="ticket-priority-filter"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-purple-500/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>

            <select
              id="ticket-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-purple-500/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="ALL">All Categories</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BILLING">Billing</option>
              <option value="ACCOUNT">Account</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 border-t border-purple-500/10 pt-3 overflow-x-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              id={`ticket-status-tab-${st.toLowerCase()}`}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area: KANBAN BOARD vs TABLE */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-purple-500/20">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading workspace tickets...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-rose-400 bg-rose-950/40 rounded-2xl border border-rose-800/40">
          {error}
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div id="kanban-board" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const columnTickets = tickets.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                id={`kanban-col-${col.status.toLowerCase()}`}
                className="glass-panel rounded-2xl p-3 border border-purple-500/20 flex flex-col min-h-[500px] bg-slate-950/60"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/10 px-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h2 className="font-bold text-xs text-slate-200 tracking-wide">{col.label}</h2>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-slate-900 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Column Tickets Container */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                  {columnTickets.length === 0 ? (
                    <div className="p-6 text-center text-slate-600 italic text-[11px] rounded-xl border border-dashed border-slate-800/80">
                      No {col.label.toLowerCase()} tickets
                    </div>
                  ) : (
                    columnTickets.map((t) => (
                      <div
                        key={t.id}
                        id={`kanban-card-${t.id}`}
                        onClick={() => onNavigateToDetail(t.id)}
                        className="glass-card p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/40 cursor-pointer transition duration-200 group space-y-3"
                      >
                        {/* Card Top: ID & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-purple-400 text-xs tracking-wider">
                            {t.id}
                          </span>
                          <PriorityBadge priority={t.priority} />
                        </div>

                        {/* Card Subject */}
                        <h3 className="font-bold text-xs text-slate-100 line-clamp-2 group-hover:text-purple-300 transition">
                          {t.subject}
                        </h3>

                        {/* Customer & Category */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-purple-500/10 text-[11px]">
                          <span className="text-slate-400 truncate max-w-[110px]" title={t.customerName}>
                            {t.customerName}
                          </span>
                          <CategoryBadge category={t.category} />
                        </div>

                        {/* Card Footer: Agent Avatar & Comments */}
                        <div className="flex items-center justify-between pt-2 border-t border-purple-500/10 text-[10px] text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            {t.assignedAgentName ? (
                              <div className="avatar-purple-ring" title={`Assigned: ${t.assignedAgentName}`}>
                                <div className="w-4 h-4 rounded-full bg-slate-900 text-purple-300 font-bold flex items-center justify-center text-[9px]">
                                  {t.assignedAgentName.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">Unassigned</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="flex items-center text-slate-400">
                              <MessageSquare className="w-3 h-3 mr-1 text-purple-400" />
                              {t.commentsCount || 0}
                            </span>
                            <button
                              onClick={(e) => handleDeleteTicket(t.id, e)}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                              title="Delete Ticket"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GITHUB-STYLE TABLE VIEW */
        <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Search className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="font-bold text-slate-300">No support tickets match your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-purple-300 uppercase tracking-wider font-bold border-b border-purple-500/20">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Subject</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Assigned Agent</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 text-slate-300 font-medium">
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      id={`ticket-row-${t.id}`}
                      onClick={() => onNavigateToDetail(t.id)}
                      className="hover:bg-purple-950/30 cursor-pointer transition"
                    >
                      <td className="px-5 py-4 font-mono font-extrabold text-purple-400">{t.id}</td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-bold text-slate-100 truncate">{t.subject}</div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1 text-purple-400" />
                            {t.commentsCount || 0} comments
                          </span>
                          <span>•</span>
                          <span>Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-200">{t.customerName}</div>
                        <div className="text-[10px] text-slate-500">{t.customerCompany}</div>
                      </td>
                      <td className="px-5 py-4">
                        <CategoryBadge category={t.category} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-5 py-4">
                        {t.assignedAgentName ? (
                          <span className="font-semibold text-slate-200">{t.assignedAgentName}</span>
                        ) : (
                          <span className="text-slate-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            id={`view-ticket-${t.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToDetail(t.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-ticket-${t.id}`}
                            onClick={(e) => handleDeleteTicket(t.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog: Create Support Ticket */}
      {isCreateModalOpen && (
        <div id="create-ticket-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-purple-500/30 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Create New Support Ticket</h2>
              </div>
              <button
                id="close-ticket-modal-btn"
                onClick={handleCloseCreateModal}
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
                <label className="block text-slate-300 font-semibold mb-1">Subject / Issue Title *</label>
                <input
                  id="ticket-form-subject"
                  type="text"
                  required
                  placeholder="e.g., Unable to process credit card payment on checkout"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    id="ticket-form-priority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TicketPriority)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    id="ticket-form-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="BILLING">Billing</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="FEATURE_REQUEST">Feature Request</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Customer</label>
                    <select
                      id="ticket-form-customer"
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      {customersList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.company || 'Individual'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Assigned Agent</label>
                    <select
                      id="ticket-form-agent"
                      value={formAssignedAgentId}
                      onChange={(e) => setFormAssignedAgentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="">Unassigned</option>
                      {agentsList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Description *</label>
                <textarea
                  id="ticket-form-description"
                  required
                  rows={4}
                  placeholder="Provide step-by-step details of the issue, error logs, and expected behavior..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-purple-500/10">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-ticket-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
