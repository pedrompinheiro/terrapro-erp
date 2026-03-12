
import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck, Plus, FileText, Download, Wrench, ChevronDown, ChevronRight,
  Trash2, Save, RefreshCw, Calendar, Search, Filter, Loader2, CheckSquare,
  AlertCircle, Clock, Truck, Settings2, BarChart3, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import {
  maintenancePlanService,
  MaintenancePlanTemplate,
  MaintenancePlanItem,
  MaintenanceReportData,
  INTERVAL_LABELS,
  INTERVAL_ORDER,
  CATEGORY_LABELS,
} from '../services/maintenancePlanService';
import {
  generateMaintenancePlanPDF,
  generateMaintenanceReportPDF,
} from '../services/maintenancePlanPDF';
import {
  parseWhatsAppChat,
  filterMessages,
  groupByEquipment,
  getChatStats,
  WhatsAppMessage,
  WhatsAppEquipmentGroup,
} from '../services/whatsappChatParser';

// ============================================================
// HELPERS
// ============================================================

function groupItemsByInterval(items: MaintenancePlanItem[]): Record<string, Record<string, MaintenancePlanItem[]>> {
  const result: Record<string, Record<string, MaintenancePlanItem[]>> = {};
  for (const item of items) {
    if (!result[item.interval_type]) result[item.interval_type] = {};
    if (!result[item.interval_type][item.category]) result[item.interval_type][item.category] = [];
    result[item.interval_type][item.category].push(item);
  }
  return result;
}

const EQUIP_ICONS: Record<string, string> = {
  'PÁ CARREGADEIRA': '🏗️',
  'MINI CARREGADEIRA': '🔧',
  'ESCAVADEIRA': '⛏️',
  'TRATOR': '🚜',
  'CAMINHÃO': '🚛',
};

function getEquipIcon(name: string): string {
  for (const [key, icon] of Object.entries(EQUIP_ICONS)) {
    if (name.toUpperCase().includes(key)) return icon;
  }
  return '🔩';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const MaintenancePlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'report'>('plans');
  const [templates, setTemplates] = useState<MaintenancePlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<MaintenancePlanTemplate | null>(null);
  const [selectedItems, setSelectedItems] = useState<MaintenancePlanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [seeding, setSeeding] = useState(false);

  // Report state
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<MaintenanceReportData[] | null>(null);

  // Report options
  const [showValues, setShowValues] = useState(true);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [selectedEquipIds, setSelectedEquipIds] = useState<Set<string>>(new Set()); // empty = all

  // WhatsApp state
  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>([]);
  const [whatsAppGroups, setWhatsAppGroups] = useState<WhatsAppEquipmentGroup[]>([]);
  const [whatsAppLoaded, setWhatsAppLoaded] = useState(false);
  const [whatsAppStats, setWhatsAppStats] = useState<any>(null);
  const [whatsAppPhotos, setWhatsAppPhotos] = useState<Record<string, string>>({}); // filename → base64

  // Detail view state
  const [expandedIntervals, setExpandedIntervals] = useState<Record<string, boolean>>({});

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addItemInterval, setAddItemInterval] = useState('500H');
  const [addItemCategory, setAddItemCategory] = useState('MOTOR');
  const [addItemName, setAddItemName] = useState('');
  const [addItemActions, setAddItemActions] = useState({ check: false, clean: false, replace: false, adjust: false });

  const [showExecModal, setShowExecModal] = useState(false);
  const [execData, setExecData] = useState({ mechanic: '', horimeter: '', notes: '' });

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenancePlanService.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      toast.error('Erro ao carregar planos: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // Set default report dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    setReportDateFrom(firstDay.toISOString().split('T')[0]);
    setReportDateTo(now.toISOString().split('T')[0]);
  }, []);

  // Load template detail
  const loadDetail = async (template: MaintenancePlanTemplate) => {
    try {
      const { items } = await maintenancePlanService.getTemplateById(template.id!);
      setSelectedTemplate(template);
      setSelectedItems(items);
      // Expand all intervals by default
      const expanded: Record<string, boolean> = {};
      INTERVAL_ORDER.forEach(i => expanded[i] = true);
      setExpandedIntervals(expanded);
    } catch (err: any) {
      toast.error('Erro ao carregar detalhe: ' + (err.message || err));
    }
  };

  // Seed from spreadsheet
  const handleSeed = async () => {
    setSeeding(true);
    try {
      const count = await maintenancePlanService.seedFromSpreadsheet();
      toast.success(`${count} equipamentos importados com sucesso!`);
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao importar');
    } finally {
      setSeeding(false);
    }
  };

  // Export checklist PDF
  const handleExportPDF = () => {
    if (!selectedTemplate || selectedItems.length === 0) {
      toast.error('Selecione um plano primeiro');
      return;
    }
    generateMaintenancePlanPDF(selectedTemplate, selectedItems);
    toast.success('PDF gerado!');
  };

  // Add item
  const handleAddItem = async () => {
    if (!selectedTemplate || !addItemName.trim()) return;
    try {
      await maintenancePlanService.addItem(selectedTemplate.id!, {
        interval_type: addItemInterval,
        category: addItemCategory,
        service_name: addItemName.trim().toUpperCase(),
        action_check: addItemActions.check,
        action_clean: addItemActions.clean,
        action_replace: addItemActions.replace,
        action_adjust: addItemActions.adjust,
      });
      toast.success('Item adicionado!');
      setShowAddItemModal(false);
      setAddItemName('');
      setAddItemActions({ check: false, clean: false, replace: false, adjust: false });
      await loadDetail(selectedTemplate);
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || err));
    }
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedTemplate) return;
    try {
      await maintenancePlanService.removeItem(itemId);
      toast.success('Item removido');
      await loadDetail(selectedTemplate);
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || err));
    }
  };

  // Register execution
  const handleExecution = async () => {
    if (!selectedTemplate) return;
    try {
      await maintenancePlanService.createExecution({
        template_id: selectedTemplate.id!,
        executed_by: execData.mechanic,
        horimeter_reading: execData.horimeter ? Number(execData.horimeter) : undefined,
        notes: execData.notes,
      });
      toast.success('Execução registrada!');
      setShowExecModal(false);
      setExecData({ mechanic: '', horimeter: '', notes: '' });
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || err));
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!reportDateFrom || !reportDateTo) {
      toast.error('Selecione o período');
      return;
    }
    setReportLoading(true);
    try {
      let data = await maintenancePlanService.getMaintenanceReport(reportDateFrom, reportDateTo);
      // Filter by selected equipment if any
      if (selectedEquipIds.size > 0) {
        data = data.filter(r => r.template.id && selectedEquipIds.has(r.template.id));
      }
      setReportData(data);
      if (data.length === 0) {
        toast('Nenhuma OS encontrada no período', { icon: '⚠️' });
      }
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || err));
    } finally {
      setReportLoading(false);
    }
  };

  // Import WhatsApp chat (supports .txt and .zip)
  const handleImportWhatsApp = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.zip';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        let text = '';
        const photoMap: Record<string, string> = {};
        if (file.name.endsWith('.zip')) {
          // Import JSZip dynamically
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(file);
          // Find _chat.txt inside zip
          const chatFile = Object.keys(zip.files).find(name =>
            name.endsWith('.txt') && (name.includes('chat') || name.includes('_chat'))
          ) || Object.keys(zip.files).find(name => name.endsWith('.txt'));
          if (!chatFile) {
            toast.error('Arquivo _chat.txt não encontrado no ZIP');
            return;
          }
          text = await zip.files[chatFile].async('string');

          // Extract photos from zip
          const imageFiles = Object.keys(zip.files).filter(name =>
            /\.(jpg|jpeg|png|webp)$/i.test(name) && !zip.files[name].dir
          );
          let photoCount = 0;
          for (const imgName of imageFiles) {
            try {
              const imgData = await zip.files[imgName].async('base64');
              const ext = imgName.split('.').pop()?.toLowerCase() || 'jpg';
              const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
              // Store with just the filename (no path) as key
              const baseName = imgName.split('/').pop() || imgName;
              photoMap[baseName] = `data:${mimeType};base64,${imgData}`;
              photoCount++;
            } catch { /* skip corrupt images */ }
          }
          toast.success(`ZIP extraído: ${chatFile} + ${photoCount} fotos`);
        } else {
          text = await file.text();
        }
        const messages = parseWhatsAppChat(text);
        setWhatsAppMessages(messages);
        setWhatsAppPhotos(photoMap);
        const stats = getChatStats(messages);
        setWhatsAppStats(stats);
        setWhatsAppLoaded(true);
        setShowWhatsApp(true);
        const photoTotal = Object.keys(photoMap).length;
        toast.success(`WhatsApp importado! ${stats.totalMessages} mensagens, ${photoTotal > 0 ? photoTotal + ' fotos carregadas' : stats.totalPhotos + ' fotos referenciadas'}`);
      } catch (err: any) {
        toast.error('Erro ao importar: ' + (err.message || err));
      }
    };
    input.click();
  };

  // Export report PDF
  const handleExportReportPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Gere o relatório antes de exportar');
      return;
    }

    // Build WhatsApp groups filtered by period
    let filteredWhatsGroups: WhatsAppEquipmentGroup[] | undefined;
    if (showWhatsApp && whatsAppMessages.length > 0) {
      const filtered = filterMessages(whatsAppMessages, reportDateFrom, reportDateTo, undefined, true);
      filteredWhatsGroups = groupByEquipment(filtered);
    }

    generateMaintenanceReportPDF(reportData, {
      dateFrom: reportDateFrom,
      dateTo: reportDateTo,
      showValues,
      showWhatsApp,
      showPhotos,
      whatsappMessages: filteredWhatsGroups,
      whatsappPhotos: Object.keys(whatsAppPhotos).length > 0 ? whatsAppPhotos : undefined,
    });
    toast.success('PDF do relatório gerado!');
  };

  // Filter templates
  const filteredTemplates = templates.filter(t =>
    !searchTerm ||
    t.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.fleet_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.model || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ClipboardCheck className="text-[#007a33]" size={28} />
            Plano de Manutenção
          </h1>
          <p className="text-slate-500 mt-1">Controle preventivo por equipamento • Relatórios para Bunge</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-6 bg-slate-900 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab('plans'); setSelectedTemplate(null); }}
          className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-[#007a33] text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardCheck size={14} /> Planos
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === 'report'
              ? 'bg-[#007a33] text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 size={14} /> Relatório
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB: PLANOS */}
      {/* ============================================================ */}
      {activeTab === 'plans' && !selectedTemplate && (
        <div>
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar equipamento..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:border-[#007a33] focus:outline-none"
              />
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Importar Planilha
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#007a33]" />
            </div>
          )}

          {/* Empty */}
          {!loading && templates.length === 0 && (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
              <ClipboardCheck size={48} className="mx-auto text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">Nenhum plano cadastrado</h3>
              <p className="text-slate-600 text-sm mb-6">
                Importe os 16 equipamentos da planilha Excel para começar
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-6 py-3 bg-[#007a33] hover:bg-[#006028] text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {seeding ? 'Importando...' : 'Importar da Planilha'}
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => loadDetail(t)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left hover:border-[#007a33]/50 hover:bg-slate-900/80 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{getEquipIcon(t.asset_name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm uppercase tracking-tight truncate text-white group-hover:text-[#007a33] transition-colors">
                        {t.fleet_number || t.asset_name}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
                        {t.asset_name}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Marca:</span>
                      <span className="text-slate-400 font-bold">{t.brand || '-'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Modelo:</span>
                      <span className="text-slate-400">{t.model || '-'}</span>
                    </div>
                    {t.serial_number && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Série:</span>
                        <span className="text-slate-500 font-mono text-[10px]">{t.serial_number.slice(0, 15)}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* DETAIL VIEW */}
      {/* ============================================================ */}
      {activeTab === 'plans' && selectedTemplate && (
        <div>
          {/* Back + Actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ChevronRight size={16} className="rotate-180" /> Voltar
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#007a33] hover:bg-[#006028] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <FileText size={14} /> Exportar PDF
              </button>
              <button
                onClick={() => setShowExecModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <CheckSquare size={14} /> Registrar Execução
              </button>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Plus size={14} /> Adicionar Item
              </button>
            </div>
          </div>

          {/* Equipment Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">{getEquipIcon(selectedTemplate.asset_name)}</div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {selectedTemplate.fleet_number} - {selectedTemplate.asset_name}
                </h2>
                <p className="text-slate-500 text-sm">
                  {selectedTemplate.brand} {selectedTemplate.model}
                  {selectedTemplate.serial_number ? ` • ${selectedTemplate.serial_number}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Items by Interval */}
          {selectedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Wrench size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum item cadastrado neste plano</p>
            </div>
          ) : (
            <div className="space-y-4">
              {INTERVAL_ORDER.map(interval => {
                const grouped = groupItemsByInterval(selectedItems);
                const categories = grouped[interval];
                if (!categories) return null;

                const isExpanded = expandedIntervals[interval] !== false;
                const totalItems = Object.values(categories).reduce((s, arr) => s + arr.length, 0);

                return (
                  <div key={interval} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {/* Interval Header */}
                    <button
                      onClick={() => setExpandedIntervals(prev => ({ ...prev, [interval]: !isExpanded }))}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown size={16} className="text-[#007a33]" /> : <ChevronRight size={16} className="text-slate-500" />}
                        <span className="font-black text-sm uppercase tracking-tight text-white">
                          {INTERVAL_LABELS[interval] || interval}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                        {totalItems} itens
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-800">
                        {Object.entries(categories).map(([category, catItems]) => (
                          <div key={category}>
                            {/* Category Header */}
                            <div className="px-5 py-2 bg-slate-800/50 border-b border-slate-800">
                              <span className="text-[10px] font-black text-[#007a33] uppercase tracking-[0.3em]">
                                {CATEGORY_LABELS[category] || category}
                              </span>
                            </div>

                            {/* Items Table */}
                            <table className="w-full">
                              <thead>
                                <tr className="text-[10px] text-slate-600 uppercase tracking-wider">
                                  <th className="text-left px-5 py-2 font-bold">Serviço</th>
                                  <th className="text-center px-2 py-2 font-bold w-20">Verificar</th>
                                  <th className="text-center px-2 py-2 font-bold w-20">Limpar</th>
                                  <th className="text-center px-2 py-2 font-bold w-20">Trocar</th>
                                  <th className="text-center px-2 py-2 font-bold w-24">Ajustar</th>
                                  <th className="text-center px-2 py-2 font-bold w-12"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {catItems.map(item => (
                                  <tr key={item.id} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-2.5 text-sm text-slate-300">{item.service_name}</td>
                                    <td className="text-center">
                                      {item.action_check && <span className="text-[#007a33] font-black">✓</span>}
                                    </td>
                                    <td className="text-center">
                                      {item.action_clean && <span className="text-[#007a33] font-black">✓</span>}
                                    </td>
                                    <td className="text-center">
                                      {item.action_replace && <span className="text-[#007a33] font-black">✓</span>}
                                    </td>
                                    <td className="text-center">
                                      {item.action_adjust && <span className="text-[#007a33] font-black">✓</span>}
                                    </td>
                                    <td className="text-center">
                                      <button
                                        onClick={() => item.id && handleRemoveItem(item.id)}
                                        className="text-slate-700 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          {selectedTemplate.notes && (
            <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">OBS:</span>
              <p className="text-sm text-slate-400 mt-1">{selectedTemplate.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: RELATÓRIO */}
      {/* ============================================================ */}
      {activeTab === 'report' && (
        <div>
          {/* Period selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-[#007a33]" />
              Período do Relatório
            </h3>
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Data Início</label>
                <input
                  type="date"
                  value={reportDateFrom}
                  onChange={e => setReportDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-[#007a33] focus:outline-none"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Data Fim</label>
                <input
                  type="date"
                  value={reportDateTo}
                  onChange={e => setReportDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-[#007a33] focus:outline-none"
                />
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#007a33] hover:bg-[#006028] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Gerar Relatório
              </button>
              {reportData && reportData.length > 0 && (
                <button
                  onClick={handleExportReportPDF}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Download size={14} /> Exportar PDF
                </button>
              )}
            </div>

            {/* Equipment Selection */}
            {templates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Truck size={12} /> Equipamentos no Relatório
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const all = new Set(templates.map(t => t.id!).filter(Boolean));
                        setSelectedEquipIds(prev => prev.size === all.size ? new Set() : all);
                      }}
                      className="text-[10px] text-[#007a33] hover:text-green-300 font-bold uppercase tracking-wider"
                    >
                      {selectedEquipIds.size === templates.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>
                    <span className="text-[10px] text-slate-600">
                      {selectedEquipIds.size === 0 ? 'Todos' : `${selectedEquipIds.size}/${templates.length}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {templates.map(t => {
                    const isSelected = selectedEquipIds.size === 0 || selectedEquipIds.has(t.id!);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedEquipIds(prev => {
                            const next = new Set(prev);
                            // If no selection (all mode), switch to single selection
                            if (prev.size === 0) {
                              templates.forEach(tt => { if (tt.id !== t.id) next.add(tt.id!); });
                              return next;
                            }
                            if (next.has(t.id!)) {
                              next.delete(t.id!);
                              // If removing last one, clear to "all" mode
                              if (next.size === 0) return new Set();
                            } else {
                              next.add(t.id!);
                              // If all selected, clear to "all" mode
                              if (next.size === templates.length) return new Set();
                            }
                            return next;
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          isSelected
                            ? 'bg-[#007a33]/20 border-[#007a33]/50 text-[#007a33]'
                            : 'bg-slate-800/50 border-slate-700/30 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {t.fleet_number}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Report Options */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opções PDF:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showValues}
                  onChange={e => setShowValues(e.target.checked)}
                  className="accent-[#007a33] w-4 h-4"
                />
                <span className="text-xs text-slate-300">Incluir valores (R$)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWhatsApp}
                  onChange={e => setShowWhatsApp(e.target.checked)}
                  disabled={!whatsAppLoaded}
                  className="accent-[#007a33] w-4 h-4"
                />
                <span className={`text-xs ${whatsAppLoaded ? 'text-slate-300' : 'text-slate-600'}`}>Incluir WhatsApp</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhotos}
                  onChange={e => setShowPhotos(e.target.checked)}
                  className="accent-[#007a33] w-4 h-4"
                />
                <span className="text-xs text-slate-300">Incluir fotos</span>
              </label>

              <div className="h-5 w-px bg-slate-800" />

              <button
                onClick={handleImportWhatsApp}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  whatsAppLoaded
                    ? 'bg-green-900/30 border border-green-700/50 text-green-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.628-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.593-5.932-1.618l-.424-.252-2.746.87.897-2.66-.278-.44A9.79 9.79 0 012.182 12c0-5.416 4.402-9.818 9.818-9.818S21.818 6.584 21.818 12s-4.402 9.818-9.818 9.818z"/></svg>
                {whatsAppLoaded ? `WhatsApp ✓ (${whatsAppStats?.totalMessages || 0} msgs)` : 'Importar Chat WhatsApp'}
              </button>
            </div>
          </div>

          {/* Report Results */}
          {reportLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#007a33]" />
              <span className="ml-3 text-slate-400">Cruzando dados de OS...</span>
            </div>
          )}

          {reportData && reportData.length === 0 && !reportLoading && (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
              <AlertCircle size={40} className="mx-auto text-amber-500/50 mb-3" />
              <h3 className="text-base font-bold text-slate-400">Nenhuma OS encontrada</h3>
              <p className="text-slate-600 text-sm mt-1">Ajuste o período e tente novamente</p>
            </div>
          )}

          {reportData && reportData.length > 0 && !reportLoading && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total OS</div>
                  <div className="text-2xl font-black text-white">
                    {reportData.reduce((s, r) => s + r.serviceOrders.length + r.maintenanceOrders.length, 0)}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preventivas</div>
                  <div className="text-2xl font-black text-[#007a33]">
                    {reportData.reduce((s, r) => s + r.totalPreventive, 0)}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corretivas</div>
                  <div className="text-2xl font-black text-red-400">
                    {reportData.reduce((s, r) => s + r.totalCorrective, 0)}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Custo Total</div>
                  <div className="text-xl font-black text-white">
                    R$ {reportData.reduce((s, r) => s + r.totalCost, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Equipment Detail */}
              {reportData.map((report, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Equipment header */}
                  <div className="bg-[#007a33]/10 border-b border-[#007a33]/20 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getEquipIcon(report.template.asset_name)}</span>
                      <div>
                        <div className="font-black text-sm uppercase tracking-tight text-white">
                          {report.template.fleet_number} - {report.template.asset_name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {report.template.brand} {report.template.model}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">
                        {report.serviceOrders.length + report.maintenanceOrders.length} OS
                      </span>
                      <span className="font-bold text-white">
                        R$ {report.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* OS List */}
                  <div className="divide-y divide-slate-800/50">
                    {report.serviceOrders.map((so: any, soIdx: number) => (
                      <div key={soIdx} className="px-5 py-3 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              OS #{so.order_number || so.id?.slice(0, 6)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {so.entry_date ? new Date(so.entry_date).toLocaleDateString('pt-BR') : '-'}
                            </span>
                            {so.technician_name && (
                              <span className="text-xs text-slate-500">• {so.technician_name}</span>
                            )}
                          </div>
                          {Number(so.total_value || 0) > 0 && (
                            <span className="text-xs font-bold text-slate-300">
                              R$ {Number(so.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        {(so.service_1 || so.service_memo) && (
                          <p className="text-xs text-slate-500 ml-1 truncate">
                            {[so.service_1, so.service_2, so.service_3].filter(Boolean).join('; ')}
                          </p>
                        )}
                        {/* Items */}
                        {so.service_order_items && so.service_order_items.length > 0 && (
                          <div className="mt-2 ml-4 space-y-0.5">
                            {so.service_order_items.slice(0, 5).map((item: any, iIdx: number) => (
                              <div key={iIdx} className="text-[11px] text-slate-600 flex justify-between">
                                <span>{item.quantity || 1}x {item.description || item.item_description}</span>
                                <span className="font-mono">
                                  R$ {Number(item.total || item.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                            {so.service_order_items.length > 5 && (
                              <div className="text-[10px] text-slate-600">+{so.service_order_items.length - 5} itens</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {report.maintenanceOrders.map((mo: any, moIdx: number) => (
                      <div key={`mo-${moIdx}`} className="px-5 py-3 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            mo.type === 'PREVENTIVE'
                              ? 'bg-[#007a33]/20 text-[#007a33]'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {mo.type === 'PREVENTIVE' ? 'PREVENTIVA' : 'CORRETIVA'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {mo.opened_at ? new Date(mo.opened_at).toLocaleDateString('pt-BR') : '-'}
                          </span>
                          {mo.mechanic && <span className="text-xs text-slate-500">• {mo.mechanic}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{mo.description || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Add Item */}
      {/* ============================================================ */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black uppercase tracking-tight">Adicionar Item</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Intervalo</label>
                <select
                  value={addItemInterval}
                  onChange={e => setAddItemInterval(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                >
                  {INTERVAL_ORDER.map(i => (
                    <option key={i} value={i}>{INTERVAL_LABELS[i]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Categoria</label>
                <select
                  value={addItemCategory}
                  onChange={e => setAddItemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome do Serviço</label>
                <input
                  type="text"
                  value={addItemName}
                  onChange={e => setAddItemName(e.target.value)}
                  placeholder="Ex: FILTRO DE AR PRIMÁRIO"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Ações</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'check', label: 'Verificar' },
                    { key: 'clean', label: 'Limpar' },
                    { key: 'replace', label: 'Trocar' },
                    { key: 'adjust', label: 'Ajustar' },
                  ].map(a => (
                    <label key={a.key} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750">
                      <input
                        type="checkbox"
                        checked={(addItemActions as any)[a.key]}
                        onChange={e => setAddItemActions(prev => ({ ...prev, [a.key]: e.target.checked }))}
                        className="accent-[#007a33]"
                      />
                      <span className="text-xs text-slate-300">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddItemModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={!addItemName.trim()}
                className="flex-1 py-2.5 bg-[#007a33] hover:bg-[#006028] text-white rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Register Execution */}
      {/* ============================================================ */}
      {showExecModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black uppercase tracking-tight">Registrar Execução</h3>
              <button onClick={() => setShowExecModal(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mecânico</label>
                <input
                  type="text"
                  value={execData.mechanic}
                  onChange={e => setExecData(prev => ({ ...prev, mechanic: e.target.value }))}
                  placeholder="Nome do mecânico"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Horímetro</label>
                <input
                  type="number"
                  value={execData.horimeter}
                  onChange={e => setExecData(prev => ({ ...prev, horimeter: e.target.value }))}
                  placeholder="Leitura atual"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Observações</label>
                <textarea
                  value={execData.notes}
                  onChange={e => setExecData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Notas sobre a execução..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExecModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                Cancelar
              </button>
              <button
                onClick={handleExecution}
                className="flex-1 py-2.5 bg-[#007a33] hover:bg-[#006028] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePlan;
