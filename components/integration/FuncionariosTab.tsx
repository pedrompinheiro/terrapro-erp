import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, Trash2, X, Link2, Users, Upload, FileText,
  Clock, CheckCircle, AlertTriangle, Ban, Download, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchEmployeeIntegrations, createEmployeeIntegration, deleteEmployeeIntegration,
  fetchEmployees, fetchTemplates, updateDoc, uploadDocFile, calcDocStatus,
  EmployeeIntegration, EmployeeIntegrationDoc, IntegrationTemplate, generateDossierData
} from '../../services/integrationService';

const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  OK: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  A_VENCER: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  VENCIDO: 'text-red-400 bg-red-500/10 border-red-500/30',
  BLOQUEADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  EM_ANALISE: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  REJEITADO: 'text-red-400 bg-red-500/10 border-red-500/30',
  ATIVO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  INATIVO: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDENTE: <Clock size={12} />,
  OK: <CheckCircle size={12} />,
  A_VENCER: <AlertTriangle size={12} />,
  VENCIDO: <AlertTriangle size={12} />,
  BLOQUEADO: <Ban size={12} />,
  EM_ANALISE: <Clock size={12} />,
};

const FuncionariosTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<EmployeeIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVincular, setShowVincular] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setIntegrations(await fetchEmployeeIntegrations());
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este vínculo e todos seus documentos?')) return;
    try { await deleteEmployeeIntegration(id); toast.success('Removido'); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const filtered = integrations.filter(ei => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (ei.employee?.full_name || '').toLowerCase().includes(s) ||
      (ei.template?.client_name || '').toLowerCase().includes(s);
  });

  const getProgress = (ei: EmployeeIntegration) => {
    if (!ei.docs || ei.docs.length === 0) return { total: 0, ok: 0, pct: 0 };
    const total = ei.docs.length;
    const ok = ei.docs.filter(d => ['OK', 'A_VENCER'].includes(d.status)).length;
    return { total, ok, pct: Math.round((ok / total) * 100) };
  };

  const exportDossier = async (ei: EmployeeIntegration) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const dossier = generateDossierData(ei);
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('DOSSIÊ DE INTEGRAÇÃO', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Funcionário: ${dossier.employeeName}`, 14, 30);
      doc.text(`Cliente: ${dossier.clientName}`, 14, 36);
      doc.text(`Status: ${dossier.status}`, 14, 42);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 48);

      autoTable(doc, {
        startY: 55,
        head: [['Documento', 'Categoria', 'Status', 'Emissão', 'Validade', 'Obrigatório']],
        body: dossier.docs.map(d => [d.name, d.category, d.status, d.issueDate, d.expiryDate, d.required ? 'Sim' : 'Não']),
        theme: 'grid',
        headStyles: { fillColor: [0, 122, 51] },
      });

      doc.save(`dossie_${dossier.employeeName.replace(/\s/g, '_')}_${dossier.clientName.replace(/\s/g, '_')}.pdf`);
      toast.success('Dossiê exportado!');
    } catch (e: any) { toast.error('Erro ao gerar PDF: ' + e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar funcionário ou cliente..."
            className="flex-1 max-w-sm bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#007a33] focus:outline-none" />
          <span className="text-slate-400 text-sm">{filtered.length} vínculo(s)</span>
        </div>
        <button onClick={() => setShowVincular(true)} className="flex items-center gap-2 bg-[#007a33] hover:bg-[#009a43] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all">
          <Link2 size={16} /> Vincular
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">{search ? 'Nenhum resultado encontrado' : 'Nenhum funcionário vinculado'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ei => {
            const progress = getProgress(ei);
            const isExpanded = expandedId === ei.id;
            return (
              <div key={ei.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-all" onClick={() => setExpandedId(isExpanded ? null : ei.id)}>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">{isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold text-sm">{ei.employee?.full_name || 'Funcionário'}</h3>
                        <span className="text-slate-600">→</span>
                        <span className="text-[#007a33] font-bold text-sm">{ei.template?.client_name || 'Cliente'}</span>
                        {ei.employee?.job_title && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{ei.employee.job_title}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase flex items-center gap-1 ${STATUS_COLORS[ei.status] || STATUS_COLORS.PENDENTE}`}>
                          {STATUS_ICONS[ei.status]} {ei.status}
                        </span>
                        <span className="text-[10px] text-slate-500">{progress.ok}/{progress.total} docs ({progress.pct}%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${progress.pct === 100 ? 'bg-emerald-500' : progress.pct > 50 ? 'bg-[#007a33]' : 'bg-amber-500'}`}
                        style={{ width: `${progress.pct}%` }} />
                    </div>
                    <button onClick={e => { e.stopPropagation(); exportDossier(ei); }} className="text-slate-600 hover:text-blue-400 transition-colors p-2" title="Exportar Dossiê PDF">
                      <Download size={16} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleRemove(ei.id); }} className="text-slate-600 hover:text-red-400 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && ei.docs && (
                  <div className="border-t border-slate-800 p-5 space-y-2">
                    {ei.docs.map(doc => (
                      <DocRow key={doc.id} doc={doc} integrationId={ei.id}
                        alertDays={Array.isArray(ei.template?.alert_days) ? ei.template.alert_days : [30, 15, 7]}
                        blockOnExpiry={ei.template?.block_on_expiry ?? true}
                        onRefresh={load} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showVincular && <VincularModal onClose={() => setShowVincular(false)} onCreated={() => { setShowVincular(false); load(); }} />}
    </div>
  );
};

const DocRow: React.FC<{
  doc: EmployeeIntegrationDoc; integrationId: string;
  alertDays: number[]; blockOnExpiry: boolean; onRefresh: () => void;
}> = ({ doc, integrationId, alertDays, blockOnExpiry, onRefresh }) => {
  const [uploading, setUploading] = useState(false);
  const [issueDate, setIssueDate] = useState(doc.issue_date || '');
  const [expiryDate, setExpiryDate] = useState(doc.expiry_date || '');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, version } = await uploadDocFile(file, integrationId, doc.id, doc.current_version || 0);
      const newStatus = calcDocStatus({ expiry_date: expiryDate || undefined, file_url: url }, alertDays, blockOnExpiry);
      await updateDoc(doc.id, { file_url: url, file_name: file.name, file_size: file.size, current_version: version, status: newStatus as any });
      toast.success('Arquivo enviado (v' + version + ')');
      onRefresh();
    } catch (e: any) { toast.error('Erro: ' + e.message); }
    finally { setUploading(false); }
  };

  const handleDateChange = async (field: 'issue_date' | 'expiry_date', value: string) => {
    if (field === 'issue_date') setIssueDate(value);
    else setExpiryDate(value);
    try {
      const updates: any = { [field]: value || null };
      if (field === 'expiry_date' && doc.file_url) {
        updates.status = calcDocStatus({ expiry_date: value || undefined, file_url: doc.file_url }, alertDays, blockOnExpiry);
      }
      await updateDoc(doc.id, updates);
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const statusClass = STATUS_COLORS[doc.status] || STATUS_COLORS.PENDENTE;

  return (
    <div className="bg-slate-800/50 rounded-lg px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <FileText size={14} className="text-slate-500 flex-shrink-0" />
          <span className="text-white text-sm font-medium">{doc.template_item?.document_name || 'Documento'}</span>
          {doc.template_item?.document_category && <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{doc.template_item.document_category}</span>}
          {doc.template_item?.is_required && <span className="text-[10px] text-amber-400 font-bold">OBRIG.</span>}
          {doc.current_version > 1 && <span className="text-[10px] text-slate-500">v{doc.current_version}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase flex items-center gap-1 ${statusClass}`}>
            {STATUS_ICONS[doc.status]} {doc.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-6 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-600" />
          <label className="text-[10px] text-slate-500">Emissão:</label>
          <input type="date" value={issueDate} onChange={e => handleDateChange('issue_date', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-[#007a33] focus:outline-none" />
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-600" />
          <label className="text-[10px] text-slate-500">Validade:</label>
          <input type="date" value={expiryDate} onChange={e => handleDateChange('expiry_date', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-[#007a33] focus:outline-none" />
        </div>
        {doc.file_name ? (
          <a href={doc.file_url || '#'} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline truncate max-w-[150px]">{doc.file_name}</a>
        ) : null}
        <label className={`flex items-center gap-1.5 text-[10px] cursor-pointer transition-colors ml-auto ${uploading ? 'text-slate-600' : 'text-slate-400 hover:text-white'}`}>
          <Upload size={12} />
          {uploading ? 'Enviando...' : doc.file_url ? 'Nova versão' : 'Upload'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

const VincularModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchTemplates()])
      .then(([emps, tmps]) => { setEmployees(emps); setTemplates(tmps); })
      .catch(e => toast.error(e.message))
      .finally(() => setLoadingData(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedTemplate) return toast.error('Selecione funcionário e template');
    setSaving(true);
    try {
      await createEmployeeIntegration(selectedEmployee, selectedTemplate);
      toast.success('Vinculado!');
      onCreated();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Vincular Funcionário</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {loadingData ? <p className="text-slate-500 text-center py-4">Carregando...</p> : (
            <>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Funcionário *</label>
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#007a33] focus:outline-none">
                  <option value="">Selecione...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Template (Cliente) *</label>
                <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#007a33] focus:outline-none">
                  <option value="">Selecione...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.client_name} {t.client_code ? `(${t.client_code})` : ''}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !selectedEmployee || !selectedTemplate}
            className="flex-1 bg-[#007a33] hover:bg-[#009a43] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">
            {saving ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuncionariosTab;
