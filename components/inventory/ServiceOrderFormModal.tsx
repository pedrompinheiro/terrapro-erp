/**
 * ServiceOrderFormModal — Modal completo para criar/editar Ordens de Serviço
 * 4 abas: Cliente/Equip | Defeitos/Itens | Financeiro | Checklist/Obs
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, User, Wrench, DollarSign, ClipboardList, Plus, Trash2, Search,
  AlertTriangle, Save, Loader2, ChevronRight, Package, FileText,
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import showToast from '../../lib/toast';
import type {
  ServiceOrder, ServiceOrderItem, ServiceOrderStatus, ServiceOrderLineItem,
  ChecklistItem, OSFormTab, InventoryItem, Asset, Technician,
} from '../../types';

// ====================== PROPS ======================
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editOrder?: ServiceOrder | null;
  statuses: ServiceOrderStatus[];
}

// ====================== FORM STATE ======================
interface FormState {
  is_order: boolean;
  is_quote: boolean;
  is_call: boolean;
  entry_date: string;
  entry_time: string;
  exit_date: string;
  exit_time: string;
  client_name: string;
  client_contact: string;
  client_phone: string;
  client_whatsapp: string;
  equipment_name: string;
  model_name: string;
  brand_name: string;
  plate: string;
  color: string;
  km: number;
  year_fab: string;
  year_model: string;
  fuel_type: string;
  serial_number: string;
  accessories: string;
  asset_id: string;
  situation: string;
  situation_code: number | null;
  defect_1: string;
  defect_2: string;
  defect_memo: string;
  findings_memo: string;
  service_1: string;
  service_2: string;
  service_3: string;
  service_4: string;
  service_5: string;
  service_memo: string;
  technician_code: number | null;
  technician_name: string;
  responsible: string;
  products_value: number;
  services_value: number;
  labor_value: number;
  displacement_value: number;
  discount_value: number;
  total_value: number;
  payment_form: string;
  payment_conditions: string;
  is_paid: boolean;
  observations: string;
  general_notes_memo: string;
  photo_1_url: string;
  photo_2_url: string;
  photo_3_url: string;
  photo_4_url: string;
  has_checklist: boolean;
  checklist: ChecklistItem[];
  checklist_fuel: string;
  checklist_oil: string;
  checklist_radiator: string;
  status: boolean;
}

const EMPTY_FORM: FormState = {
  is_order: true, is_quote: false, is_call: false,
  entry_date: new Date().toISOString().slice(0, 10),
  entry_time: new Date().toTimeString().slice(0, 5),
  exit_date: '', exit_time: '',
  client_name: '', client_contact: '', client_phone: '', client_whatsapp: '',
  equipment_name: '', model_name: '', brand_name: '', plate: '', color: '',
  km: 0, year_fab: '', year_model: '', fuel_type: '', serial_number: '', accessories: '',
  asset_id: '',
  situation: 'Na bancada', situation_code: 7,
  defect_1: '', defect_2: '', defect_memo: '', findings_memo: '',
  service_1: '', service_2: '', service_3: '', service_4: '', service_5: '', service_memo: '',
  technician_code: null, technician_name: '', responsible: '',
  products_value: 0, services_value: 0, labor_value: 0, displacement_value: 0,
  discount_value: 0, total_value: 0,
  payment_form: '', payment_conditions: '', is_paid: false,
  observations: '', general_notes_memo: '',
  photo_1_url: '', photo_2_url: '', photo_3_url: '', photo_4_url: '',
  has_checklist: false, checklist: [],
  checklist_fuel: '', checklist_oil: '', checklist_radiator: '',
  status: true,
};

const TABS: { key: OSFormTab; label: string; icon: React.ReactNode }[] = [
  { key: 'cliente', label: 'Cliente / Equip.', icon: <User size={14} /> },
  { key: 'servicos', label: 'Itens / Servicos', icon: <Wrench size={14} /> },
  { key: 'financeiro', label: 'Financeiro', icon: <DollarSign size={14} /> },
  { key: 'extras', label: 'Checklist / Obs', icon: <ClipboardList size={14} /> },
];

const PAYMENT_OPTIONS = [
  'Dinheiro', 'Pix', 'Cartao Credito', 'Cartao Debito', 'Boleto', 'Cheque', 'Transferencia', 'A combinar',
];

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

let _lineKey = 0;
const nextKey = () => `_os_${++_lineKey}`;

// ====================== COMPONENT ======================
const ServiceOrderFormModal: React.FC<Props> = ({
  isOpen, onClose, onSaved, editOrder, statuses,
}) => {
  const [activeTab, setActiveTab] = useState<OSFormTab>('cliente');
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [items, setItems] = useState<ServiceOrderLineItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // --- Client autocomplete ---
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<any[]>([]);
  const [showClientDD, setShowClientDD] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);
  const clientTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Equipment autocomplete ---
  const [equipSearch, setEquipSearch] = useState('');
  const [equipResults, setEquipResults] = useState<Asset[]>([]);
  const [showEquipDD, setShowEquipDD] = useState(false);
  const equipRef = useRef<HTMLDivElement>(null);
  const equipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Technician autocomplete ---
  const [techSearch, setTechSearch] = useState('');
  const [techResults, setTechResults] = useState<Technician[]>([]);
  const [showTechDD, setShowTechDD] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);
  const techTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Per-row product search ---
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [prodResults, setProdResults] = useState<InventoryItem[]>([]);
  const [showProdDD, setShowProdDD] = useState(false);
  const prodTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isReadonly = !!(editOrder && (
    editOrder.situation === 'FINALIZADA' ||
    editOrder.situation === 'FECHAMENTO' ||
    editOrder.situation === 'CANCELADO'
  ));

  // ====================== INIT ======================
  useEffect(() => {
    if (!isOpen) return;
    _lineKey = 0;
    if (editOrder) {
      setForm({
        is_order: editOrder.is_order ?? true,
        is_quote: editOrder.is_quote ?? false,
        is_call: editOrder.is_call ?? false,
        entry_date: editOrder.entry_date || '',
        entry_time: editOrder.entry_time || '',
        exit_date: editOrder.exit_date || '',
        exit_time: editOrder.exit_time || '',
        client_name: editOrder.client_name || '',
        client_contact: editOrder.client_contact || '',
        client_phone: editOrder.client_phone || '',
        client_whatsapp: editOrder.client_whatsapp || '',
        equipment_name: editOrder.equipment_name || '',
        model_name: editOrder.model_name || '',
        brand_name: editOrder.brand_name || '',
        plate: editOrder.plate || '',
        color: editOrder.color || '',
        km: editOrder.km || 0,
        year_fab: editOrder.year_fab ? String(editOrder.year_fab) : '',
        year_model: editOrder.year_model ? String(editOrder.year_model) : '',
        fuel_type: editOrder.fuel_type || '',
        serial_number: editOrder.serial_number || '',
        accessories: '', asset_id: '',
        situation: editOrder.situation || 'Na bancada',
        situation_code: editOrder.situation_code ?? null,
        defect_1: editOrder.defect_1 || '', defect_2: editOrder.defect_2 || '',
        defect_memo: editOrder.defect_memo || '', findings_memo: editOrder.findings_memo || '',
        service_1: editOrder.service_1 || '', service_2: editOrder.service_2 || '',
        service_3: editOrder.service_3 || '', service_4: editOrder.service_4 || '',
        service_5: editOrder.service_5 || '', service_memo: editOrder.service_memo || '',
        technician_code: editOrder.technician_code ?? null,
        technician_name: editOrder.technician_name || '',
        responsible: editOrder.responsible || '',
        products_value: editOrder.products_value || 0,
        services_value: editOrder.services_value || 0,
        labor_value: editOrder.labor_value || 0,
        displacement_value: editOrder.displacement_value || 0,
        discount_value: editOrder.discount_value || 0,
        total_value: editOrder.total_value || 0,
        payment_form: editOrder.payment_form || '',
        payment_conditions: editOrder.payment_conditions || '',
        is_paid: editOrder.is_paid ?? false,
        observations: editOrder.observations || '',
        general_notes_memo: editOrder.general_notes_memo || '',
        photo_1_url: '', photo_2_url: '', photo_3_url: '', photo_4_url: '',
        has_checklist: false, checklist: [],
        checklist_fuel: '', checklist_oil: '', checklist_radiator: '',
        status: editOrder.status ?? true,
      });
      setClientSearch(editOrder.client_name || '');
      setEquipSearch(editOrder.equipment_name || '');
      setTechSearch(editOrder.technician_name || '');
      setOrderNumber(editOrder.order_number);
      loadItems(editOrder.id);
    } else {
      setForm({ ...EMPTY_FORM });
      setItems([]);
      setClientSearch('');
      setEquipSearch('');
      setTechSearch('');
      setActiveTab('cliente');
      fetchNextNumber();
    }
  }, [isOpen, editOrder]);

  const fetchNextNumber = async () => {
    try {
      const n = await inventoryService.getNextServiceOrderNumber();
      setOrderNumber(n);
    } catch { setOrderNumber(null); }
  };

  const loadItems = async (osId: string) => {
    setLoadingItems(true);
    try {
      const data = await inventoryService.getServiceOrderItems(osId);
      setItems(data.map((d: ServiceOrderItem) => ({
        _key: nextKey(),
        id: d.id,
        item_id: d.item_id,
        product_code: d.product_code,
        description: d.description,
        reference: d.reference || '',
        is_service: d.is_service,
        is_product: d.is_product,
        unit: d.unit,
        unit_cost: d.unit_cost,
        unit_price: d.unit_price,
        quantity: d.quantity,
        discount: d.discount,
        discount_percent: d.discount_percent,
        total: d.total,
        commission: d.commission || 0,
        technician_code: d.technician_code,
        technician_name: d.technician_name || '',
        item_date: d.item_date || '',
        _searchText: d.description,
      })));
    } catch { /* ignore */ }
    setLoadingItems(false);
  };

  // ====================== FINANCIAL CALC ======================
  useEffect(() => {
    const prodTotal = items.filter(i => i.is_product).reduce((s, i) => s + i.total, 0);
    const servTotal = items.filter(i => i.is_service).reduce((s, i) => s + i.total, 0);
    setForm(prev => {
      const total = prodTotal + servTotal + prev.labor_value + prev.displacement_value - prev.discount_value;
      return { ...prev, products_value: prodTotal, services_value: servTotal, total_value: Math.max(0, total) };
    });
  }, [items, form.labor_value, form.displacement_value, form.discount_value]);

  // ====================== CLOSE DROPDOWNS ON CLICK OUTSIDE ======================
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setShowClientDD(false);
      if (equipRef.current && !equipRef.current.contains(e.target as Node)) setShowEquipDD(false);
      if (techRef.current && !techRef.current.contains(e.target as Node)) setShowTechDD(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ====================== AUTOCOMPLETE HANDLERS ======================
  const handleClientSearch = (val: string) => {
    setClientSearch(val);
    setForm(prev => ({ ...prev, client_name: val }));
    if (clientTimeout.current) clearTimeout(clientTimeout.current);
    if (val.trim().length < 2) { setClientResults([]); setShowClientDD(false); return; }
    clientTimeout.current = setTimeout(async () => {
      const res = await inventoryService.searchClients(val);
      setClientResults(res);
      setShowClientDD(res.length > 0);
    }, 300);
  };

  const selectClient = (c: any) => {
    setForm(prev => ({
      ...prev,
      client_name: c.name,
      client_phone: c.phone || prev.client_phone,
      client_whatsapp: c.phone2 || prev.client_whatsapp,
      client_contact: c.name,
    }));
    setClientSearch(c.name);
    setShowClientDD(false);
  };

  const handleEquipSearch = (val: string) => {
    setEquipSearch(val);
    setForm(prev => ({ ...prev, equipment_name: val }));
    if (equipTimeout.current) clearTimeout(equipTimeout.current);
    if (val.trim().length < 2) { setEquipResults([]); setShowEquipDD(false); return; }
    equipTimeout.current = setTimeout(async () => {
      const res = await inventoryService.getEquipments(val);
      setEquipResults(res);
      setShowEquipDD(res.length > 0);
    }, 300);
  };

  const selectEquipment = (a: Asset) => {
    setForm(prev => ({
      ...prev,
      equipment_name: a.name,
      model_name: a.model || prev.model_name,
      brand_name: a.brand || prev.brand_name,
      plate: a.code || prev.plate,
      asset_id: a.id,
    }));
    setEquipSearch(a.name);
    setShowEquipDD(false);
  };

  const handleTechSearch = (val: string) => {
    setTechSearch(val);
    setForm(prev => ({ ...prev, technician_name: val }));
    if (techTimeout.current) clearTimeout(techTimeout.current);
    if (val.trim().length < 2) { setTechResults([]); setShowTechDD(false); return; }
    techTimeout.current = setTimeout(async () => {
      const all = await inventoryService.getTechnicians({ activeOnly: true });
      const term = val.toLowerCase();
      const filtered = (all || []).filter(t => t.name.toLowerCase().includes(term));
      setTechResults(filtered.slice(0, 15));
      setShowTechDD(filtered.length > 0);
    }, 300);
  };

  const selectTech = (t: Technician) => {
    setForm(prev => ({
      ...prev,
      technician_code: t.code,
      technician_name: t.name,
    }));
    setTechSearch(t.name);
    setShowTechDD(false);
  };

  // ====================== LINE ITEMS ======================
  const addItem = (isService = false) => {
    setItems(prev => [...prev, {
      _key: nextKey(),
      description: '', reference: '',
      is_service: isService, is_product: !isService,
      unit: 'UNI', unit_cost: 0, unit_price: 0,
      quantity: 1, discount: 0, discount_percent: 0, total: 0,
      commission: 0, technician_name: form.technician_name,
      technician_code: form.technician_code ?? undefined,
      item_date: new Date().toISOString().slice(0, 10),
    }]);
  };

  const removeItem = (key: string) => setItems(prev => prev.filter(r => r._key !== key));

  const updateItem = (key: string, field: string, value: any) => {
    setItems(prev => prev.map(row => {
      if (row._key !== key) return row;
      const updated: any = { ...row, [field]: value };
      if (['unit_price', 'quantity', 'discount', 'discount_percent'].includes(field)) {
        const sub = updated.unit_price * updated.quantity;
        if (field === 'discount_percent') {
          updated.discount = Math.round(sub * (updated.discount_percent / 100) * 100) / 100;
        }
        updated.total = Math.round((sub - updated.discount) * 100) / 100;
      }
      if (field === 'quantity' && updated.is_product && updated._stockQty !== undefined) {
        updated._stockWarning = updated.quantity > updated._stockQty;
      }
      return updated;
    }));
  };

  const handleProductSearch = (key: string, val: string) => {
    updateItem(key, '_searchText', val);
    updateItem(key, 'description', val);
    setActiveRow(key);
    if (prodTimeout.current) clearTimeout(prodTimeout.current);
    if (val.trim().length < 2) { setProdResults([]); setShowProdDD(false); return; }
    prodTimeout.current = setTimeout(async () => {
      const res = await inventoryService.getItems({ search: val, pageSize: 15 });
      setProdResults(res.data);
      setShowProdDD(res.data.length > 0);
    }, 300);
  };

  const selectProduct = (key: string, p: InventoryItem) => {
    setItems(prev => prev.map(row => {
      if (row._key !== key) return row;
      return {
        ...row,
        item_id: p.id,
        product_code: p.code != null ? Math.floor(Number(p.code)) : null,
        description: p.description,
        reference: p.sku || '',
        unit: p.unit || 'UNI',
        unit_cost: p.cost_price || 0,
        unit_price: p.sell_price || p.cost_price || 0,
        is_service: p.is_service ?? false,
        is_product: p.is_product ?? true,
        total: (p.sell_price || p.cost_price || 0) * row.quantity,
        _searchText: p.description,
        _stockQty: p.qty_current || 0,
        _stockWarning: row.quantity > (p.qty_current || 0),
      };
    }));
    setShowProdDD(false);
    setActiveRow(null);
  };

  // ====================== CHECKLIST ======================
  const addChecklistItem = () => {
    setForm(prev => ({
      ...prev,
      checklist: [...prev.checklist, { label: '', checked: false }],
    }));
  };

  const updateChecklistItem = (idx: number, field: keyof ChecklistItem, value: any) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.map((c, i) => i === idx ? { ...c, [field]: value } : c),
    }));
  };

  const removeChecklistItem = (idx: number) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== idx),
    }));
  };

  // ====================== SAVE ======================
  const handleSave = async () => {
    if (!form.client_name.trim()) {
      showToast.error('Informe o nome do cliente.');
      setActiveTab('cliente');
      return;
    }
    if (!form.entry_date) {
      showToast.error('Informe a data de entrada.');
      setActiveTab('cliente');
      return;
    }
    // Validate items
    for (const item of items) {
      if (!item.description.trim()) {
        showToast.error('Todos os itens precisam de descricao.');
        setActiveTab('servicos');
        return;
      }
      if (item.quantity <= 0) {
        showToast.error(`Item "${item.description}" com quantidade invalida.`);
        setActiveTab('servicos');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        is_order: form.is_order,
        is_quote: form.is_quote,
        is_call: form.is_call,
        entry_date: form.entry_date || null,
        entry_time: form.entry_time || null,
        exit_date: form.exit_date || null,
        exit_time: form.exit_time || null,
        client_name: form.client_name,
        client_contact: form.client_contact || null,
        client_phone: form.client_phone || null,
        client_whatsapp: form.client_whatsapp || null,
        equipment_name: form.equipment_name || null,
        model_name: form.model_name || null,
        brand_name: form.brand_name || null,
        plate: form.plate || null,
        color: form.color || null,
        km: form.km || 0,
        year_fab: form.year_fab ? Number(form.year_fab) : null,
        year_model: form.year_model ? Number(form.year_model) : null,
        fuel_type: form.fuel_type || null,
        serial_number: form.serial_number || null,
        asset_id: form.asset_id || null,
        situation: form.situation || 'Na bancada',
        situation_code: form.situation_code != null ? Math.floor(Number(form.situation_code)) : null,
        defect_1: form.defect_1 || null,
        defect_2: form.defect_2 || null,
        defect_memo: form.defect_memo || null,
        findings_memo: form.findings_memo || null,
        service_1: form.service_1 || null,
        service_2: form.service_2 || null,
        service_3: form.service_3 || null,
        service_4: form.service_4 || null,
        service_5: form.service_5 || null,
        service_memo: form.service_memo || null,
        technician_code: form.technician_code != null ? Math.floor(Number(form.technician_code)) : null,
        technician_name: form.technician_name || null,
        responsible: form.responsible || null,
        products_value: form.products_value,
        services_value: form.services_value,
        labor_value: form.labor_value,
        displacement_value: form.displacement_value,
        discount_value: form.discount_value,
        total_value: form.total_value,
        payment_form: form.payment_form || null,
        payment_conditions: form.payment_conditions || null,
        is_paid: form.is_paid,
        observations: form.observations || null,
        general_notes_memo: form.general_notes_memo || null,
        photo_1_url: form.photo_1_url || null,
        photo_2_url: form.photo_2_url || null,
        photo_3_url: form.photo_3_url || null,
        photo_4_url: form.photo_4_url || null,
        has_checklist: form.has_checklist,
        checklist: form.has_checklist ? form.checklist : null,
        checklist_fuel: form.checklist_fuel || null,
        checklist_oil: form.checklist_oil || null,
        checklist_radiator: form.checklist_radiator || null,
        status: form.status,
      };

      let savedOrder: ServiceOrder;
      if (editOrder) {
        savedOrder = await inventoryService.updateServiceOrder(editOrder.id, payload);
      } else {
        const num = orderNumber || (await inventoryService.getNextServiceOrderNumber());
        savedOrder = await inventoryService.createServiceOrder({ ...payload, order_number: num });
      }

      // Save line items
      if (savedOrder && items.length > 0) {
        await inventoryService.saveServiceOrderItems(
          savedOrder.id, savedOrder.order_number, items,
          form.client_name, form.plate,
        );
      }

      showToast.success(editOrder ? 'OS atualizada com sucesso!' : `OS #${savedOrder.order_number} criada!`);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar OS:', err);
      showToast.error('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  // ====================== RENDER HELPERS ======================
  const f = (field: keyof FormState) => form[field] as any;
  const set = (field: keyof FormState, val: any) => setForm(prev => ({ ...prev, [field]: val }));

  const inputCls = 'w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors';
  const labelCls = 'text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5';
  const sectionCls = 'bg-slate-950/50 border border-slate-800/50 rounded-2xl p-4 space-y-3';

  if (!isOpen) return null;

  // ====================== TAB 1: CLIENTE/EQUIPAMENTO ======================
  const renderClienteTab = () => (
    <div className="space-y-4">
      {/* Tipo da OS */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tipo do Documento</span>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'is_order', label: 'Ordem de Servico', color: 'blue' },
            { key: 'is_quote', label: 'Orcamento', color: 'amber' },
            { key: 'is_call', label: 'Chamado', color: 'purple' },
          ].map(({ key, label, color }) => (
            <button key={key} disabled={isReadonly}
              onClick={() => setForm(prev => ({
                ...prev, is_order: key === 'is_order', is_quote: key === 'is_quote', is_call: key === 'is_call',
              }))}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                f(key as keyof FormState)
                  ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                  : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Data Entrada</label>
          <input type="date" value={f('entry_date')} disabled={isReadonly}
            onChange={e => set('entry_date', e.target.value)}
            className={`${inputCls} [color-scheme:dark]`} />
        </div>
        <div>
          <label className={labelCls}>Hora Entrada</label>
          <input type="time" value={f('entry_time')} disabled={isReadonly}
            onChange={e => set('entry_time', e.target.value)}
            className={`${inputCls} [color-scheme:dark]`} />
        </div>
        <div>
          <label className={labelCls}>Data Saida</label>
          <input type="date" value={f('exit_date')} disabled={isReadonly}
            onChange={e => set('exit_date', e.target.value)}
            className={`${inputCls} [color-scheme:dark]`} />
        </div>
        <div>
          <label className={labelCls}>Hora Saida</label>
          <input type="time" value={f('exit_time')} disabled={isReadonly}
            onChange={e => set('exit_time', e.target.value)}
            className={`${inputCls} [color-scheme:dark]`} />
        </div>
      </div>

      {/* Cliente */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cliente</span>
        </div>
        <div ref={clientRef} className="relative">
          <label className={labelCls}>Nome do Cliente *</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="text" value={clientSearch} disabled={isReadonly}
              onChange={e => handleClientSearch(e.target.value)}
              placeholder="Digite para buscar clientes cadastrados..."
              className={`${inputCls} pl-9`} />
          </div>
          {showClientDD && clientResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
              {clientResults.map(c => (
                <button key={c.id} onClick={() => selectClient(c)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0">
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {c.document || 'Sem doc'} {c.phone ? `| ${c.phone}` : ''} {c.city ? `| ${c.city}/${c.state}` : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Contato</label>
            <input type="text" value={f('client_contact')} disabled={isReadonly}
              onChange={e => set('client_contact', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input type="text" value={f('client_phone')} disabled={isReadonly}
              onChange={e => set('client_phone', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input type="text" value={f('client_whatsapp')} disabled={isReadonly}
              onChange={e => set('client_whatsapp', e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Equipamento */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-1">
          <Package size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Equipamento / Veiculo</span>
        </div>
        <div ref={equipRef} className="relative">
          <label className={labelCls}>Equipamento</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="text" value={equipSearch} disabled={isReadonly}
              onChange={e => handleEquipSearch(e.target.value)}
              placeholder="Digite para buscar equipamentos cadastrados..."
              className={`${inputCls} pl-9`} />
          </div>
          {showEquipDD && equipResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
              {equipResults.map(a => (
                <button key={a.id} onClick={() => selectEquipment(a)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0">
                  <p className="text-sm font-bold text-white">{a.code} - {a.name}</p>
                  <p className="text-[10px] text-slate-500">{a.model} | {a.brand} | {a.status}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Modelo</label>
            <input type="text" value={f('model_name')} disabled={isReadonly}
              onChange={e => set('model_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Marca</label>
            <input type="text" value={f('brand_name')} disabled={isReadonly}
              onChange={e => set('brand_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Placa / Codigo</label>
            <input type="text" value={f('plate')} disabled={isReadonly}
              onChange={e => set('plate', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>KM / Horimetro</label>
            <input type="number" value={f('km') || ''} disabled={isReadonly}
              onChange={e => set('km', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ano Fab.</label>
            <input type="text" value={f('year_fab')} disabled={isReadonly}
              onChange={e => set('year_fab', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>N. Serie</label>
            <input type="text" value={f('serial_number')} disabled={isReadonly}
              onChange={e => set('serial_number', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Combustivel</label>
            <input type="text" value={f('fuel_type')} disabled={isReadonly}
              onChange={e => set('fuel_type', e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Tecnico + Situacao */}
      <div className="grid grid-cols-2 gap-4">
        <div className={sectionCls}>
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Tecnico Responsavel</span>
          </div>
          <div ref={techRef} className="relative">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input type="text" value={techSearch} disabled={isReadonly}
                onChange={e => handleTechSearch(e.target.value)}
                placeholder="Buscar tecnico..."
                className={`${inputCls} pl-9`} />
            </div>
            {showTechDD && techResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                {techResults.map(t => (
                  <button key={t.id} onClick={() => selectTech(t)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0">
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.cell_phone || t.phone || ''}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Responsavel</label>
            <input type="text" value={f('responsible')} disabled={isReadonly}
              onChange={e => set('responsible', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className={sectionCls}>
          <div className="flex items-center gap-2 mb-1">
            <ChevronRight size={14} className="text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Situacao</span>
          </div>
          <select value={f('situation')} disabled={isReadonly}
            onChange={e => {
              const st = statuses.find(s => s.name === e.target.value);
              set('situation', e.target.value);
              set('situation_code', st?.code ?? null);
            }}
            className={inputCls}>
            <option value="">Selecione...</option>
            {statuses.filter(s => s.active).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          {form.situation && (
            <div className="mt-2">
              {(() => {
                const st = statuses.find(s => s.name === form.situation);
                return st ? (
                  <span style={{ backgroundColor: `${st.color}20`, color: st.color }}
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {st.name}
                  </span>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ====================== TAB 2: DEFEITOS/SERVICOS/ITENS ======================
  const renderServicosTab = () => (
    <div className="space-y-4">
      {/* Defeitos */}
      <div className={sectionCls}>
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Defeitos Reportados</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Defeito 1</label>
            <input type="text" value={f('defect_1')} disabled={isReadonly}
              onChange={e => set('defect_1', e.target.value)} className={inputCls}
              placeholder="Descreva o defeito principal..." />
          </div>
          <div>
            <label className={labelCls}>Defeito 2</label>
            <input type="text" value={f('defect_2')} disabled={isReadonly}
              onChange={e => set('defect_2', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Detalhamento do Defeito</label>
          <textarea rows={2} value={f('defect_memo')} disabled={isReadonly}
            onChange={e => set('defect_memo', e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Descreva com mais detalhes os problemas encontrados..." />
        </div>
        <div>
          <label className={labelCls}>Constatacoes / Diagnostico</label>
          <textarea rows={2} value={f('findings_memo')} disabled={isReadonly}
            onChange={e => set('findings_memo', e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="O que foi constatado na avaliacao..." />
        </div>
      </div>

      {/* Servicos (texto livre) */}
      <div className={sectionCls}>
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Servicos Executados</span>
        <div className="grid grid-cols-2 gap-3">
          {(['service_1', 'service_2', 'service_3', 'service_4', 'service_5'] as const).map((key, i) => (
            <div key={key}>
              <label className={labelCls}>Servico {i + 1}</label>
              <input type="text" value={f(key)} disabled={isReadonly}
                onChange={e => set(key, e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
        <div>
          <label className={labelCls}>Detalhamento dos Servicos</label>
          <textarea rows={2} value={f('service_memo')} disabled={isReadonly}
            onChange={e => set('service_memo', e.target.value)}
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Itens da OS (produtos + servicos do estoque) */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pecas e Servicos (Itens)</span>
          {!isReadonly && (
            <div className="flex gap-2">
              <button onClick={() => addItem(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95">
                <Plus size={12} /> Peca
              </button>
              <button onClick={() => addItem(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95">
                <Plus size={12} /> Servico
              </button>
            </div>
          )}
        </div>

        {loadingItems ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
            <Loader2 size={18} className="animate-spin mr-2" /> Carregando itens...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs">
            <Package size={28} className="mx-auto mb-2 opacity-40" />
            Nenhum item adicionado. Clique em "+ Peca" ou "+ Servico".
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_80px_80px_60px_80px_32px] gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
              <span>Produto / Servico</span>
              <span className="text-center">Tipo</span>
              <span className="text-center">Qtd</span>
              <span className="text-center">Preco</span>
              <span className="text-center">Desc%</span>
              <span className="text-right">Total</span>
              <span></span>
            </div>
            {items.map(item => (
              <div key={item._key}
                className="grid grid-cols-[1fr_60px_80px_80px_60px_80px_32px] gap-2 items-center bg-slate-900 rounded-xl px-2 py-2 border border-slate-800/50 hover:border-slate-700 transition-colors">
                {/* Product search */}
                <div className="relative">
                  <input type="text" value={item._searchText ?? item.description} disabled={isReadonly}
                    onChange={e => handleProductSearch(item._key, e.target.value)}
                    onFocus={() => setActiveRow(item._key)}
                    placeholder="Buscar produto..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
                  {item._stockWarning && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2" title="Estoque insuficiente">
                      <AlertTriangle size={12} className="text-amber-400" />
                    </span>
                  )}
                  {showProdDD && activeRow === item._key && prodResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                      {prodResults.map(p => (
                        <button key={p.id} onClick={() => selectProduct(item._key, p)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0">
                          <p className="text-xs font-bold text-white">{p.code} - {p.description}</p>
                          <p className="text-[9px] text-slate-500">
                            {p.category_name} | Est: {p.qty_current ?? 0} | {formatCurrency(p.sell_price || 0)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Type badge */}
                <div className="text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    item.is_service
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.is_service ? 'SERV' : 'PECA'}
                  </span>
                </div>
                {/* Qty */}
                <input type="number" min="0" step="0.01" disabled={isReadonly}
                  value={item.quantity || ''}
                  onChange={e => updateItem(item._key, 'quantity', Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-blue-500 w-full" />
                {/* Price */}
                <input type="number" min="0" step="0.01" disabled={isReadonly}
                  value={item.unit_price || ''}
                  onChange={e => updateItem(item._key, 'unit_price', Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-blue-500 w-full" />
                {/* Discount % */}
                <input type="number" min="0" max="100" step="1" disabled={isReadonly}
                  value={item.discount_percent || ''}
                  onChange={e => updateItem(item._key, 'discount_percent', Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-blue-500 w-full" />
                {/* Total */}
                <div className="text-right text-xs font-bold text-emerald-400">
                  {formatCurrency(item.total)}
                </div>
                {/* Delete */}
                {!isReadonly && (
                  <button onClick={() => removeItem(item._key)}
                    className="p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {/* Totals */}
            <div className="flex justify-end pt-2 border-t border-slate-800/50">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 mr-3">Total Itens:</span>
                <span className="text-sm font-black text-emerald-400">
                  {formatCurrency(items.reduce((s, i) => s + i.total, 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ====================== TAB 3: FINANCEIRO ======================
  const renderFinanceiroTab = () => (
    <div className="space-y-4">
      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <DollarSign size={14} /> Resumo Financeiro
        </span>

        <div className="space-y-3">
          {/* Auto-calculated values */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Pecas (produtos)</span>
            <span className="text-sm font-bold text-white">{formatCurrency(form.products_value)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Servicos</span>
            <span className="text-sm font-bold text-white">{formatCurrency(form.services_value)}</span>
          </div>

          <div className="border-t border-emerald-500/20 pt-3 space-y-3">
            {/* Manual inputs */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-slate-400">Mao de Obra</label>
              <input type="number" min="0" step="0.01" disabled={isReadonly}
                value={form.labor_value || ''}
                onChange={e => set('labor_value', Number(e.target.value))}
                className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white text-right outline-none focus:border-emerald-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm text-slate-400">Deslocamento</label>
              <input type="number" min="0" step="0.01" disabled={isReadonly}
                value={form.displacement_value || ''}
                onChange={e => set('displacement_value', Number(e.target.value))}
                className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white text-right outline-none focus:border-emerald-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm text-red-400 font-bold">(-) Desconto</label>
              <input type="number" min="0" step="0.01" disabled={isReadonly}
                value={form.discount_value || ''}
                onChange={e => set('discount_value', Number(e.target.value))}
                className="w-32 bg-slate-950 border border-red-500/30 rounded-lg px-3 py-1.5 text-sm text-red-400 text-right outline-none focus:border-red-500" />
            </div>
          </div>

          <div className="border-t-2 border-emerald-500/40 pt-3 flex justify-between items-center">
            <span className="text-lg font-black text-emerald-400">TOTAL</span>
            <span className="text-2xl font-black text-emerald-400">{formatCurrency(form.total_value)}</span>
          </div>
        </div>
      </div>

      {/* Pagamento */}
      <div className={sectionCls}>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pagamento</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Forma de Pagamento</label>
            <select value={f('payment_form')} disabled={isReadonly}
              onChange={e => set('payment_form', e.target.value)}
              className={inputCls}>
              <option value="">Selecione...</option>
              {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Condicoes</label>
            <input type="text" value={f('payment_conditions')} disabled={isReadonly}
              onChange={e => set('payment_conditions', e.target.value)}
              className={inputCls} placeholder="Ex: a vista, 30 dias..." />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button disabled={isReadonly}
            onClick={() => set('is_paid', !form.is_paid)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              form.is_paid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}>
            {form.is_paid ? '✓ PAGO' : 'Nao Pago'}
          </button>
        </div>
      </div>
    </div>
  );

  // ====================== TAB 4: CHECKLIST/FOTOS/OBS ======================
  const renderExtrasTab = () => (
    <div className="space-y-4">
      {/* Checklist */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Checklist de Verificacao</span>
          <button disabled={isReadonly}
            onClick={() => set('has_checklist', !form.has_checklist)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              form.has_checklist
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-900 text-slate-600 border border-slate-800'
            }`}>
            {form.has_checklist ? 'Ativo' : 'Desativado'}
          </button>
        </div>

        {form.has_checklist && (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Nivel Combustivel</label>
                <select value={f('checklist_fuel')} disabled={isReadonly}
                  onChange={e => set('checklist_fuel', e.target.value)} className={inputCls}>
                  <option value="">-</option>
                  <option value="Vazio">Vazio</option>
                  <option value="1/4">1/4</option>
                  <option value="1/2">1/2</option>
                  <option value="3/4">3/4</option>
                  <option value="Cheio">Cheio</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Oleo</label>
                <select value={f('checklist_oil')} disabled={isReadonly}
                  onChange={e => set('checklist_oil', e.target.value)} className={inputCls}>
                  <option value="">-</option>
                  <option value="Bom">Bom</option>
                  <option value="Regular">Regular</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Critico">Critico</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Radiador</label>
                <select value={f('checklist_radiator')} disabled={isReadonly}
                  onChange={e => set('checklist_radiator', e.target.value)} className={inputCls}>
                  <option value="">-</option>
                  <option value="Bom">Bom</option>
                  <option value="Regular">Regular</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Critico">Critico</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Itens do Checklist</label>
                {!isReadonly && (
                  <button onClick={addChecklistItem}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <Plus size={10} /> Adicionar
                  </button>
                )}
              </div>
              {form.checklist.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="checkbox" checked={c.checked} disabled={isReadonly}
                    onChange={e => updateChecklistItem(idx, 'checked', e.target.checked)}
                    className="accent-purple-500 w-4 h-4" />
                  <input type="text" value={c.label} disabled={isReadonly}
                    onChange={e => updateChecklistItem(idx, 'label', e.target.value)}
                    placeholder="Descricao do item..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500" />
                  {!isReadonly && (
                    <button onClick={() => removeChecklistItem(idx)}
                      className="text-slate-600 hover:text-red-400 transition-colors">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fotos */}
      <div className={sectionCls}>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Fotos (URLs)</span>
        <div className="grid grid-cols-2 gap-3">
          {(['photo_1_url', 'photo_2_url', 'photo_3_url', 'photo_4_url'] as const).map((key, i) => (
            <div key={key}>
              <label className={labelCls}>Foto {i + 1}</label>
              <input type="url" value={f(key)} disabled={isReadonly}
                onChange={e => set(key, e.target.value)}
                placeholder="https://..."
                className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {/* Observacoes */}
      <div className={sectionCls}>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observacoes</span>
        <div>
          <label className={labelCls}>Observacoes Gerais</label>
          <textarea rows={3} value={f('observations')} disabled={isReadonly}
            onChange={e => set('observations', e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Observacoes sobre esta ordem de servico..." />
        </div>
        <div>
          <label className={labelCls}>Notas Adicionais</label>
          <textarea rows={2} value={f('general_notes_memo')} disabled={isReadonly}
            onChange={e => set('general_notes_memo', e.target.value)}
            className={`${inputCls} resize-none`} />
        </div>
      </div>
    </div>
  );

  // ====================== MAIN RENDER ======================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-white tracking-tight">
              {editOrder ? `OS #${editOrder.order_number}` : `Nova OS${orderNumber ? ` #${orderNumber}` : ''}`}
            </h3>
            {isReadonly && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                SOMENTE LEITURA
              </span>
            )}
            {form.is_quote && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">ORCAMENTO</span>}
            {form.is_call && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">CHAMADO</span>}
          </div>
          <button onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-2 border-b border-slate-800 flex gap-1 bg-slate-950/30 shrink-0">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'cliente' && renderClienteTab()}
          {activeTab === 'servicos' && renderServicosTab()}
          {activeTab === 'financeiro' && renderFinanceiroTab()}
          {activeTab === 'extras' && renderExtrasTab()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {items.length > 0 && (
              <span>{items.length} ite{items.length > 1 ? 'ns' : 'm'} | Total: <b className="text-emerald-400">{formatCurrency(form.total_value)}</b></span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all">
              {isReadonly ? 'Fechar' : 'Cancelar'}
            </button>
            {!isReadonly && (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                ) : (
                  <><Save size={14} /> {editOrder ? 'Atualizar OS' : 'Criar OS'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderFormModal;
