
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, iconBg, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition-all ${onClick ? 'cursor-pointer hover:bg-slate-800/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${iconBg} rounded-xl text-white shadow-inner`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
            <svg className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{value}</h3>
    </div>
  );
};

export default StatCard;
