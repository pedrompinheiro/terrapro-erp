
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAll } from '../lib/supabaseUtils';
import { fleetManagementService } from '../services/fleetService';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Calendar, AlertCircle, CheckCircle2, Clock, Plus, Columns, List as ListIcon, User, Save, Trash2, DollarSign, Package, FileText } from 'lucide-react';
import Modal from '../components/Modal';

// Types locais (independente do types.ts legado)
interface MaintenanceOrder {
  id: string;
  asset_id?: string;
  asset_name: string;
  seq_number?: number;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'INSPECTION';
  status: 'PENDING' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  mechanic?: string;
  progress?: number;
  parts_needed?: string[];
  technician_notes?: string;
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  supplier_id?: string;
  supplier_name?: string;
  opened_at?: string;
  completed_at?: string;
}

type FormData = {
  asset_name: string;
  asset_id: string;
  type: MaintenanceOrder['type'];
  description: string;
  priority: MaintenanceOrder['priority'];
  mechanic: string;
  status: MaintenanceOrder['status'];
  progress: number;
  technician_notes: string;
  labor_cost: string;
  parts_cost: string;
  supplier_id: string;
};

const STATUS_LABELS: Record<string, string> = {
  'PENDING': 'Pendente',
  'IN_PROGRESS': 'Em Progresso',
  'WAITING_PARTS': 'Aguardando Peças',
  'COMPLETED': 'Concluído',
  'CANCELLED': 'Cancelado',
};

const TYPE_LABELS: Record<string, string> = {
  'PREVENTIVE': 'Preventiva',
  'CORRECTIVE': 'Corretiva',
  'PREDICTIVE': 'Preditiva',
  'INSPECTION': 'Inspeção',
};

const PRIORITY_LABELS: Record<string, string> = {
  'LOW': 'Baixa',
  'MEDIUM': 'Média',
  'HIGH': 'Alta',
  'URGENT': 'Urgente',
};

const emptyForm: FormData = {
  asset_name: '', asset_id: '', type: 'CORRECTIVE', description: '',
  priority: 'MEDIUM', mechanic: '', status: 'PENDING', progress: 0,
  technician_notes: '', labor_cost: '', parts_cost: '', supplier_id: '',
};

const Maintenance: React.FC = () => {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Listas auxiliares
  const { data: assets = [] } = useQuery({
    queryKey: ['fleet_maintenance'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60 * 5,
  });

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchAll('entities', { select: 'id, name', order: { column: 'name' } }).then(data => setSuppliers(data));
    fleetManagementService.getEmployees().then(data => setEmployees(data)).catch(() => {});
  }, []);

  // Carregar OS do Supabase
  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_os')
        .select('*')
        .order('opened_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Erro ao carregar OS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  // Salvar OS
  const handleSave = async () => {
    if (!formData.asset_name || !formData.description) return;
    setSaving(true);

    try {
      const laborCost = parseFloat(formData.labor_cost || '0');
      const partsCost = parseFloat(formData.parts_cost || '0');
      const supplier = suppliers.find(s => s.id === formData.supplier_id);

      const payload = {
        asset_id: formData.asset_id || null,
        asset_name: formData.asset_name,
        type: formData.type,
        description: formData.description,
        priority: formData.priority,
        mechanic: formData.mechanic || null,
        status: formData.status,
        progress: formData.progress,
        technician_notes: formData.technician_notes || null,
        labor_cost: laborCost,
        parts_cost: partsCost,
        supplier_id: formData.supplier_id || null,
        supplier_name: supplier?.name || null,
        completed_at: formData.status === 'COMPLETED' ? new Date().toISOString() : null,
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('maintenance_os').update(payload).eq('id', editingId);
        if (error) throw error;

        // Se acabou de concluir e tem custo, gerar financeiro
        const oldOrder = orders.find(o => o.id === editingId);
        if (formData.status === 'COMPLETED' && oldOrder?.status !== 'COMPLETED' && (laborCost + partsCost) > 0) {
          await gerarFinanceiro(editingId, payload, laborCost + partsCost);
        }
      } else {
        // INSERT
        const { data: inserted, error } = await supabase.from('maintenance_os').insert(payload).select('id').single();
        if (error) throw error;

        // Se já entra como concluída com custo
        if (formData.status === 'COMPLETED' && (laborCost + partsCost) > 0 && inserted) {
          await gerarFinanceiro(inserted.id, payload, laborCost + partsCost);
        }
      }

      await loadOrders();
      setIsModalOpen(false);
      resetForm();
    } catch (e: any) {
      alert('Erro ao salvar OS: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Gerar lançamento no Contas a Pagar
  const gerarFinanceiro = async (osId: string, payload: any, totalCost: number) => {
    try {
      const { error } = await supabase.from('contas_pagar').insert({
        fornecedor_id: payload.supplier_id,
        fornecedor_nome: payload.supplier_name || 'Manutenção Interna',
        descricao: `OS Manutenção - ${payload.asset_name}: ${payload.description.substring(0, 80)}`,
        valor_original: totalCost,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        status: 'PENDENTE',
        categoria: 'MANUTENCAO',
        numero_titulo: `OS-${osId.substring(0, 8)}`,
        observacao: `Gerado automaticamente pela OS de Manutenção. Mão de obra: R$ ${payload.labor_cost?.toFixed(2) || '0.00'} | Peças: R$ ${payload.parts_cost?.toFixed(2) || '0.00'}`
      });

      if (error) {
        console.error('Erro ao gerar financeiro da OS:', error);
        alert('OS salva, mas houve erro ao gerar Contas a Pagar: ' + error.message);
      }
    } catch (err) {
      console.error('Erro financeiro OS:', err);
    }
  };

  // Deletar OS
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Excluir esta Ordem de Serviço?')) return;

    try {
      // Cancelar financeiro vinculado
      const { data: contaVinculada } = await supabase
        .from('contas_pagar')
        .select('id, status')
        .like('numero_titulo', `OS-${id.substring(0, 8)}%`)
        .eq('status', 'PENDENTE')
        .single();

      if (contaVinculada) {
        await supabase.from('contas_pagar').update({
          status: 'CANCELADO',
          observacao: `Cancelado: OS excluída em ${new Date().toLocaleDateString('pt-BR')}`
        }).eq('id', contaVinculada.id);
      }

      const { error } = await supabase.from('maintenance_os').delete().eq('id', id);
      if (error) throw error;
      await loadOrders();
    } catch (e: any) {
      alert('Erro ao excluir: ' + e.message);
    }
  };

  const openNewModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (order: MaintenanceOrder) => {
    setEditingId(order.id);
    setFormData({
      asset_name: order.asset_name,
      asset_id: order.asset_id || '',
      type: order.type,
      description: order.description,
      priority: order.priority,
      mechanic: order.mechanic || '',
      status: order.status,
      progress: order.progress || 0,
      technician_notes: order.technician_notes || '',
      labor_cost: order.labor_cost ? String(order.labor_cost) : '',
      parts_cost: order.parts_cost ? String(order.parts_cost) : '',
      supplier_id: order.supplier_id || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => { setEditingId(null); setFormData({ ...emptyForm }); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WAITING_PARTS': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-white';
    }
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${getStatusColor(status)}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
      'CORRECTIVE': 'bg-red-500/10 text-red-400 border-red-500/20',
      'PREVENTIVE': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'PREDICTIVE': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'INSPECTION': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[type] || 'bg-slate-800 text-slate-400'}`}>
        {TYPE_LABELS[type] || type}
      </span>
    );
  };

  const KanbanColumn: React.FC<{ title: string, statusKey: string, items: MaintenanceOrder[] }> = ({ title, statusKey, items }) => (
    <div className="flex-1 min-w-[300px] bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">{title}</h3>
        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{items.length}</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center">
            <span className="text-slate-600 text-xs font-bold uppercase">Vazio</span>
          </div>
        )}
        {items.map(order => (
          <div key={order.id} onClick={() => openEditModal(order)}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-lg relative">
            <button onClick={(e) => handleDelete(order.id, e)}
              className="absolute top-2 right-2 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
            <div className="flex justify-between items-start mb-2">
              <TypeBadge type={order.type} />
              <div className={`w-2 h-2 rounded-full ${order.priority === 'URGENT' ? 'bg-red-500 animate-pulse' : order.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`} />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{order.asset_name}</h4>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{order.description}</p>
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase font-bold">
                <span>Progresso</span><span>{order.progress || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(order.progress || 0) === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${order.progress || 0}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-400" title={order.mechanic || 'Sem mecânico'}>
                  {order.mechanic ? order.mechanic.charAt(0) : <User size={10} />}
                </div>
                <span className="text-[10px] text-slate-600">{order.mechanic || ''}</span>
              </div>
              {(order.total_cost || 0) > 0 && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <DollarSign size={10} /> R$ {(order.total_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={openNewModal}
        className="mt-3 w-full py-2 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
        <Plus size={14} /> Adicionar
      </button>
    </div>
  );

  // Totais rápidos
  const totalPending = orders.filter(o => o.status === 'PENDING').length;
  const totalInProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const totalWaiting = orders.filter(o => o.status === 'WAITING_PARTS').length;
  const totalCompleted = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Wrench className="text-blue-500" size={28} />
            Gestão de Manutenção
          </h2>
          <p className="text-slate-500 mt-1">
            {orders.length} ordens — {totalPending} pendentes, {totalInProgress} em andamento, {totalWaiting} aguardando peças
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
            <button onClick={() => setViewMode('KANBAN')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}>
              <Columns size={20} />
            </button>
            <button onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}>
              <ListIcon size={20} />
            </button>
          </div>
          <button onClick={openNewModal}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2">
            <Plus size={18} /> Nova O.S.
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === 'KANBAN' ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
          <KanbanColumn title="Pendente" statusKey="PENDING" items={orders.filter(o => o.status === 'PENDING')} />
          <KanbanColumn title="Em Progresso" statusKey="IN_PROGRESS" items={orders.filter(o => o.status === 'IN_PROGRESS')} />
          <KanbanColumn title="Aguardando Peças" statusKey="WAITING_PARTS" items={orders.filter(o => o.status === 'WAITING_PARTS')} />
          <KanbanColumn title="Concluído" statusKey="COMPLETED" items={orders.filter(o => o.status === 'COMPLETED')} />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 shadow-md">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Equipamento</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Mecânico</th>
                <th className="px-6 py-4">Prioridade</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Custo</th>
                <th className="px-6 py-4">Progresso</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((os) => (
                <tr key={os.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => openEditModal(os)}>
                  <td className="px-6 py-5"><TypeBadge type={os.type} /></td>
                  <td className="px-6 py-5 font-bold text-white text-sm">{os.asset_name}</td>
                  <td className="px-6 py-5 text-sm text-slate-300 truncate max-w-xs">{os.description}</td>
                  <td className="px-6 py-5 text-sm text-slate-400">{os.mechanic || '-'}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                      os.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                      os.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {PRIORITY_LABELS[os.priority] || os.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5"><StatusBadge status={os.status} /></td>
                  <td className="px-6 py-5 text-sm">
                    {(os.total_cost || 0) > 0 ? (
                      <span className="text-amber-400 font-bold">R$ {(os.total_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-5 w-36">
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${(os.progress || 0) === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress || 0}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={(e) => handleDelete(os.id, e)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-16 text-center text-slate-500">
                  <Wrench size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">Nenhuma OS cadastrada</p>
                  <p className="text-xs mt-1">Clique em "Nova O.S." para criar a primeira.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingId ? `Editar OS` : "Nova Ordem de Serviço"}>
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Equipamento */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Equipamento *</label>
            <select
              value={formData.asset_id}
              onChange={(e) => {
                const asset = assets.find((a: any) => a.id === e.target.value);
                setFormData({ ...formData, asset_id: e.target.value, asset_name: (asset as any)?.name || '' });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="">Selecione ou digite abaixo...</option>
              {assets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {!formData.asset_id && (
              <input
                value={formData.asset_name}
                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                placeholder="Ou digite manualmente: Ex: Escavadeira CAT 320"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-sm"
              />
            )}
          </div>

          {/* Tipo + Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Manutenção</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                <option value="CORRECTIVE">Corretiva</option>
                <option value="PREVENTIVE">Preventiva</option>
                <option value="PREDICTIVE">Preditiva</option>
                <option value="INSPECTION">Inspeção</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Prioridade</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Problema *</label>
            <textarea rows={3} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o problema ou serviço..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          </div>

          {/* Mecânico + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Mecânico</label>
              <select value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                <option value="">Selecione...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.full_name || emp.name}>{emp.full_name || emp.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="WAITING_PARTS">Aguardando Peças</option>
                <option value="COMPLETED">Concluído</option>
              </select>
            </div>
          </div>

          {/* Progresso */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Progresso ({formData.progress}%)</label>
            <input type="range" min="0" max="100" step="5" value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full accent-blue-500" />
          </div>

          {/* Seção Financeira */}
          <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl space-y-4">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} /> Custos da Manutenção
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500 uppercase">Mão de Obra (R$)</label>
                <input type="number" value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-500 uppercase">Peças (R$)</label>
                <input type="number" value={formData.parts_cost}
                  onChange={(e) => setFormData({ ...formData, parts_cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
            </div>
            {(parseFloat(formData.labor_cost || '0') + parseFloat(formData.parts_cost || '0')) > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-amber-500/20">
                <span className="text-xs text-amber-400 font-bold">Total Estimado:</span>
                <span className="text-lg font-black text-amber-400">
                  R$ {(parseFloat(formData.labor_cost || '0') + parseFloat(formData.parts_cost || '0')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-500 uppercase">Fornecedor/Oficina</label>
              <select value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                <option value="">Manutenção Interna</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {formData.status === 'COMPLETED' && (parseFloat(formData.labor_cost || '0') + parseFloat(formData.parts_cost || '0')) > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
                <FileText size={12} className="inline mr-1" />
                Ao salvar como <b>Concluído</b>, um lançamento será gerado automaticamente no <b>Contas a Pagar</b>.
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Notas Técnicas</label>
            <textarea rows={2} value={formData.technician_notes}
              onChange={(e) => setFormData({ ...formData, technician_notes: e.target.value })}
              placeholder="Observações do mecânico..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          </div>

          {/* Botão Salvar */}
          <div className="pt-4">
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} />
              {saving ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Criar Ordem de Serviço')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Maintenance;
