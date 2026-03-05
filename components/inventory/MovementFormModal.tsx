import React, { useState, useEffect, useRef } from 'react';
import { Search, Save, Package } from 'lucide-react';
import Modal from '../Modal';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';
import { showToast } from '../../lib/toast';

// ============================================================
// TYPES
// ============================================================

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const MOVEMENT_TYPES = [
  { value: 'ENTRADA_COMPRA',    label: 'Entrada - Compra' },
  { value: 'ENTRADA_DEVOLUCAO', label: 'Entrada - Devolução' },
  { value: 'ENTRADA_AJUSTE',    label: 'Entrada - Ajuste (+)' },
  { value: 'SAIDA_OS',          label: 'Saída - Ordem de Serviço' },
  { value: 'SAIDA_VENDA',       label: 'Saída - Venda' },
  { value: 'SAIDA_AJUSTE',      label: 'Saída - Ajuste (-)' },
  { value: 'SAIDA_PERDA',       label: 'Saída - Perda' },
  { value: 'TRANSFERENCIA',     label: 'Transferência' },
] as const;

// ============================================================
// COMPONENT
// ============================================================

const MovementFormModal: React.FC<MovementFormModalProps> = ({ isOpen, onClose, onSaved }) => {
  // ---- Product search state ----
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ---- Form state ----
  const [movementType, setMovementType] = useState('ENTRADA_COMPRA');
  const [quantity, setQuantity] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [entityName, setEntityName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // ---- UI state ----
  const [saving, setSaving] = useState(false);

  // ---- Computed ----
  const totalValue = quantity * unitCost;

  // ---- Reset form when modal opens/closes ----
  useEffect(() => {
    if (isOpen) {
      setProductSearch('');
      setSearchResults([]);
      setSelectedProduct(null);
      setShowDropdown(false);
      setMovementType('ENTRADA_COMPRA');
      setQuantity(0);
      setUnitCost(0);
      setNotes('');
      setEntityName('');
      setInvoiceNumber('');
      setSaving(false);
    }
  }, [isOpen]);

  // ---- Close dropdown on outside click ----
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Product search ----
  const handleProductSearch = (value: string) => {
    setProductSearch(value);
    setSelectedProduct(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await inventoryService.getItems({ search: value, pageSize: 15 });
        setSearchResults(result.data);
        setShowDropdown(result.data.length > 0);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  const handleSelectProduct = (item: InventoryItem) => {
    setSelectedProduct(item);
    setProductSearch(`${item.code} - ${item.description}`);
    setUnitCost(item.cost_price || 0);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // ---- Save ----
  const handleSave = async () => {
    if (!selectedProduct) {
      showToast.error('Selecione um produto antes de salvar.');
      return;
    }
    if (quantity <= 0) {
      showToast.error('A quantidade deve ser maior que zero.');
      return;
    }

    setSaving(true);
    try {
      await inventoryService.createMovement({
        item_id: selectedProduct.id,
        movement_type: movementType,
        quantity,
        unit_cost: unitCost,
        total_value: totalValue,
        notes: notes || undefined,
        entity_name: entityName || undefined,
        invoice_number: invoiceNumber || undefined,
      });
      showToast.success('Movimentação registrada com sucesso!');
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar movimentação:', err);
      showToast.error('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  // ---- Format currency ----
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Movimentação de Estoque" size="xl">
      <div className="space-y-5">

        {/* ---- Product Search ---- */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
            Produto / Serviço
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={productSearch}
              onChange={e => handleProductSearch(e.target.value)}
              placeholder="Buscar por código, descrição ou SKU..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Selected product info */}
          {selectedProduct && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Package size={14} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-white font-medium truncate block">
                  {selectedProduct.description}
                </span>
                <span className="text-[10px] text-slate-400">
                  Cód. {selectedProduct.code} | Estoque: {selectedProduct.qty_current} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          {/* Search dropdown */}
          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
              {searchResults.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectProduct(item)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-white font-medium truncate block">
                        {item.description}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Cód. {item.code}{item.sku ? ` | SKU: ${item.sku}` : ''}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-[10px] text-slate-400 block">
                        Estoque: {item.qty_current}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatCurrency(item.cost_price || 0)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Movement Type ---- */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
            Tipo de Movimentação
          </label>
          <select
            value={movementType}
            onChange={e => setMovementType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            {MOVEMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* ---- Quantity + Unit Cost + Total ---- */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Quantidade
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={quantity || ''}
              onChange={e => setQuantity(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Custo Unitário
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost || ''}
              onChange={e => setUnitCost(Number(e.target.value))}
              placeholder="0,00"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Valor Total
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 text-xs font-bold">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </div>

        {/* ---- Notes ---- */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Observações sobre a movimentação..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
          />
        </div>

        {/* ---- Reference fields ---- */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Entidade / Fornecedor
            </label>
            <input
              type="text"
              value={entityName}
              onChange={e => setEntityName(e.target.value)}
              placeholder="Nome do fornecedor ou cliente"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Número da Nota Fiscal
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="NF-e, NFS-e..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* ---- Action buttons ---- */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedProduct || quantity <= 0}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={14} />
                Salvar Movimentação
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MovementFormModal;
