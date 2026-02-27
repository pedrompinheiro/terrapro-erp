import React, { useState } from 'react';
import { ClipboardCheck, BarChart3, Building2, Users } from 'lucide-react';
import DashboardTab from '../components/integration/DashboardTab';
import ClientesTab from '../components/integration/ClientesTab';
import FuncionariosTab from '../components/integration/FuncionariosTab';

type Tab = 'dashboard' | 'clientes' | 'funcionarios';

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { id: 'clientes' as Tab, label: 'Clientes', icon: <Building2 size={16} /> },
    { id: 'funcionarios' as Tab, label: 'Funcionários', icon: <Users size={16} /> },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <ClipboardCheck className="text-[#007a33]" size={32} />
          Integrações & Habilitações
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Controle de documentação exigida por clientes / unidades</p>
      </div>

      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-[#007a33] text-white shadow-lg'
                : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'clientes' && <ClientesTab />}
      {activeTab === 'funcionarios' && <FuncionariosTab />}
    </div>
  );
};

export default Integrations;
