
import React, { useState } from 'react';
import { FileCheck, Receipt, ClipboardList, Send, FileWarning, Search, Save } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const measurements = [
  { id: 'MED-2024-001', project: 'Rodovia BR-101 Trecho Sul', period: '01/05 - 15/05', amount: 85400.00, status: 'AUTHORIZED', nf: '1542' },
  { id: 'MED-2024-002', project: 'Loteamento Jardim Europa', period: '01/05 - 15/05', amount: 32100.00, status: 'PROCESSING', nf: '-' },
  { id: 'MED-2024-003', project: 'Condomínio Serra Azul', period: '15/04 - 30/04', amount: 12400.00, status: 'REJECTED', nf: '1538' },
];

const Billing: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Faturamento e Medições</h2>
          <p className="text-slate-500 mt-1">Transformação de produção em receita e gestão de NF-e.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all">
            Importar Produção
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Send size={18} />
            Nova Medição
          </button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
        <div className="bg-amber-500 p-2 rounded-lg text-white"><FileWarning size={20} /></div>
        <div>
          <h4 className="font-bold text-amber-500 text-sm">Módulo em Desenvolvimento</h4>
          <p className="text-xs text-amber-200/70">Este painel exibe dados de demonstração. A integração real com a SEFAZ e os lançamentos automáticos no Financeiro estarão disponíveis na próxima atualização.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Medido (Mês)"
          value="R$ 130.240,00"
          trend="8.4%"
          trendUp={true}
          icon={<ClipboardList size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="NF-e Emitidas"
          value="R$ 98.140,00"
          trend="22%"
          trendUp={true}
          icon={<Receipt size={24} />}
          iconBg="bg-emerald-600"
        />
        <StatCard
          title="Pendência de Medição"
          value="12 Projetos"
          trend="Crítico"
          trendUp={false}
          icon={<FileWarning size={24} />}
          iconBg="bg-orange-600"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Relatório de Medições Ativas</h3>
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 w-full max-w-xs">
            <Search size={16} className="text-slate-500" />
            <input placeholder="Filtrar por projeto..." className="bg-transparent text-xs font-bold text-white outline-none w-full" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-5">Cód. Medição</th>
                <th className="px-8 py-5">Projeto / Obra</th>
                <th className="px-8 py-5">Período</th>
                <th className="px-8 py-5">Valor Bruto</th>
                <th className="px-8 py-5">NF-e</th>
                <th className="px-8 py-5 text-center">Status Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {measurements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">{m.id}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">{m.project}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Contrato Global 2024</p>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-300 font-medium">{m.period}</td>
                  <td className="px-8 py-6 font-black text-white text-sm">R$ {m.amount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-bold">{m.nf}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 ${m.status === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-500' :
                        m.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'AUTHORIZED' ? 'bg-emerald-500' :
                          m.status === 'PROCESSING' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`} />
                        {m.status === 'AUTHORIZED' ? 'Autorizada' :
                          m.status === 'PROCESSING' ? 'Em Processamento' : 'Rejeitada SEFAZ'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Medição"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Projeto / Obra</label>
            <input
              placeholder="Ex: Rodovia BR-163 - Trecho Norte"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Período de Medição</label>
            <input
              placeholder="Ex: 01/06 a 15/06"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Valor Medido (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Centro de Custo</label>
              <input
                placeholder="Ex: CC-2024.11"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Criar Medição
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Billing;
