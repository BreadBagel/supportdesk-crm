import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, Users, UserCog, Building2, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'AGENT', 'CUSTOMER'],
    },
    {
      id: 'tickets',
      label: 'Support Tickets',
      icon: Ticket,
      roles: ['ADMIN', 'AGENT', 'CUSTOMER'],
    },
    {
      id: 'customers',
      label: user.role === 'CUSTOMER' ? 'My Customer Profile' : 'Customer CRM',
      icon: user.role === 'CUSTOMER' ? Building2 : Users,
      roles: ['ADMIN', 'AGENT', 'CUSTOMER'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCog,
      roles: ['ADMIN'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside id="main-sidebar" className="w-full md:w-64 glass-panel border border-purple-500/20 text-slate-300 flex-shrink-0 rounded-2xl p-4 shadow-xl">
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 uppercase tracking-widest px-3 mb-3">
          <span>Main Workspaces</span>
          <Sparkles className="w-3 h-3 text-purple-400" />
        </div>
        <nav className="space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition duration-200 ${
                  isActive
                    ? 'bg-purple-gradient text-white shadow-lg shadow-purple-600/30 font-bold border border-purple-400/40 glow-purple-sm'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
