import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Headset, KeyRound, Mail, Sparkles, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      await demoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Failed to login via demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden animate-fade-in">
      {/* Background Animated Floating Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2.5s' }} />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-slide-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-purple-gradient rounded-2xl shadow-xl shadow-purple-500/30 mb-2 animate-pulse-glow border border-purple-400/40">
            <Headset className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-purple">
            CRM Project Example by BreadBagel
          </h1>
          <p className="text-xs text-slate-400 font-medium">Customer Relationship & Support Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Quick Demo Login Preset Buttons */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-purple-500/25 space-y-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>1-Click Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 transition transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/40 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 mb-1 text-purple-400" />
                <span className="text-[10px] font-bold">Admin</span>
              </button>
              <button
                id="demo-agent-login-btn"
                type="button"
                onClick={() => handleDemoLogin('AGENT')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-teal-950/50 hover:bg-teal-900/70 border border-teal-500/30 text-teal-200 transition transform hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/40 shadow-sm"
              >
                <UserCheck className="w-4 h-4 mb-1 text-teal-400" />
                <span className="text-[10px] font-bold">Agent</span>
              </button>
              <button
                id="demo-customer-login-btn"
                type="button"
                onClick={() => handleDemoLogin('CUSTOMER')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-950/50 hover:bg-sky-900/70 border border-sky-500/30 text-sky-200 transition transform hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-900/40 shadow-sm"
              >
                <Users className="w-4 h-4 mb-1 text-sky-400" />
                <span className="text-[10px] font-bold">Customer</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-purple-500/15" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or Sign In With Password</span>
            <div className="flex-grow border-t border-purple-500/15" />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl font-medium shadow-sm animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="admin@supportdesk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60 transition"
                />
              </div>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 border border-purple-400/30"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have a support account yet?{' '}
              <button
                id="switch-to-register-link"
                onClick={onSwitchToRegister}
                className="text-purple-400 hover:text-purple-300 font-bold underline"
              >
                Register Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
