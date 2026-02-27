import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, Plus, Trash2, ChevronDown, ChevronRight, X, Search,
  AlertTriangle, CheckCircle, Clock, Upload, FileText, Users, Building2, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchTemplates, createTemplate, updateTemplate, deleteTemplate,
  addTemplateItem, removeTemplateItem,
  fetchEmployeeIntegrations, createEmployeeIntegration, deleteEmployeeIntegration,
  fetchEmployees, updateDoc, uploadDocFile,
  IntegrationTemplate, IntegrationTemplateItem, EmployeeIntegration, EmployeeIntegrationDoc
} from '../services/integrationService';

type Tab = 'clientes' | 'funcionarios';

const CATEGORIES = ['Saúde', 'Segurança', 'Legal', 'Treinamento', 'Geral'];

const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  APROVADO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  VENCIDO: 'text-red-400 bg-red-500/10 border-red-500/30',
  EM_ANALISE: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDENTE: <Clock size={14} />,
  APROVADO: <CheckCircle size={14} />,
  REJEITADO: <X size={14} />,
  VENCIDO: <AlertTriangle size={14} />,
  EM_ANALISE: <Search size={14} />,
};

// ============================
// MAIN PAGE
// ============================
const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('clientes');

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
            <ClipboardCheck className="text-[#007a33]" size={32} />
            Integrações & Habilitações
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Controle de documentação exigida por clientes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl w-fit">
        {[
          { id: 'clientes' as Tab, label: 'Clientes', icon: <Building2 size={16} /> },
          { id: 'funcionarios' as Tab, label: 'Funcionários', icon: <Users size={16} /> },
        ].map(tab => (
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

      {activeTab === 'clientes' ? <ClientesTab /> : <FuncionariosTab />}
    </div>
  );
};

// ============================
// CLIENTES TAB
// ============================
const ClientesTab: React.FC = () => {
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (e: any) {
      toast.error('Erro ao carregar templates: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este template e todos seus itens?')) return;
    try {
      await deleteTemplate(id);
      toast.success('Template removido');
      load();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{templates.length} cliente(s) cadastrado(s)</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#007a33] hover:bg-[#009a43] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Carregando...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              expanded={expandedId === t.id}
              onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
              onDelete={() => handleDelete(t.id)}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewTemplateModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
};

// ============================
// TEMPLATE CARD (expandable)
// ============================
const TemplateCard: React.FC<{
  template: IntegrationTemplate;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}> = ({ template, expanded, onToggle, onDelete, onRefresh }) => {
  const [newDoc, setNewDoc] = useState('');
  const [newCat, setNewCat] = useState('Geral');
  const [newValidity, setNewValidity] = useState('12');
  const [newRequired, setNewRequired] = useState(true);
  const [adding, setAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newDoc.trim()) return;
    setAdding(true);
    try {
      await addTemplateItem({
        template_id: template.id,
        document_name: newDoc.trim(),
        document_category: newCat,
        validity_months: parseInt(newValidity) || undefined,
        is_required: newRequired,
        sort_order: (template.items?.length || 0) + 1,
      });
      setNewDoc('');
      toast.success('Documento adicionado');
      onRefresh();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeTemplateItem(itemId);
      toast.success('Removido');
      onRefresh();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-all" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <button className="text-slate-500">
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-white font-bold text-sm uppercase tracking-tight">{template.client_name}</h3>
              {template.client_code && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">{template.client_code}</span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${template.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {template.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              {template.items?.length || 0} documento(s) no checklist • Alerta {template.alert_days_before}d antes
              {template.block_on_expiry && ' • Bloqueia ao vencer'}
            </p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-slate-600 hover:text-red-400 transition-colors p-2">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-800 p-5 space-y-4">
          {/* Item list */}
          {template.items && template.items.length > 0 ? (
            <div className="space-y-2">
              {template.items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText size={14} className="text-[#007a33]" />
                      <span className="text-white text-sm font-medium">{item.document_name}</span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{item.document_category}</span>
                      {item.validity_months && (
                        <span className="text-[10px] text-slate-500">{item.validity_months} meses</span>
                      )}
                      {item.is_required && (
                        <span className="text-[10px] text-amber-400 font-bold">OBRIGATÓRIO</span>
                      )}
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm text-center py-4">Nenhum documento no checklist</p>
          )}

          {/* Add item form */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Adicionar Documento</p>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Nome do Documento</label>
                <input
                  value={newDoc}
                  onChange={e => setNewDoc(e.target.value)}
                  placeholder="Ex: ASO Admissional"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                />
              </div>
              <div className="w-36">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Categoria</label>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#007a33] focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="w-24">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Validade (meses)</label>
                <input
                  type="number"
                  value={newValidity}
                  onChange={e => setNewValidity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#007a33] focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input type="checkbox" checked={newRequired} onChange={e => setNewRequired(e.target.checked)} className="accent-[#007a33]" />
                <span className="text-xs text-slate-400">Obrigatório</span>
              </label>
              <button
                onClick={handleAddItem}
                disabled={adding || !newDoc.trim()}
                className="bg-[#007a33] hover:bg-[#009a43] disabled:opacity-50 text-white p-2.5 rounded-lg transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// NEW TEMPLATE MODAL
// ============================
const NewTemplateModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [alertDays, setAlertDays] = useState('30');
  const [blockOnExpiry, setBlockOnExpiry] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Nome do cliente é obrigatório');
    setSaving(true);
    try {
      await createTemplate({
        client_name: name.trim(),
        client_code: code.trim() || undefined,
        alert_days_before: parseInt(alertDays) || 30,
        block_on_expiry: blockOnExpiry,
      });
      toast.success('Cliente criado com sucesso!');
      onCreated();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Novo Cliente</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Nome do Cliente *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: BRF Dourados"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Código Interno</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ex: BRF-DDS"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Alerta (dias antes do vencimento)</label>
            <input
              type="number"
              value={alertDays}
              onChange={e => setAlertDays(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#007a33] focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={blockOnExpiry} onChange={e => setBlockOnExpiry(e.target.checked)} className="accent-[#007a33] w-4 h-4" />
            <span className="text-sm text-slate-300">Bloquear ao vencer</span>
          </label>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-[#007a33] hover:bg-[#009a43] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
          >
            {saving ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================
// FUNCIONARIOS TAB
// ============================
const FuncionariosTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<EmployeeIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVincular, setShowVincular] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeeIntegrations();
      setIntegrations(data);
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este vínculo?')) return;
    try {
      await deleteEmployeeIntegration(id);
      toast.success('Vínculo removido');
      load();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
  };

  const getStatusSummary = (ei: EmployeeIntegration) => {
    if (!ei.docs || ei.docs.length === 0) return { total: 0, ok: 0, pending: 0 };
    const total = ei.docs.length;
    const ok = ei.docs.filter(d => d.status === 'APROVADO').length;
    const pending = total - ok;
    return { total, ok, pending };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{integrations.length} vínculo(s)</p>
        <button
          onClick={() => setShowVincular(true)}
          className="flex items-center gap-2 bg-[#007a33] hover:bg-[#009a43] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all"
        >
          <Link2 size={16} /> Vincular
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Carregando...</div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum funcionário vinculado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map(ei => {
            const summary = getStatusSummary(ei);
            const isExpanded = expandedId === ei.id;
            return (
              <div key={ei.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : ei.id)}
                >
                  <div className="flex items-center gap-4">
                    <button className="text-slate-500">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold text-sm">{ei.employee?.full_name || 'Funcionário'}</h3>
                        <span className="text-[10px] text-slate-500">→</span>
                        <span className="text-sm text-[#007a33] font-bold">{ei.template?.client_name || 'Cliente'}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${STATUS_COLORS[ei.status] || STATUS_COLORS.PENDENTE}`}>
                          {ei.status}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {summary.ok}/{summary.total} documentos OK
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress bar */}
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007a33] rounded-full transition-all"
                        style={{ width: summary.total > 0 ? `${(summary.ok / summary.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleRemove(ei.id); }} className="text-slate-600 hover:text-red-400 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && ei.docs && (
                  <div className="border-t border-slate-800 p-5 space-y-2">
                    {ei.docs.map(doc => (
                      <DocRow key={doc.id} doc={doc} integrationId={ei.id} onRefresh={load} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showVincular && (
        <VincularModal onClose={() => setShowVincular(false)} onCreated={() => { setShowVincular(false); load(); }} />
      )}
    </div>
  );
};

// ============================
// DOC ROW (upload/status)
// ============================
const DocRow: React.FC<{ doc: EmployeeIntegrationDoc; integrationId: string; onRefresh: () => void }> = ({ doc, integrationId, onRefresh }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadDocFile(file, integrationId, doc.id);
      await updateDoc(doc.id, {
        file_url: url,
        file_name: file.name,
        file_size: file.size,
        status: 'EM_ANALISE',
      });
      toast.success('Arquivo enviado');
      onRefresh();
    } catch (e: any) {
      toast.error('Erro no upload: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const statusClass = STATUS_COLORS[doc.status] || STATUS_COLORS.PENDENTE;

  return (
    <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3 flex-1">
        <FileText size={14} className="text-slate-500" />
        <span className="text-white text-sm">{doc.template_item?.document_name || 'Documento'}</span>
        {doc.template_item?.document_category && (
          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{doc.template_item.document_category}</span>
        )}
        {doc.template_item?.is_required && (
          <span className="text-[10px] text-amber-400 font-bold">OBRIG.</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {doc.file_name ? (
          <a href={doc.file_url || '#'} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline truncate max-w-[120px]">
            {doc.file_name}
          </a>
        ) : (
          <label className={`flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={12} />
            {uploading ? 'Enviando...' : 'Upload'}
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase flex items-center gap-1 ${statusClass}`}>
          {STATUS_ICONS[doc.status]} {doc.status}
        </span>
      </div>
    </div>
  );
};

// ============================
// VINCULAR MODAL
// ============================
const VincularModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchTemplates()])
      .then(([emps, tmps]) => {
        setEmployees(emps);
        setTemplates(tmps);
      })
      .catch(e => toast.error('Erro ao carregar dados: ' + e.message))
      .finally(() => setLoadingData(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedTemplate) return toast.error('Selecione funcionário e template');
    setSaving(true);
    try {
      await createEmployeeIntegration(selectedEmployee, selectedTemplate);
      toast.success('Funcionário vinculado!');
      onCreated();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Vincular Funcionário</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {loadingData ? (
            <p className="text-slate-500 text-center py-4">Carregando...</p>
          ) : (
            <>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Funcionário *</label>
                <select
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#007a33] focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Template (Cliente) *</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#007a33] focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.client_name} {t.client_code ? `(${t.client_code})` : ''}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !selectedEmployee || !selectedTemplate}
            className="flex-1 bg-[#007a33] hover:bg-[#009a43] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
          >
            {saving ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
