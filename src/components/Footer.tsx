import React from 'react';
import { Headset, Shield, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-purple-500/20 text-slate-400 py-6 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="bg-purple-gradient p-1.5 rounded-lg shadow-md shadow-purple-500/20">
            <Headset className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-200">SupportDesk CRM</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Enterprise Ticket Dispatch Platform</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px] font-medium text-slate-400">
          <span className="flex items-center">
            <Cpu className="w-3.5 h-3.5 mr-1 text-purple-400" /> System Operational
          </span>
          <span className="flex items-center">
            <Shield className="w-3.5 h-3.5 mr-1 text-teal-400" /> End-to-End Encrypted
          </span>
          <span className="hidden sm:inline-flex items-center text-slate-500">
            Built with <Heart className="w-3 h-3 mx-1 text-rose-500 fill-rose-500" /> for Customer Support Excellence
          </span>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          © {new Date().getFullYear()} SupportDesk Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
