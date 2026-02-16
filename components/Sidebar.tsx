
import React from 'react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  onLogout: () => void;
}

import { NavLink } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { hasPermission, loading } = usePermission();

  const groupedItems = NAV_ITEMS.filter(item => {
    // Se não tiver slug definido, mostra por padrão (Dashboard, etc)
    if (!item.slug) return true;
    return hasPermission(item.slug);
  }).reduce((acc: any, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-950 flex flex-col h-screen fixed z-50">
      <div className="p-8 h-36 flex items-center justify-start border-b border-slate-900 overflow-hidden">
        <Logo size="sm" className="-ml-12" />
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        {Object.entries(groupedItems).map(([group, items]: [string, any]) => (
          <div key={group} className="mb-8">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-3 mb-4">{group}</h3>
            <div className="space-y-1.5">
              {items.map((item: any) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 transition-all border-l-4 ${isActive
                    ? 'bg-slate-900/50 border-[#007a33] text-white shadow-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                    }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={isActive ? 'text-[#007a33]' : ''}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter italic">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-900 bg-slate-950 space-y-3">
        {BOTTOM_NAV_ITEMS.map((item: any) => (
          item.path ? (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-2 transition-all ${isActive ? 'text-white' : 'text-slate-500 hover:text-white'}`}
            >
              {item.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ) : (
            <button
              key={item.id}
              onClick={item.id === 'logout' ? onLogout : undefined}
              className={`w-full flex items-center gap-4 px-4 py-2 text-slate-500 hover:text-white transition-all ${item.color || ''}`}
            >
              {item.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          )
        ))}

        <div className="mt-4 flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
          <div className="w-12 h-12 bg-slate-800 border-2 border-[#007a33] flex items-center justify-center overflow-hidden rounded-sm">
            <img src="https://picsum.photos/seed/terra-pro/100" alt="Avatar" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-white truncate uppercase italic tracking-tighter">DIRETOR TÉCNICO</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#007a33] rounded-full animate-pulse"></span>
              <p className="text-[9px] text-[#007a33] font-black uppercase tracking-widest">SISTEMA ONLINE</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
