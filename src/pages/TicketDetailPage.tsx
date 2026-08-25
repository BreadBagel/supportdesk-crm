import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Ticket, TicketComment, TicketPriority, TicketStatus, User } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge, RoleBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  User as UserIcon,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface TicketDetailPageProps {
  ticketId: string;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ ticketId, onBack }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Comment state
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Status & Priority update state
  const [updating, setUpdating] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTicketById(ticketId);
      setTicket(data);

      const cmnts = await api.getComments(ticketId);
      setComments(cmnts);

      if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
        const usersList = await api.getUsers();
        setAgents(usersList.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setPostingComment(true);
      const comment = await api.addComment(ticketId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      // Refresh ticket to update timestamps
      const updated = await api.getTicketById(ticketId);
      setTicket(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      setUpdating(true);
      const updated = await api.updateTicket(ticket.id, { status: newStatus });
      setTicket(updated);
      const cmnts = await api.getComments(ticketId);
      setComments(cmnts);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePriority = async (newPriority: TicketPriority) => {
    if (!ticket) return;
    try {
      setUpdating(true);
      const updated = await api.updateTicket(ticket.id, { priority: newPriority });
      setTicket(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update priority');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!ticket) return;
    try {
      setUpdating(true);
      const updated = await api.updateTicket(ticket.id, { assignedAgentId: agentId || null });
      setTicket(updated);
      const cmnts = await api.getComments(ticketId);
      setComments(cmnts);
    } catch (err: any) {
      alert(err.message || 'Failed to reassign agent');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!confirm('Are you sure you want to permanently delete this ticket?')) return;
    try {
      await api.deleteTicket(ticketId);
      onBack();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  if (loading) {
    return (
      <div id="ticket-detail-loading" className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-purple-500/20">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading ticket details...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div id="ticket-detail-error" className="glass-panel p-8 text-center space-y-4 rounded-2xl border border-rose-800/40 bg-rose-950/30">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
        <p className="text-rose-300 font-bold text-sm">{error || 'Ticket not found'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-purple-gradient text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30"
        >
          Back to Tickets List
        </button>
      </div>
    );
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  return (
    <div id="ticket-detail-page" className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-tickets-btn"
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-purple-300 font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        {isStaff && (
          <button
            id="detail-delete-ticket-btn"
            onClick={handleDeleteTicket}
            className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 px-3.5 py-1.5 rounded-xl border border-rose-800/40 transition font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Ticket</span>
          </button>
        )}
      </div>

      {/* Ticket Main Header Card */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl p-6 space-y-6">
        {/* Ticket Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-purple-500/15 pb-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="font-mono font-extrabold text-purple-400 text-lg">{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{ticket.subject}</h1>
          </div>

          {/* Quick Resolution Button */}
          {isStaff && ticket.status !== 'RESOLVED' && (
            <button
              id="quick-resolve-btn"
              onClick={() => handleUpdateStatus('RESOLVED')}
              disabled={updating}
              className="flex items-center space-x-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mark as Resolved</span>
            </button>
          )}
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Issue Description</span>
              </h2>
              <div className="p-4 bg-slate-950/80 rounded-xl border border-purple-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-medium shadow-inner">
                {ticket.description}
              </div>
            </div>

            {/* Staff Controls (Status & Priority & Assignment) */}
            {isStaff && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-500/20 space-y-3">
                <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Ticket Management Controls
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Status</label>
                    <select
                      id="update-status-select"
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                      disabled={updating}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PENDING">Pending</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Priority</label>
                    <select
                      id="update-priority-select"
                      value={ticket.priority}
                      onChange={(e) => handleUpdatePriority(e.target.value as TicketPriority)}
                      disabled={updating}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Assigned Agent</label>
                    <select
                      id="update-agent-select"
                      value={ticket.assignedAgentId || ''}
                      onChange={(e) => handleAssignAgent(e.target.value)}
                      disabled={updating}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Metadata Sidebar Column (GitHub style) */}
          <div className="space-y-4 text-xs font-medium bg-slate-950/80 p-4 rounded-xl border border-purple-500/20">
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-2">
                Customer Information
              </span>
              <div className="flex items-center space-x-2 text-slate-100 font-bold">
                <UserIcon className="w-4 h-4 text-purple-400" />
                <span>{ticket.customerName}</span>
              </div>
              {ticket.customerCompany && (
                <div className="flex items-center space-x-2 text-slate-400 mt-1 pl-6">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ticket.customerCompany}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-purple-500/15">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-2">
                Assigned Support Agent
              </span>
              <div className="flex items-center space-x-2 text-slate-100 font-bold">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span>{ticket.assignedAgentName || 'Unassigned'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-500/15 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Created
                </span>
                <span className="font-semibold text-slate-200">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Last Updated
                </span>
                <span className="font-semibold text-slate-200">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claude-Style Chat & Discussion Stream */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 shadow-xl p-6 space-y-6">
        <div className="flex items-center space-x-2 border-b border-purple-500/15 pb-4">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Activity Log & Discussion</h2>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/30">
            {comments.length}
          </span>
        </div>

        {/* Timeline List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No comments or system updates recorded yet.</p>
          ) : (
            comments.map((cmnt) => {
              const isSelf = cmnt.userId === user?.id;
              return (
                <div
                  key={cmnt.id}
                  id={`comment-${cmnt.id}`}
                  className={`p-4 rounded-2xl border transition ${
                    isSelf
                      ? 'bg-purple-950/40 border-purple-500/30'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="avatar-purple-ring">
                        <div className="w-5 h-5 rounded-full bg-slate-900 text-purple-300 flex items-center justify-center text-[10px] font-bold">
                          {cmnt.userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span className="font-bold text-xs text-white">{cmnt.userName}</span>
                      <RoleBadge role={cmnt.userRole} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(cmnt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium pl-7 whitespace-pre-line">
                    {cmnt.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Post Comment Input */}
        <form onSubmit={handleAddComment} className="pt-4 border-t border-purple-500/15 space-y-3">
          <label className="block text-xs font-bold text-purple-300">Add Response or Internal Note</label>
          <div className="flex items-start space-x-3">
            <textarea
              id="comment-input"
              rows={3}
              required
              placeholder="Type your reply here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 p-3.5 bg-slate-950 border border-purple-500/20 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60 font-medium"
            />
            <button
              id="submit-comment-btn"
              type="submit"
              disabled={postingComment || !newComment.trim()}
              className="px-5 py-3 bg-purple-gradient hover:opacity-90 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 border border-purple-400/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
