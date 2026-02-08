
import React, { useState } from 'react';
import { Fuel, Droplets, History, TrendingUp, AlertTriangle, Plus, Save, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { useQuery } from '@tanstack/react-query';
import { fleetManagementService } from '../services/fleetService';
import { Asset } from '../types';

interface SupplyRecord {
  id: string;
  date: string;
  asset: string;
  liters: number;
  horometer: number;
  efficiency: number;
}

const FuelManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplies, setSupplies] = useState<SupplyRecord[]>([
    { id: '1', date: '22/05 08:45', asset: 'EXC-042', liters: 120, horometer: 4250, efficiency: 4.1 }
  ]);

  // Fetch Assets for Dropdown
  const { data: assets = [] } = useQuery({
    queryKey: ['fleet'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60,
  });

  // Form State
  const [formData, setFormData] = useState({
    assetId: '',
    liters: '',
    horometer: ''
  });

  const handleSave = () => {
    if (!formData.assetId || !formData.liters) return;

    const selectedAsset = assets.find(a => a.id === formData.assetId);
    const assetName = selectedAsset ? selectedAsset.name : formData.assetId;

    const newSupply: SupplyRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      asset: assetName, // Storing name for display
      liters: Number(formData.liters),
      horometer: Number(formData.horometer),
      efficiency: 0 // Calculate logic would go here
    };

    setSupplies([newSupply, ...supplies]);
    setIsModalOpen(false);
    setFormData({ assetId: '', liters: '', horometer: '' });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gestão de Combustível</h2>
          <p className="text-slate-500 mt-1">Monitoramento de tanques, abastecimentos e eficiência.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2"
        >
          <Plus size={18} />
          Registrar Abastecimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20">
                <Droplets size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tanque Principal 01</h3>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Capacidade: 5.000 L</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">3.240 L</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase">Nível Seguro</p>
            </div>
          </div>
          <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
            <div className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: '64.8%' }}></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-white tracking-tighter">64.8% DISPONÍVEL</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-600/10 text-orange-500 rounded-2xl border border-orange-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Comboio de Apoio</h3>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Placa: ABC-1234</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">240 L</p>
              <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">Nível Crítico</p>
            </div>
          </div>
          <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
            <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: '12%' }}></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-white tracking-tighter">12% DISPONÍVEL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/20">
          <History size={18} className="text-slate-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Últimos Abastecimentos (Equipamento)</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-4">Data/Hora</th>
                <th className="px-8 py-4">Equipamento</th>
                <th className="px-8 py-4">Litros</th>
                <th className="px-8 py-4">Horímetro</th>
                <th className="px-8 py-4">Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {supplies.map(supply => (
                <tr key={supply.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5 text-slate-400">{supply.date}</td>
                  <td className="px-8 py-5 font-bold text-white">{supply.asset}</td>
                  <td className="px-8 py-5 font-black text-white">{supply.liters} L</td>
                  <td className="px-8 py-5 font-mono text-xs">{supply.horometer}h</td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                      <TrendingUp size={14} /> {supply.efficiency} L/h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Supply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Abastecimento"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Equipamento / Frota</label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
            >
              <option value="" disabled>Selecione um ativo...</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.id})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Litros</label>
              <input
                type="number"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                placeholder="0.0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Horímetro Atual</label>
              <input
                type="number"
                value={formData.horometer}
                onChange={(e) => setFormData({ ...formData, horometer: e.target.value })}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <span className="font-black text-xs">$</span>
              </div>
              <h4 className="text-xs font-black uppercase text-emerald-500 tracking-widest">Integração Financeira</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Fornecedor / Posto</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                  <option>Posto Estradão</option>
                  <option>PetroDiesel Dist.</option>
                  <option>Tanque Interno (Sede)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nota Fiscal (NFe)</label>
                <input type="text" placeholder="000.000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Vencimento da Fatura</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar Registro
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default FuelManagement;
