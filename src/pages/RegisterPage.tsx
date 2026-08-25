import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Headset, Mail, KeyRound, User, Building2, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setLoading(true);
      setError(null);
      await register({ name, email, password, company, phone });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-page" className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden animate-fade-in">
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
          <p className="text-xs text-slate-400 font-medium">Create Support Portal Account</p>
        </div>

        {/* Register Card */}
        <div className="glass-panel border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl font-medium shadow-sm animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  id="register-name-input"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  id="register-email-input"
                  type="email"
                  required
                  placeholder="jane.smith@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  id="register-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Org</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                  <input
                    id="register-company-input"
                    type="text"
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                  <input
                    id="register-phone-input"
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-500/20 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                </div>
              </div>
            </div>

            <button
              id="submit-register-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 border border-purple-400/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-purple-500/15">
            <button
              id="switch-to-login-link"
              onClick={onSwitchToLogin}
              className="text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Already registered? Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
