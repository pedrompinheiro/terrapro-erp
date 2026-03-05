import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, X, FileText, Building2, Edit2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import {
  fetchTemplates, createTemplate, deleteTemplate,
  addTemplateItem, removeTemplateItem,
  IntegrationTemplate, IntegrationTemplateItem
} from '../../services/integrationService';

const CATEGORIES = ['Saúde', 'Segurança', 'Legal', 'Treinamento', 'Geral'];
const VALIDITY_UNITS = [
  { value: 'DAYS', label: 'Dias' },
  { value: 'MONTHS', label: 'Meses' },
  { value: 'YEARS', label: 'Anos' },
];

const ClientesTab: React.FC = () => {
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setTemplates(await fetchTemplates());
    } catch (e: any) {
      toast.error('Erro ao carregar: ' + e.message);
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
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{templates.length} cliente(s) cadastrado(s)</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#007a33] hover:bg-[#009a43] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all">
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">Carregando...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <TemplateCard key={t.id} template={t} expanded={expandedId === t.id}
              onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
              onDelete={() => handleDelete(t.id)} onRefresh={load}
            />
          ))}
        </div>
      )}

      {showModal && <NewTemplateModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />}
    </div>
  );
};

const TemplateCard: React.FC<{
  template: IntegrationTemplate; expanded: boolean;
  onToggle: () => void; onDelete: () => void; onRefresh: () => void;
}> = ({ template, expanded, onToggle, onDelete, onRefresh }) => {
  const [newDoc, setNewDoc] = useState('');
  const [newCat, setNewCat] = useState('Geral');
  const [newValidity, setNewValidity] = useState('12');
  const [newValidityUnit, setNewValidityUnit] = useState<'DAYS'|'MONTHS'|'YEARS'>('MONTHS');
  const [newRequired, setNewRequired] = useState(true);
  const [newBlocks, setNewBlocks] = useState(true);
  const [adding, setAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newDoc.trim()) return;
    setAdding(true);
    try {
      await addTemplateItem({
        template_id: template.id, document_name: newDoc.trim(), document_category: newCat,
        validity_value: parseInt(newValidity) || undefined, validity_unit: newValidityUnit,
        is_required: newRequired, blocks_on_expiry: newBlocks,
        sort_order: (template.items?.length || 0) + 1,
      });
      setNewDoc('');
      toast.success('Documento adicionado');
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setAdding(false); }
  };

  const handleRemoveItem = async (itemId: string) => {
    try { await removeTemplateItem(itemId); toast.success('Removido'); onRefresh(); }
    catch (e: any) { toast.error(e.message); }
  };

  const alertDays = Array.isArray(template.alert_days) ? template.alert_days : [30, 15, 7];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-all" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <span className="text-slate-500">{expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</span>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-white font-bold text-sm uppercase tracking-tight">{template.client_name}</h3>
              {template.client_code && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">{template.client_code}</span>}
              {template.unit_name && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{template.unit_name}</span>}
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${template.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {template.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              {template.items?.length || 0} doc(s) • Alertas: {alertDays.join('/')}d
              {template.block_on_expiry && ' • Bloqueia ao vencer'}
              {template.contact_name && ` • Contato: ${template.contact_name}`}
            </p>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-slate-600 hover:text-red-400 transition-colors p-2">
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 p-5 space-y-4">
          {template.items && template.items.length > 0 ? (
            <div className="space-y-2">
              {template.items.sort((a, b) => a.sort_order - b.sort_order).map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <FileText size={14} className="text-[#007a33]" />
                    <span className="text-white text-sm font-medium">{item.document_name}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{item.document_category}</span>
                    {item.validity_value && (
                      <span className="text-[10px] text-slate-500">
                        {item.validity_value} {item.validity_unit === 'DAYS' ? 'd' : item.validity_unit === 'MONTHS' ? 'm' : 'a'}
                      </span>
                    )}
                    {item.is_required && <span className="text-[10px] text-amber-400 font-bold">OBRIG.</span>}
                    {item.blocks_on_expiry && <span className="text-[10px] text-red-400 font-bold">BLOQUEIA</span>}
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm text-center py-4">Nenhum documento no checklist</p>
          )}

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Adicionar Documento ao Checklist</p>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Nome do Documento</label>
                <input value={newDoc} onChange={e => setNewDoc(e.target.value)} placeholder="Ex: ASO Admissional"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleAddItem()} />
              </div>
              <div className="w-32">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Categoria</label>
                <select value={newCat} onChange={e => setNewCat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#007a33] focus:outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="w-20">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Validade</label>
                <input type="number" value={newValidity} onChange={e => setNewValidity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#007a33] focus:outline-none" />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Unidade</label>
                <select value={newValidityUnit} onChange={e => setNewValidityUnit(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#007a33] focus:outline-none">
                  {VALIDITY_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer pb-2">
                <input type="checkbox" checked={newRequired} onChange={e => setNewRequired(e.target.checked)} className="accent-[#007a33]" />
                <span className="text-[10px] text-slate-400">Obrig.</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer pb-2">
                <input type="checkbox" checked={newBlocks} onChange={e => setNewBlocks(e.target.checked)} className="accent-red-500" />
                <span className="text-[10px] text-slate-400">Bloqueia</span>
              </label>
              <button onClick={handleAddItem} disabled={adding || !newDoc.trim()}
                className="bg-[#007a33] hover:bg-[#009a43] disabled:opacity-50 text-white p-2.5 rounded-lg transition-all">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewTemplateModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ client_name: '', client_code: '', unit_name: '', contact_name: '', contact_phone: '', contact_email: '', alert_days: '30,15,7', block_on_expiry: true, block_grace_days: '0' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; document?: string; email?: string; phone?: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const searchEntities = async (query: string) => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearchLoading(true);
    try {
      const { data } = await supabase
        .from('entities')
        .select('id, name, document, email, phone, is_client')
        .or(`name.ilike.%${query}%,document.ilike.%${query}%`)
        .eq('is_client', true)
        .order('name')
        .limit(10);
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
    finally { setSearchLoading(false); }
  };

  const handleClientNameChange = (value: string) => {
    set('client_name', value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchEntities(value), 300);
  };

  const handleSelectEntity = (entity: typeof suggestions[0]) => {
    set('client_name', entity.name);
    if (entity.email) set('contact_email', entity.email);
    if (entity.phone) set('contact_phone', entity.phone);
    if (entity.document) set('client_code', entity.document);
    setShowSuggestions(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async () => {
    if (!form.client_name.trim()) return toast.error('Nome do cliente é obrigatório');
    setSaving(true);
    try {
      await createTemplate({
        client_name: form.client_name.trim(),
        client_code: form.client_code.trim() || undefined,
        unit_name: form.unit_name.trim() || undefined,
        contact_name: form.contact_name.trim() || undefined,
        contact_phone: form.contact_phone.trim() || undefined,
        contact_email: form.contact_email.trim() || undefined,
        alert_days: form.alert_days.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)),
        block_on_expiry: form.block_on_expiry,
        block_grace_days: parseInt(form.block_grace_days) || 0,
      });
      toast.success('Cliente criado!');
      onCreated();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Novo Cliente / Unidade</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative" ref={dropdownRef}>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Nome do Cliente *</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={form.client_name} onChange={e => handleClientNameChange(e.target.value)}
                  onFocus={() => form.client_name.length >= 2 && searchEntities(form.client_name)}
                  placeholder="Buscar cliente cadastrado ou digitar novo..."
                  autoFocus autoComplete="off"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
                {searchLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#007a33] border-t-transparent rounded-full animate-spin" />}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                  {suggestions.map(entity => (
                    <button key={entity.id} onClick={() => handleSelectEntity(entity)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{entity.name}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">CADASTRADO</span>
                      </div>
                      {(entity.document || entity.email) && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {entity.document && <span className="font-mono">{entity.document}</span>}
                          {entity.document && entity.email && ' • '}
                          {entity.email}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {showSuggestions && suggestions.length === 0 && form.client_name.length >= 2 && !searchLoading && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl px-4 py-3">
                  <p className="text-xs text-slate-500">Nenhum cliente encontrado. O nome digitado será usado.</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Código Interno</label>
              <input value={form.client_code} onChange={e => set('client_code', e.target.value)} placeholder="BRF-DDS"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Unidade</label>
              <input value={form.unit_name} onChange={e => set('unit_name', e.target.value)} placeholder="Planta 1"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2">Contato do Cliente</p>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Nome"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
            <input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="Telefone"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
            <input value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="Email"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2">Regras de Alerta</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Alertas (dias antes, separados por vírgula)</label>
              <input value={form.alert_days} onChange={e => set('alert_days', e.target.value)} placeholder="30,15,7"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Dias de tolerância</label>
              <input type="number" value={form.block_grace_days} onChange={e => set('block_grace_days', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#007a33] focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.block_on_expiry} onChange={e => set('block_on_expiry', e.target.checked)} className="accent-[#007a33] w-4 h-4" />
            <span className="text-sm text-slate-300">Bloquear funcionário ao vencer documento obrigatório</span>
          </label>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-800 sticky bottom-0 bg-slate-900">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-[#007a33] hover:bg-[#009a43] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">
            {saving ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientesTab;
