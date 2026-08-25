import React from 'react';
import { TicketPriority, TicketStatus, UserRole, TicketCategory } from '../types';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<TicketStatus, { bg: string; dot: string; label: string }> = {
    OPEN: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10',
      dot: 'bg-cyan-400 shadow-cyan-400/50 shadow-sm',
      label: 'Open',
    },
    IN_PROGRESS: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10',
      dot: 'bg-amber-400 shadow-amber-400/50 shadow-sm',
      label: 'In Progress',
    },
    PENDING: {
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-purple-500/20',
      dot: 'bg-purple-400 shadow-purple-400/50 shadow-sm',
      label: 'Pending',
    },
    RESOLVED: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
      dot: 'bg-emerald-400 shadow-emerald-400/50 shadow-sm',
      label: 'Resolved',
    },
    CLOSED: {
      bg: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
      dot: 'bg-slate-500',
      label: 'Closed',
    },
  };

  const current = styles[status] || styles.OPEN;

  return (
    <span
      id={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-sm ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const styles: Record<TicketPriority, { bg: string; label: string }> = {
    LOW: {
      bg: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
      label: 'High',
    },
    URGENT: {
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold shadow-lg shadow-rose-500/20 animate-pulse',
      label: 'Urgent',
    },
  };

  const current = styles[priority] || styles.MEDIUM;

  return (
    <span
      id={`priority-badge-${priority.toLowerCase()}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${current.bg}`}
    >
      {current.label}
    </span>
  );
};

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const styles: Record<UserRole, { bg: string; label: string }> = {
    ADMIN: { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20', label: 'Admin' },
    AGENT: { bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40', label: 'Agent' },
    CUSTOMER: { bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40', label: 'Customer' },
  };

  const current = styles[role] || styles.CUSTOMER;

  return (
    <span
      id={`role-badge-${role.toLowerCase()}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${current.bg}`}
    >
      {current.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: TicketCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const labels: Record<TicketCategory, string> = {
    TECHNICAL: 'Technical',
    BILLING: 'Billing',
    ACCOUNT: 'Account',
    FEATURE_REQUEST: 'Feature Request',
    GENERAL: 'General',
  };

  return (
    <span
      id={`category-badge-${category.toLowerCase()}`}
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-purple-200 border border-purple-500/20"
    >
      {labels[category] || category}
    </span>
  );
};
