import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, TicketPriority } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Tag,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigateToTickets: () => void;
  onNavigateToTicketDetail: (id: string) => void;
  onNavigateToCustomers: () => void;
  onOpenCreateTicketModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToTickets,
  onNavigateToTicketDetail,
  onNavigateToCustomers,
  onOpenCreateTicketModal,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div id="dashboard-loading" className="p-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading CRM analytics & tickets...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div id="dashboard-error" className="glass-panel p-8 text-center text-rose-400 rounded-2xl border border-rose-800/40">
        <p className="font-semibold">{error || 'Failed to load analytics'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-purple-gradient text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusProgress = [
    { label: 'Open', count: stats.openTickets, color: 'bg-cyan-400' },
    { label: 'In Progress', count: stats.inProgressTickets, color: 'bg-amber-400' },
    { label: 'Pending', count: stats.pendingTickets, color: 'bg-purple-400' },
    { label: 'Resolved', count: stats.resolvedTickets, color: 'bg-emerald-400' },
    { label: 'Closed', count: stats.closedTickets, color: 'bg-slate-500' },
  ];

  return (
    <div id="dashboard-page" className="space-y-6">
      {/* Futuristic Hero Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 text-white relative overflow-hidden shadow-2xl shadow-purple-950/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-gradient-purple">
                Welcome back, {user?.name}!
              </h1>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              {user?.role === 'CUSTOMER'
                ? 'Track, submit, and manage technical support tickets.'
                : 'Futuristic SupportDesk CRM telemetry & real-time ticket dispatch.'}
            </p>
          </div>
          <button
            id="dashboard-new-ticket-btn"
            onClick={onOpenCreateTicketModal}
            className="flex items-center space-x-2 bg-purple-gradient hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 border border-purple-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-tickets"
          title="Total Tickets"
          value={stats.totalTickets}
          icon={Ticket}
          colorClass="text-purple-400"
          bgClass="bg-purple-500/10"
          onClick={onNavigateToTickets}
        />
        <StatCard
          id="stat-open-tickets"
          title="Open Issues"
          value={stats.openTickets}
          icon={Clock}
          colorClass="text-cyan-400"
          bgClass="bg-cyan-500/10"
          onClick={onNavigateToTickets}
        />
        <StatCard
          id="stat-resolved-tickets"
          title="Resolved"
          value={stats.resolvedTickets}
          icon={CheckCircle2}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-500/10"
          onClick={onNavigateToTickets}
        />
        <StatCard
          id="stat-urgent-tickets"
          title="Urgent Needs"
          value={stats.urgentTickets}
          icon={AlertTriangle}
          colorClass="text-rose-400"
          bgClass="bg-rose-500/10"
          subtitle="Requires attention"
          onClick={onNavigateToTickets}
        />
      </div>

      {/* Status Breakdown & Priority Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Lifecycle Progress Bar */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Ticket Status Distribution</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{stats.totalTickets} total</span>
          </div>

          {/* Visual Stacked Progress Bar */}
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-purple-500/20 p-0.5">
            {statusProgress.map((sp) => {
              const pct = stats.totalTickets ? (sp.count / stats.totalTickets) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={sp.label}
                  className={`${sp.color} h-full transition-all duration-300 rounded-full`}
                  style={{ width: `${pct}%` }}
                  title={`${sp.label}: ${sp.count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {statusProgress.map((sp) => (
              <div key={sp.label} className="bg-slate-950/80 p-2.5 rounded-xl border border-purple-500/15 text-center">
                <div className="flex items-center justify-center space-x-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${sp.color}`} />
                  <span className="text-xs text-slate-400 font-medium">{sp.label}</span>
                </div>
                <div className="text-lg font-extrabold text-white">{sp.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Priority Tally</h2>
          </div>

          <div className="space-y-2.5">
            {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]).map((p) => {
              const count = stats.ticketsByPriority[p] || 0;
              const color =
                p === 'URGENT'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : p === 'HIGH'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                  : p === 'MEDIUM'
                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                  : 'text-slate-400 bg-slate-800/80 border-slate-700/60';
              return (
                <div key={p} className={`flex items-center justify-between p-3 rounded-xl border ${color}`}>
                  <span className="text-xs font-bold tracking-wide">{p}</span>
                  <span className="text-sm font-extrabold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Recently Updated Tickets</h2>
          </div>
          <button
            id="view-all-tickets-btn"
            onClick={onNavigateToTickets}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-purple-300 uppercase tracking-wider font-bold border-b border-purple-500/20">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Assigned Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-slate-300 font-medium">
              {stats.recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-500">
                    No recent activity.
                  </td>
                </tr>
              ) : (
                stats.recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    id={`recent-ticket-row-${ticket.id}`}
                    onClick={() => onNavigateToTicketDetail(ticket.id)}
                    className="hover:bg-purple-950/30 cursor-pointer transition"
                  >
                    <td className="px-5 py-3.5 font-mono font-extrabold text-purple-400">{ticket.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-100 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-200">{ticket.customerName}</div>
                      <div className="text-[10px] text-slate-500">{ticket.customerCompany}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {ticket.assignedAgentName || <span className="text-slate-600 italic">Unassigned</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
