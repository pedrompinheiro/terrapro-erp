import React, { useState } from 'react';
import { Plus, Folder, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface CostCenter {
  id: string;
  nome: string;
  codigo?: string;
  tipo?: string;
  grupo_dre?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  costCenters: CostCenter[];
  onRefresh: () => void;
  onSecurityCheck: (action: () => Promise<void>) => void;
}

const FinancialCostCenters: React.FC<Props> = ({
  isOpen,
  onClose,
  costCenters,
  onRefresh,
  onSecurityCheck,
}) => {
  const [newCostCenterName, setNewCostCenterName] = useState('');
  const [newCostCenterType, setNewCostCenterType] = useState('DESPESA_FIXA');

  const handleAddCostCenter = async () => {
    if (!newCostCenterName) {
      toast.error("Digite o nome do centro de custo");
      return;
    }

    let grupo = 'Outros';
    if (newCostCenterType === 'RECEITA') grupo = 'Receita Operacional';
    else if (newCostCenterType === 'CUSTO_DIRETO') grupo = 'Custos Diretos (CPV)';
    else if (newCostCenterType === 'DESPESA_FIXA') grupo = 'Despesas Operacionais Fixas';
    else if (newCostCenterType.includes('FINANCEIRA')) grupo = 'Resultado Financeiro';
    else if (newCostCenterType === 'INVESTIMENTO') grupo = 'CAPEX / Imobilizado';

    try {
      const { error } = await supabase.from('centros_custo').insert({
        nome: newCostCenterName,
        tipo: newCostCenterType,
        grupo_dre: grupo,
        ativo: true,
        empresa_cnpj: '00.000.000/0001-91',
        codigo: 'MANUAL'
      });

      if (error) throw error;
      toast.success("Centro de Custo criado!");
      setNewCostCenterName('');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar centro de custo");
    }
  };

  const handleDeleteCostCenter = (id: string, name: string) => {
    onSecurityCheck(async () => {
      try {
        const { error } = await supabase
          .from('centros_custo')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
        toast.success(`Centro de Custo "${name}" desativado.`);
        onRefresh();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover centro de custo");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Centros de Custo (Plano DRE)">
      <div className="space-y-6">
        {/* Aviso */}
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-400 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p>O plano de contas DRE padrao foi carregado. Voce pode adicionar novos sub-centros, mas evite remover os principais para nao quebrar relatorios.</p>
        </div>

        {/* New Cost Center Form */}
        <div className="flex gap-2 items-end">
          <div className="w-1/3">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
            <select
              value={newCostCenterType}
              onChange={e => setNewCostCenterType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500"
            >
              <option value="RECEITA">Receita</option>
              <option value="CUSTO_DIRETO">Custo Direto (CPV)</option>
              <option value="DESPESA_FIXA">Despesa Fixa</option>
              <option value="INVESTIMENTO">CAPEX / Investimento</option>
              <option value="DESPESA_FINANCEIRA">Financeiro</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome</label>
            <input
              value={newCostCenterName}
              onChange={e => setNewCostCenterName(e.target.value)}
              placeholder="Ex: Obra Shopping..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleAddCostCenter}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg transition"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-slate-900 py-2">Estrutura DRE</h4>
          {costCenters.length === 0 ? (
            <p className="text-slate-500 text-center py-4 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">Carregando plano de contas...</p>
          ) : (
            costCenters.map(cc => (
              <div key={cc.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-3 rounded-xl group hover:border-slate-700 transition">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg shrink-0 ${cc.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-500' :
                    cc.tipo?.includes('CUSTO') ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                    <Folder size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-300 text-sm truncate">
                      {cc.codigo ? <span className="text-slate-500 mr-2 font-mono">{cc.codigo}</span> : null}
                      {cc.nome}
                    </h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
                      {cc.grupo_dre || cc.tipo || 'Geral'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCostCenter(cc.id, cc.nome)}
                  className="text-slate-600 hover:text-rose-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2"
                  title="Excluir (Requer Senha Admin)"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FinancialCostCenters;
