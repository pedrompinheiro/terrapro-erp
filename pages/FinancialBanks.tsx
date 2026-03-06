import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Modal from '../components/Modal';
import { bankService } from '../services/bankService';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const FinancialBanks: React.FC<Props> = ({ isOpen, onClose, onRefresh }) => {
  const [newBank, setNewBank] = useState({
    banco_nome: '',
    agencia: '',
    conta: '',
    tipo_conta: 'CONTA_CORRENTE',
    saldo_atual: 0,
    padrao: false
  });

  const handleSaveBank = async () => {
    if (!newBank.banco_nome || !newBank.agencia || !newBank.conta) {
      toast.error("Preencha os dados obrigatorios do banco");
      return;
    }

    try {
      await bankService.criar({
        ...newBank,
        ativa: true,
        banco_codigo: '000'
      });
      toast.success("Conta bancaria adicionada!");
      onClose();
      onRefresh();
      setNewBank({
        banco_nome: '',
        agencia: '',
        conta: '',
        tipo_conta: 'CONTA_CORRENTE',
        saldo_atual: 0,
        padrao: false
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar conta bancaria");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Conta Bancaria">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome do Banco / Caixa</label>
          <input
            value={newBank.banco_nome}
            onChange={e => setNewBank(prev => ({ ...prev, banco_nome: e.target.value }))}
            placeholder="Ex: Banco do Brasil, Nubank, Caixa Pequeno"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Agencia</label>
            <input
              value={newBank.agencia}
              onChange={e => setNewBank(prev => ({ ...prev, agencia: e.target.value }))}
              placeholder="0000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta</label>
            <input
              value={newBank.conta}
              onChange={e => setNewBank(prev => ({ ...prev, conta: e.target.value }))}
              placeholder="00000-0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
            <select
              value={newBank.tipo_conta}
              onChange={e => setNewBank(prev => ({ ...prev, tipo_conta: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="CONTA_CORRENTE">Conta Corrente</option>
              <option value="POUPANCA">Poupanca</option>
              <option value="CAIXA_FISICO">Caixa Fisico</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Saldo Inicial (R$)</label>
            <input
              type="number"
              value={newBank.saldo_atual}
              onChange={e => setNewBank(prev => ({ ...prev, saldo_atual: parseFloat(e.target.value) }))}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={newBank.padrao}
            onChange={e => setNewBank(prev => ({ ...prev, padrao: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          <label className="text-xs text-slate-300">Definir como conta padrao</label>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveBank}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Save size={20} /> Salvar Conta
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FinancialBanks;
