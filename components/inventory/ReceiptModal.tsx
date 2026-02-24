import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PurchaseReceipt, PurchaseReceiptItem, InventoryItem } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../Modal';
import { Plus, Trash2, Save, CheckCircle, Search, X, Package, Loader2 } from 'lucide-react';
import { showToast } from '../../lib/toast';

// ============================================================
// TYPES
// ============================================================

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: PurchaseReceipt | null;
  onSaved: () => void;
}

interface LocalItem {
  _key: string;
  id?: string;
  inventory_item_id: string;
  item_description: string;
  item_code?: number;
  item_unit?: string;
  qty: number;
  unit_cost_estimated: number;
  showAllocation: boolean;
}

const EMPTY_FORM = {
  supplier_name: '',
  receipt_number: '',
  receipt_date: new Date().toISOString().slice(0, 10),
  notes: '',
};

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

let keyCounter = 0;
const nextKey = () => `_lk_${++keyCounter}`;

// ============================================================
// COMPONENT
// ============================================================

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt, onSaved }) => {
  // ---- Form state ----
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState<LocalItem[]>([]);
  const [status, setStatus] = useState<PurchaseReceipt['status']>('DRAFT');

  // ---- UI state ----
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // ---- Product search per-row ----
  const [activeSearchRow, setActiveSearchRow] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isReadonly = status === 'PENDING_INVOICE' || status === 'INVOICED' || status === 'CANCELED';
  const isEditing = !!receipt;

  // ---- Computed totals ----
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalEstimated = items.reduce((s, i) => s + i.qty * i.unit_cost_estimated, 0);

  // ============================================================
  // LOAD DATA ON OPEN
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    if (receipt) {
      setForm({
        supplier_name: receipt.supplier_name || '',
        receipt_number: receipt.receipt_number || '',
        receipt_date: receipt.receipt_date || new Date().toISOString().slice(0, 10),
        notes: receipt.notes || '',
      });
      setStatus(receipt.status);
      loadReceiptItems(receipt.id);
    } else {
      setForm({ ...EMPTY_FORM, receipt_date: new Date().toISOString().slice(0, 10) });
      setItems([]);
      setStatus('DRAFT');
    }

    setActiveSearchRow(null);
    setProductSearch('');
    setSearchResults([]);
    setShowDropdown(false);
  }, [isOpen, receipt]);

  const loadReceiptItems = async (receiptId: string) => {
    setLoading(true);
    try {
      const data = await inventoryService.getReceiptItems(receiptId);
      setItems(
        data.map((ri) => ({
          _key: nextKey(),
          id: ri.id,
          inventory_item_id: ri.inventory_item_id,
          item_description: ri.item_description || 'Item sem descricao',
          item_code: ri.item_code,
          item_unit: ri.item_unit,
          qty: ri.qty,
          unit_cost_estimated: ri.unit_cost_estimated,
          showAllocation: false,
        }))
      );
    } catch (err) {
      console.error('Erro ao carregar itens da retirada:', err);
      showToast.error('Erro ao carregar itens.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PRODUCT SEARCH (inline per-row)
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setActiveSearchRow(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSearch = useCallback((value: string) => {
    setProductSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await inventoryService.getItems({ search: value, pageSize: 8 });
        setSearchResults(result.data);
        setShowDropdown(result.data.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
  }, []);

  const handleSelectProduct = useCallback((item: InventoryItem) => {
    if (!activeSearchRow) return;

    setItems((prev) =>
      prev.map((row) =>
        row._key === activeSearchRow
          ? {
              ...row,
              inventory_item_id: item.id,
              item_description: item.description,
              item_code: item.code,
              item_unit: item.unit,
              unit_cost_estimated: item.cost_price || 0,
            }
          : row
      )
    );

    setShowDropdown(false);
    setActiveSearchRow(null);
    setProductSearch('');
    setSearchResults([]);
  }, [activeSearchRow]);

  // ============================================================
  // ITEM CRUD
  // ============================================================

  const addItem = () => {
    const key = nextKey();
    setItems((prev) => [
      ...prev,
      {
        _key: key,
        inventory_item_id: '',
        item_description: '',
        qty: 1,
        unit_cost_estimated: 0,
        showAllocation: false,
      },
    ]);
    setActiveSearchRow(key);
    setProductSearch('');
    setShowDropdown(false);
  };

  const updateItemField = (key: string, field: keyof LocalItem, value: any) => {
    setItems((prev) =>
      prev.map((row) => (row._key === key ? { ...row, [field]: value } : row))
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((row) => row._key !== key));
  };

  const toggleAllocation = (key: string) => {
    setItems((prev) =>
      prev.map((row) =>
        row._key === key ? { ...row, showAllocation: !row.showAllocation } : row
      )
    );
  };

  // ============================================================
  // SAVE (DRAFT)
  // ============================================================

  const handleSaveDraft = async () => {
    if (!form.supplier_name.trim()) {
      showToast.error('Informe o nome do fornecedor.');
      return;
    }
    if (!form.receipt_number.trim()) {
      showToast.error('Informe o numero da retirada.');
      return;
    }

    setSaving(true);
    try {
      let receiptId = receipt?.id;

      const payload: Partial<PurchaseReceipt> = {
        supplier_name: form.supplier_name.trim(),
        receipt_number: form.receipt_number.trim(),
        receipt_date: form.receipt_date,
        notes: form.notes.trim() || undefined,
        status: 'DRAFT',
      };

      if (receiptId) {
        await inventoryService.updatePurchaseReceipt(receiptId, payload);
      } else {
        const created = await inventoryService.createPurchaseReceipt(payload);
        if (!created) throw new Error('Falha ao criar retirada');
        receiptId = created.id;
      }

      // Upsert items
      const validItems = items.filter((i) => i.inventory_item_id);
      for (const item of validItems) {
        if (item.id) {
          await inventoryService.updateReceiptItem(item.id, {
            inventory_item_id: item.inventory_item_id,
            qty: item.qty,
            unit_cost_estimated: item.unit_cost_estimated,
          });
        } else {
          const created = await inventoryService.addReceiptItem({
            purchase_receipt_id: receiptId!,
            inventory_item_id: item.inventory_item_id,
            qty: item.qty,
            unit_cost_estimated: item.unit_cost_estimated,
          });
          if (created) item.id = created.id;
        }
      }

      showToast.success('Rascunho salvo com sucesso!');
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar rascunho:', err);
      showToast.error('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // FINALIZE
  // ============================================================

  const handleFinalize = async () => {
    if (!receipt?.id) return;
    if (items.length === 0) {
      showToast.error('Adicione ao menos um item antes de finalizar.');
      return;
    }

    setFinalizing(true);
    try {
      await inventoryService.finalizeReceipt(receipt.id);
      showToast.success('Retirada finalizada com sucesso!');
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Erro ao finalizar retirada:', err);
      showToast.error('Erro ao finalizar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setFinalizing(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  const title = isReadonly
    ? `Retirada ${form.receipt_number || ''}`
    : receipt
      ? `Editar Retirada ${form.receipt_number || ''}`
      : 'Nova Retirada';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="4xl">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <span className="ml-3 text-sm text-slate-400">Carregando...</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ============ HEADER FIELDS ============ */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                Fornecedor
              </label>
              <input
                type="text"
                value={form.supplier_name}
                onChange={(e) => setForm((f) => ({ ...f, supplier_name: e.target.value }))}
                placeholder="Nome do fornecedor"
                disabled={isReadonly}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                Numero da Retirada
              </label>
              <input
                type="text"
                value={form.receipt_number}
                onChange={(e) => setForm((f) => ({ ...f, receipt_number: e.target.value }))}
                placeholder="RET-001"
                disabled={isReadonly}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={form.receipt_date}
                onChange={(e) => setForm((f) => ({ ...f, receipt_date: e.target.value }))}
                disabled={isReadonly}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Observacoes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Observacoes sobre a retirada..."
              disabled={isReadonly}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* ============ ITEMS TABLE ============ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Itens da Retirada
              </h4>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500">
                  {items.length} {items.length === 1 ? 'item' : 'itens'} | Qtd: {totalQty} | Total: {formatCurrency(totalEstimated)}
                </span>
                {!isReadonly && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-bold uppercase rounded-lg transition"
                  >
                    <Plus size={12} />
                    Adicionar Item
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_90px_100px_80px] gap-2 px-3 py-2 bg-slate-900/60 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Produto</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase text-center">Qtd</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase text-center">Custo Est.</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase text-center">Acoes</span>
              </div>

              {/* Table rows */}
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                  <Package size={24} className="mb-2" />
                  <span className="text-xs">Nenhum item adicionado</span>
                </div>
              ) : (
                items.map((item) => (
                  <React.Fragment key={item._key}>
                    <div className="grid grid-cols-[1fr_90px_100px_80px] gap-2 px-3 py-2 border-b border-slate-800/50 items-center hover:bg-slate-900/40 transition-colors">
                      {/* Product cell */}
                      <div className="relative" ref={activeSearchRow === item._key ? dropdownRef : undefined}>
                        {item.inventory_item_id ? (
                          <div className="flex items-center gap-2">
                            <Package size={12} className="text-emerald-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-white font-medium truncate block">
                                {item.item_description}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Cod. {item.item_code || '-'} | {item.item_unit || 'UNI'}
                              </span>
                            </div>
                            {!isReadonly && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateItemField(item._key, 'inventory_item_id', '');
                                  updateItemField(item._key, 'item_description', '');
                                  setActiveSearchRow(item._key);
                                  setProductSearch('');
                                }}
                                className="p-0.5 text-slate-600 hover:text-slate-400 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input
                              type="text"
                              value={activeSearchRow === item._key ? productSearch : ''}
                              onChange={(e) => {
                                setActiveSearchRow(item._key);
                                handleProductSearch(e.target.value);
                              }}
                              onFocus={() => {
                                setActiveSearchRow(item._key);
                                if (productSearch.length >= 2) setShowDropdown(true);
                              }}
                              placeholder="Buscar produto..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-md pl-7 pr-2 py-1.5 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            />

                            {showDropdown && activeSearchRow === item._key && searchResults.length > 0 && (
                              <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                                {searchResults.map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => handleSelectProduct(product)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="min-w-0 flex-1">
                                        <span className="text-xs text-white font-medium truncate block">
                                          {product.description}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                          Cod. {product.code}{product.sku ? ` | SKU: ${product.sku}` : ''}
                                        </span>
                                      </div>
                                      <div className="text-right shrink-0 ml-2">
                                        <span className="text-[10px] text-slate-400 block">
                                          Est: {product.qty_current}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                          {formatCurrency(product.cost_price || 0)}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Qty cell */}
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty || ''}
                        onChange={(e) => updateItemField(item._key, 'qty', Number(e.target.value))}
                        disabled={isReadonly}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 text-white text-xs text-center focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
                      />

                      {/* Cost cell */}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost_estimated || ''}
                        onChange={(e) => updateItemField(item._key, 'unit_cost_estimated', Number(e.target.value))}
                        disabled={isReadonly}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 text-white text-xs text-center focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
                      />

                      {/* Actions cell */}
                      <div className="flex items-center justify-center gap-1">
                        {!isReadonly && (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleAllocation(item._key)}
                              className={`px-2 py-1 text-[9px] font-bold uppercase rounded transition ${
                                item.showAllocation
                                  ? 'bg-sky-500/20 text-sky-400'
                                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Ratear
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item._key)}
                              className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Allocation panel placeholder */}
                    {item.showAllocation && (
                      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800/50">
                        <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center text-xs text-slate-500">
                          Painel de Rateio - AllocationPanel
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* ============ STATUS BADGE (readonly) ============ */}
          {isReadonly && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <CheckCircle size={14} className="text-amber-400 shrink-0" />
              <span className="text-xs text-amber-300">
                Esta retirada esta com status <strong className="uppercase">{status}</strong> e nao pode ser editada.
              </span>
            </div>
          )}

          {/* ============ FOOTER BUTTONS ============ */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
            >
              Cancelar
            </button>

            {!isReadonly && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Salvar Rascunho
                    </>
                  )}
                </button>

                {isEditing && status === 'DRAFT' && items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleFinalize}
                    disabled={finalizing}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {finalizing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Finalizar Retirada
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReceiptModal;
