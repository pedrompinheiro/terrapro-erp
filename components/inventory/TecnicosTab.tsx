import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, Phone, Mail, Wrench, Settings, DollarSign, Save, Shield, ShieldOff, X } from 'lucide-react';
import { Technician } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../Modal';

interface TecnicosTabProps {
  onRefresh?: () => void;
}

const emptyForm = {
  name: '',
  is_technician: false,
  is_mechanic: false,
  is_seller: false,
  is_attendant: false,
  commission_percent: 0,
  commission_on_products: false,
  commission_on_services: false,
  phone: '',
  cell_phone: '',
  email: '',
  cpf: '',
  is_active: true,
  is_blocked: false,
};

export default function TecnicosTab({ onRefresh }: TecnicosTabProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getTechnicians({ search });
      setTechnicians(data);
    } catch (err) {
      console.error('Erro ao carregar tecnicos:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  const openNew = () => {
    setEditingTech(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (tech: Technician) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      is_technician: tech.is_technician,
      is_mechanic: tech.is_mechanic,
      is_seller: tech.is_seller,
      is_attendant: tech.is_attendant,
      commission_percent: tech.commission_percent,
      commission_on_products: tech.commission_on_products,
      commission_on_services: tech.commission_on_services,
      phone: tech.phone || '',
      cell_phone: tech.cell_phone || '',
      email: tech.email || '',
      cpf: tech.cpf || '',
      is_active: tech.is_active,
      is_blocked: tech.is_blocked,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingTech) {
        await inventoryService.updateTechnician(editingTech.id, formData);
      } else {
        await inventoryService.createTechnician(formData);
      }
      setIsModalOpen(false);
      loadTechnicians();
      onRefresh?.();
    } catch (err) {
      console.error('Erro ao salvar tecnico:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTech) return;
    if (!window.confirm(`Desativar "${editingTech.name}"? Essa acao pode ser revertida.`)) return;
    setSaving(true);
    try {
      await inventoryService.deleteTechnician(editingTech.id);
      setIsModalOpen(false);
      loadTechnicians();
      onRefresh?.();
    } catch (err) {
      console.error('Erro ao desativar tecnico:', err);
    } finally {
      setSaving(false);
    }
  };

  const roleBadges = (tech: Technician) => {
    const roles: { key: keyof Technician; label: string; color: string }[] = [
      { key: 'is_technician', label: 'Tecnico', color: 'bg-blue-500/20 text-blue-400' },
      { key: 'is_mechanic', label: 'Mecanico', color: 'bg-emerald-500/20 text-emerald-400' },
      { key: 'is_seller', label: 'Vendedor', color: 'bg-purple-500/20 text-purple-400' },
      { key: 'is_attendant', label: 'Atendente', color: 'bg-amber-500/20 text-amber-400' },
    ];
    return roles.filter(r => tech[r.key]).map(r => (
      <span key={r.key} className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${r.color}`}>
        {r.label}
      </span>
    ));
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar tecnico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
          />
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Novo Tecnico
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">Carregando...</div>
      ) : technicians.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <User size={32} />
          <span className="text-sm">Nenhum tecnico encontrado</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map(tech => (
            <div
              key={tech.id}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all relative"
            >
              {/* Name + Code */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-black text-sm leading-tight">{tech.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 font-mono mt-1 inline-block">
                    #{tech.code}
                  </span>
                </div>
                <button
                  onClick={() => openEdit(tech)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <Settings size={14} />
                </button>
              </div>

              {/* Role badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {roleBadges(tech)}
              </div>

              {/* Contact */}
              <div className="space-y-1.5 mb-3">
                {tech.phone && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Phone size={12} />
                    <span>{tech.phone}</span>
                    {tech.cell_phone && <span className="text-slate-600">/ {tech.cell_phone}</span>}
                  </div>
                )}
                {tech.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail size={12} className="text-slate-400" />
                    <a href={`mailto:${tech.email}`} className="text-blue-400 hover:underline truncate">
                      {tech.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Commission */}
              {tech.commission_percent > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold">{tech.commission_percent}%</span>
                  {tech.commission_on_products && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                      Prod
                    </span>
                  )}
                  {tech.commission_on_services && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-400">
                      Serv
                    </span>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${tech.is_blocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className={`text-[10px] font-bold uppercase ${tech.is_blocked ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tech.is_blocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </div>

                {/* Revenue / Sales stats */}
                {(tech.revenue > 0 || tech.total_sales > 0) && (
                  <div className="text-right">
                    {tech.revenue > 0 && (
                      <div className="text-[10px] text-slate-500">
                        Receita: <span className="text-emerald-400 font-bold">{formatCurrency(tech.revenue)}</span>
                      </div>
                    )}
                    {tech.total_sales > 0 && (
                      <div className="text-[10px] text-slate-500">
                        Vendas: <span className="text-white font-bold">{tech.total_sales}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTech ? `Editar: ${editingTech.name}` : 'Novo Tecnico'}
        size="xl"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
              placeholder="Nome completo"
            />
          </div>

          {/* Roles */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Funcoes</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'is_technician', label: 'Tecnico', Icon: Wrench },
                { key: 'is_mechanic', label: 'Mecanico', Icon: Settings },
                { key: 'is_seller', label: 'Vendedor', Icon: DollarSign },
                { key: 'is_attendant', label: 'Atendente', Icon: User },
              ].map(({ key, label, Icon }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData as any)[key]}
                    onChange={e => setFormData(f => ({ ...f, [key]: e.target.checked }))}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30"
                  />
                  <Icon size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Commission */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comissao %</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={formData.commission_percent}
                onChange={e => setFormData(f => ({ ...f, commission_percent: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.commission_on_products}
                  onChange={e => setFormData(f => ({ ...f, commission_on_products: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-xs text-slate-300">Comissao Produtos</span>
              </label>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.commission_on_services}
                  onChange={e => setFormData(f => ({ ...f, commission_on_services: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-xs text-slate-300">Comissao Servicos</span>
              </label>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Celular</label>
              <input
                type="text"
                value={formData.cell_phone}
                onChange={e => setFormData(f => ({ ...f, cell_phone: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData(f => ({ ...f, cpf: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          {/* Status toggles */}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/30"
              />
              <Shield size={12} className="text-emerald-400" />
              <span className="text-xs text-slate-300">Ativo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_blocked}
                onChange={e => setFormData(f => ({ ...f, is_blocked: e.target.checked }))}
                className="rounded border-slate-700 bg-slate-950 text-red-500 focus:ring-red-500/30"
              />
              <ShieldOff size={12} className="text-red-400" />
              <span className="text-xs text-slate-300">Bloqueado</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {editingTech ? (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <X size={14} />
                Desativar
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
