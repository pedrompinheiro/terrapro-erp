
import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { MaintenanceOS, OSStatus } from '../types';
import { Wrench, Calendar, AlertCircle, CheckCircle2, Clock, Plus, Filter, Columns, List as ListIcon, User, Archive, Save, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const Maintenance: React.FC = () => {
  const [orders, setOrders] = useState<MaintenanceOS[]>([]);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceOS>>({
    assetName: '',
    description: '',
    priority: 'MEDIUM',
    mechanic: '',
    status: OSStatus.PENDING,
    progress: 0
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getMaintenanceOS();
      setOrders(data as MaintenanceOS[]);
    } catch (error) {
      console.error("Failed to load maintenance orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSave = async () => {
    if (!formData.assetName || !formData.description) return;

    if (editingId) {
      // Update
      const updatedOrder: MaintenanceOS = {
        ...orders.find(o => o.id === editingId)!,
        ...formData as MaintenanceOS,
        id: editingId
      };
      await dashboardService.updateMaintenanceOS(updatedOrder);
    } else {
      // Create
      const newOrder: MaintenanceOS = {
        id: `OS-${Math.floor(Math.random() * 10000)}`,
        assetId: 'GENERIC',
        assetName: formData.assetName!,
        description: formData.description!,
        priority: formData.priority as any,
        status: OSStatus.PENDING,
        mechanic: formData.mechanic || 'N/A',
        progress: 0,
        partsNeeded: []
      };
      await dashboardService.addMaintenanceOS(newOrder);
    }

    await loadOrders();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Excluir esta Ordem de Serviço?')) {
      await dashboardService.deleteMaintenanceOS(id);
      await loadOrders();
    }
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (order: MaintenanceOS) => {
    setEditingId(order.id);
    setFormData(order);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      assetName: '',
      description: '',
      priority: 'MEDIUM',
      mechanic: '',
      status: OSStatus.PENDING,
      progress: 0
    });
  };

  const getStatusColor = (status: OSStatus) => {
    switch (status) {
      case OSStatus.PENDING: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case OSStatus.IN_PROGRESS: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case OSStatus.WAITING_PARTS: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case OSStatus.COMPLETED: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-white';
    }
  };

  const StatusBadge: React.FC<{ status: OSStatus }> = ({ status }) => {
    const colors = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${colors}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const KanbanColumn: React.FC<{ title: string, status: OSStatus, items: MaintenanceOS[] }> = ({ title, status, items }) => (
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
          <div
            key={order.id}
            onClick={() => openEditModal(order)}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-lg relative"
          >
            <button
              onClick={(e) => handleDelete(order.id, e)}
              className="absolute top-2 right-2 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>

            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-slate-500">{order.id}</span>
              <div className={`w-2 h-2 rounded-full ${order.priority === 'URGENT' ? 'bg-red-500 animate-pulse' :
                order.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{order.assetName}</h4>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{order.description}</p>

            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase font-bold">
                <span>Progresso</span>
                <span>{order.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${order.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-400" title={order.mechanic || 'Unassigned'}>
                  {order.mechanic ? order.mechanic.charAt(0) : <User size={10} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={openNewModal}
        className="mt-3 w-full py-2 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Adicionar
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gestão de Manutenção</h2>
          <p className="text-slate-500 mt-1">Quadro de controle de ordens de serviço (Kanban).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
            >
              <Columns size={20} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
          <button
            onClick={openNewModal}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Nova O.S.
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === 'KANBAN' ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
          <KanbanColumn
            title="Pendente"
            status={OSStatus.PENDING}
            items={orders.filter(o => o.status === OSStatus.PENDING)}
          />
          <KanbanColumn
            title="Em Progresso"
            status={OSStatus.IN_PROGRESS}
            items={orders.filter(o => o.status === OSStatus.IN_PROGRESS)}
          />
          <KanbanColumn
            title="Aguardando Peças"
            status={OSStatus.WAITING_PARTS}
            items={orders.filter(o => o.status === OSStatus.WAITING_PARTS)}
          />
          <KanbanColumn
            title="Concluído"
            status={OSStatus.COMPLETED}
            items={orders.filter(o => o.status === OSStatus.COMPLETED)}
          />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 shadow-md">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Equipamento</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Mecânico</th>
                <th className="px-8 py-5">Prioridade</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Progresso</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((os) => (
                <tr key={os.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => openEditModal(os)}>
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">{os.id}</td>
                  <td className="px-8 py-6 font-bold text-white text-sm">{os.assetName}</td>
                  <td className="px-8 py-6 text-sm text-slate-300 truncate max-w-xs">{os.description}</td>
                  <td className="px-8 py-6 text-sm text-slate-400">{os.mechanic || '-'}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${os.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                      {os.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6"><StatusBadge status={os.status} /></td>
                  <td className="px-8 py-6 w-48">
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={(e) => handleDelete(os.id, e)}
                      className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? `Editar OS: ${editingId}` : "Nova Ordem de Serviço"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Equipamento</label>
            <input
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              placeholder="Ex: Escavadeira CAT 320"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Problema</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o problema..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="LOW">BAIXA</option>
                <option value="MEDIUM">MÉDIA</option>
                <option value="HIGH">ALTA</option>
                <option value="URGENTE">URGENTE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Mecânico</label>
              <input
                value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                placeholder="Nome do Mecânico"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              >
                <option value={OSStatus.PENDING}>Pendente</option>
                <option value={OSStatus.IN_PROGRESS}>Em Progresso</option>
                <option value={OSStatus.WAITING_PARTS}>Aguardando Peças</option>
                <option value={OSStatus.COMPLETED}>Concluído</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Progresso (%)</label>
              <input
                type="number"
                min="0" max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editingId ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Maintenance;
