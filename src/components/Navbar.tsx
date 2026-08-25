import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badge';
import {
  Headset,
  LogOut,
  UserCheck,
  ChevronDown,
  Sparkles,
  Cpu,
  Menu,
  X,
  LayoutDashboard,
  Ticket,
  Users,
  UserCog,
  Building2,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, demoLogin } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    setShowRoleSwitcher(false);
    await demoLogin(role);
  };

  const navItems = user
    ? [
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
          label: user.role === 'CUSTOMER' ? 'My Profile' : 'Customer CRM',
          icon: user.role === 'CUSTOMER' ? Building2 : Users,
          roles: ['ADMIN', 'AGENT', 'CUSTOMER'],
        },
        {
          id: 'users',
          label: 'User Management',
          icon: UserCog,
          roles: ['ADMIN'],
        },
      ].filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <header id="main-navbar" className="glass-panel border-b border-purple-500/20 text-slate-100 sticky top-0 z-40 shadow-2xl shadow-purple-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="bg-purple-gradient p-2 rounded-xl shadow-lg shadow-purple-500/30 animate-pulse-glow">
            <Headset className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-gradient-purple">
              CRM Project Example by BreadBagel
            </span>
            <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-mono font-semibold border border-purple-500/30 hidden lg:inline-flex">
              <Cpu className="w-3 h-3 text-purple-400 mr-1" />
              v2.0
            </span>
          </div>
        </div>

        {/* Desktop & Tablet Navigation */}
        {user && (
          <div className="flex items-center space-x-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                id="role-switcher-toggle"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center space-x-2 text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-purple-500/30 shadow-sm transition hover:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                title="Instantly switch view role for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline text-slate-400">Demo Role:</span>
                <span className="font-bold text-purple-300">{user.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleSwitcher && (
                <div
                  id="role-switcher-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-2xl backdrop-blur-xl py-2 z-50 text-xs text-slate-200 animate-slide-up"
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Instant Demo Perspective
                  </div>
                  <button
                    id="switch-to-admin"
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-purple-950/40 ${
                      user.role === 'ADMIN' ? 'bg-purple-900/40 text-purple-300 font-bold' : ''
                    }`}
                  >
                    <span>Administrator</span>
                    {user.role === 'ADMIN' && <UserCheck className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                  <button
                    id="switch-to-agent"
                    onClick={() => handleRoleSwitch('AGENT')}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-purple-950/40 ${
                      user.role === 'AGENT' ? 'bg-teal-950/40 text-teal-300 font-bold' : ''
                    }`}
                  >
                    <span>Support Agent</span>
                    {user.role === 'AGENT' && <UserCheck className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                  <button
                    id="switch-to-customer"
                    onClick={() => handleRoleSwitch('CUSTOMER')}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-purple-950/40 ${
                      user.role === 'CUSTOMER' ? 'bg-sky-950/40 text-sky-300 font-bold' : ''
                    }`}
                  >
                    <span>Customer</span>
                    {user.role === 'CUSTOMER' && <UserCheck className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="avatar-purple-ring shadow-lg shadow-purple-500/20">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-purple-300 flex items-center justify-center font-extrabold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-100">{user.name}</div>
                <RoleBadge role={user.role} />
              </div>

              <button
                id="logout-button"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition border border-transparent hover:border-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden glass-panel border-b border-purple-500/20 px-4 py-4 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
            <div className="flex items-center space-x-3">
              <div className="avatar-purple-ring">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-purple-300 font-extrabold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-white">{user.name}</div>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl font-bold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest px-2 mb-1">
              Navigation Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-purple-gradient text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
