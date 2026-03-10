import React, { useState } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { bungeService } from '../../services/bungeService';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const NovoClienteModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    client_name: '',
    cnpj: '',
    contract_number: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const handleSubmit = async () => {
    if (!form.client_name.trim()) { toast.error('Informe o nome do cliente'); return; }
    if (!form.cnpj.trim()) { toast.error('Informe o CNPJ'); return; }
    if (!form.contract_number.trim()) { toast.error('Informe o número do contrato'); return; }
    if (!form.start_date) { toast.error('Informe a data de início'); return; }

    setSaving(true);
    try {
      await bungeService.criarContrato({
        client_name: form.client_name.trim(),
        cnpj: form.cnpj.trim(),
        contract_number: form.contract_number.trim(),
        start_date: form.start_date,
        end_date: form.end_date || null,
        notes: form.notes.trim() || null,
      });
      toast.success('Cliente cadastrado com sucesso!');
      setForm({
        client_name: '',
        cnpj: '',
        contract_number: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar cliente');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Novo Cliente</h3>
              <p className="text-xs text-slate-500">Cadastrar contrato de faturamento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Nome do Cliente */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Cliente *</label>
            <input
              type="text"
              value={form.client_name}
              onChange={(e) => handleChange('client_name', e.target.value)}
              placeholder="Ex: Empresa Exemplo Ltda."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
              autoFocus
            />
          </div>

          {/* CNPJ */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNPJ *</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Número do Contrato */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contrato / Referência *</label>
            <input
              type="text"
              value={form.contract_number}
              onChange={(e) => handleChange('contract_number', e.target.value)}
              placeholder="Ex: Contrato 001/2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Início *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Fim</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações sobre o contrato..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none placeholder:text-slate-600 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Cadastrar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovoClienteModal;
