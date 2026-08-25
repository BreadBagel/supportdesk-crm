import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorClass?: string;
  bgClass?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  icon: Icon,
  colorClass = 'text-purple-400',
  bgClass = 'bg-purple-500/10',
  subtitle,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`glass-panel-interactive rounded-2xl p-5 border border-purple-500/20 shadow-xl ${
        onClick ? 'cursor-pointer hover:border-purple-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border border-purple-500/20 ${bgClass} ${colorClass} shadow-lg shadow-purple-950/40`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
