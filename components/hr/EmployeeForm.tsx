import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, User, Briefcase, CreditCard, FileText, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { validateCPF, formatCPF, formatCurrency, parseCurrency } from '../../services/validation';

interface EmployeeFormProps {
    employeeId?: string | null;
    companiesList: { id: string, name: string }[];
    onClose: () => void;
    onSuccess: () => void;
    onSwitchToEdit?: (id: string) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, companiesList, onClose, onSuccess, onSwitchToEdit }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'contract' | 'banking'>('personal');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [duplicateData, setDuplicateData] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        // Pessoal
        company_id: '',
        name: '',
        cpf: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',

        // Contrato
        job_title: '',
        department: '',
        admission_date: '',
        registration_number: '',
        base_salary: '0,00',
        transport_fare: '0,00',
        meal_allowance: '0,00',
        weekly_hours: 44,
        work_start_time: '08:00',
        work_end_time: '18:00',
        work_shift_id: '',

        // Bancário
        bank_name: '',
        bank_agency: '',
        bank_account: '',
        bank_account_type: 'Corrente',
        pix_key: '',

        // Docs
        rg: '',
        cnh_number: '',
        cnh_category: '',
        cnh_expiry: ''
    });

    const [shifts, setShifts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch shifts
        supabase.from('work_shifts').select('id, name').order('name')
            .then(({ data }) => setShifts(data || []));

        if (employeeId) {
            fetchEmployee();
        }
    }, [employeeId]);

    const fetchEmployee = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .single();

        if (data) {
            setFormData({
                company_id: data.company_id || '',
                name: data.full_name || data.name || '',
                cpf: data.cpf ? formatCPF(data.cpf) : '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                birth_date: data.birth_date || '',

                job_title: data.job_title || data.role || '',
                department: data.department || '',
                admission_date: data.admission_date || '',
                registration_number: data.registration_number || '',
                base_salary: data.base_salary ? formatCurrency(data.base_salary).replace('R$', '').trim() : '0,00',
                transport_fare: data.transport_fare ? formatCurrency(data.transport_fare).replace('R$', '').trim() : '0,00',
                meal_allowance: data.meal_allowance ? formatCurrency(data.meal_allowance).replace('R$', '').trim() : '0,00',
                weekly_hours: data.weekly_hours || 44,
                work_start_time: data.work_start_time || '08:00',
                work_end_time: data.work_end_time || '18:00',
                work_shift_id: data.work_shift_id || '',

                bank_name: data.bank_name || '',
                bank_agency: data.bank_agency || '',
                bank_account: data.bank_account || '',
                bank_account_type: data.bank_account_type || 'Corrente',
                pix_key: data.pix_key || '',

                rg: data.rg || '',
                cnh_number: data.cnh_number || '',
                cnh_category: data.cnh_category || '',
                cnh_expiry: data.cnh_expiry || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (field: string, value: string) => {
        if (field === 'cpf') value = formatCPF(value);
        if (['base_salary', 'transport_fare', 'meal_allowance'].includes(field)) {
            // Máscara de moeda simples
            value = value.replace(/\D/g, '');
            value = (Number(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setMessage(null);
        if (!formData.name) return setMessage({ type: 'error', text: 'Nome é obrigatório.' });
        if (!formData.company_id) return setMessage({ type: 'error', text: 'Selecione a Empresa.' });

        // Validação de CPF (opcional se vazio, obrigatório se preenchido)
        if (formData.cpf && !validateCPF(formData.cpf)) {
            return setMessage({ type: 'error', text: 'CPF inválido.' });
        }

        setLoading(true);

        // --- VERIFICAÇÃO DE DUPLICIDADE ---
        try {
            // Verifica se já existe Nome exato ou Matrícula
            const { data: duplicates, error: dupError } = await supabase
                .from('employees')
                .select('id, full_name, registration_number, active')
                .or(`full_name.eq.${formData.name.trim()},registration_number.eq.${formData.registration_number.trim()}`);

            if (dupError && dupError.code !== 'PGRST116') {
                console.warn("Erro ao verificar duplicidade:", dupError);
            }

            if (duplicates && duplicates.length > 0) {
                const realDuplicates = duplicates.filter(d => d.id !== employeeId);

                if (realDuplicates.length > 0) {
                    const dup = realDuplicates[0];
                    setDuplicateData(dup);
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.error("Falha na validação de unicidade:", err);
        }
        // ----------------------------------

        const payload = {
            company_id: formData.company_id,
            full_name: formData.name, // Correção: coluna é full_name
            // name: formData.name, // Removido
            cpf: formData.cpf.replace(/\D/g, ''), // Salva limpo
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            birth_date: formData.birth_date || null,

            // role: formData.job_title, // Removido (não existe no banco)
            job_title: formData.job_title,
            department: formData.department,
            admission_date: formData.admission_date || null,
            registration_number: formData.registration_number,
            base_salary: parseCurrency(formData.base_salary),
            transport_fare: parseCurrency(formData.transport_fare),
            meal_allowance: parseCurrency(formData.meal_allowance),
            weekly_hours: Number(formData.weekly_hours),
            work_start_time: formData.work_start_time,
            work_end_time: formData.work_end_time,
            work_shift_id: formData.work_shift_id || null,

            bank_name: formData.bank_name,
            bank_agency: formData.bank_agency,
            bank_account: formData.bank_account,
            bank_account_type: formData.bank_account_type,
            pix_key: formData.pix_key,

            rg: formData.rg,
            cnh_number: formData.cnh_number,
            cnh_category: formData.cnh_category,
            cnh_expiry: formData.cnh_expiry || null
        };

        let error;
        if (employeeId) {
            const { error: err } = await supabase.from('employees').update(payload).eq('id', employeeId);
            error = err;
        } else {
            const { error: err } = await supabase.from('employees').insert(payload);
            error = err;
        }

        setLoading(false);

        if (error) {
            console.error(error);
            let friendlyMsg = error.message;

            // Traduções de Erros Comuns
            if (error.code === '23505') friendlyMsg = "Já existe um colaborador cadastrado com este CPF ou Matrícula.";
            if (error.code === '42703' || error.message?.includes("Could not find the")) friendlyMsg = "Erro de Versão: O sistema precisa ser atualizado. (Coluna não encontrada)";

            setMessage({ type: 'error', text: friendlyMsg });
        } else {
            setMessage({ type: 'success', text: 'Salvo com sucesso!' });
            setTimeout(onSuccess, 1000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">

                {/* MODAL DE DUPLICIDADE (OVERLAY) */}
                {duplicateData && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="max-w-md space-y-6">
                            <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
                                <AlertCircle size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Cadastro Encontrado!</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Já existe um colaborador com este Nome ou Matrícula:<br />
                                    <strong className="text-white text-lg block my-2">{duplicateData.full_name}</strong>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${duplicateData.active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        Status: {duplicateData.active !== false ? 'ATIVO' : 'DESLIGADO (INATIVO)'}
                                    </span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                {duplicateData.active === false ? (
                                    <button
                                        onClick={async () => {
                                            setLoading(true);
                                            await supabase.from('employees').update({ active: true }).eq('id', duplicateData.id);
                                            if (onSwitchToEdit) onSwitchToEdit(duplicateData.id);
                                            setDuplicateData(null);
                                        }}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <div className="p-1 bg-white/20 rounded-full"><CheckCircle size={16} /></div>
                                        Reativar e Editar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (onSwitchToEdit) onSwitchToEdit(duplicateData.id);
                                            setDuplicateData(null);
                                        }}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={18} /> Editar Cadastro Existente
                                    </button>
                                )}

                                <button
                                    onClick={() => setDuplicateData(null)}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold rounded-xl transition-all"
                                >
                                    Voltar e Ajustar Dados
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {employeeId ? <User className="text-blue-500" /> : <User className="text-emerald-500" />}
                            {employeeId ? 'Editar Colaborador' : 'Novo Colaborador'}
                        </h2>
                        <p className="text-slate-400 text-sm">Preencha os dados completos para o eSocial e Folha.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/50">
                    <button onClick={() => setActiveTab('personal')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        <User size={16} /> Dados Pessoais
                    </button>
                    <button onClick={() => setActiveTab('contract')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'contract' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        <Briefcase size={16} /> Contrato & RH
                    </button>
                    <button onClick={() => setActiveTab('banking')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'banking' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        <CreditCard size={16} /> Bancário & Docs
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50 custom-scrollbar">

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                            {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa Vinculada *</label>
                                <select value={formData.company_id} onChange={e => handleChange('company_id', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                                    <option value="">Selecione a Empresa...</option>
                                    {companiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: João da Silva" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF (Obrigatório para eSocial)</label>
                                <input type="text" maxLength={14} value={formData.cpf} onChange={e => handleChange('cpf', e.target.value)} className={`w-full bg-slate-900 border rounded-lg p-3 text-white outline-none ${formData.cpf && !validateCPF(formData.cpf) ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'}`} placeholder="000.000.000-00" />
                                {formData.cpf && !validateCPF(formData.cpf) && <span className="text-red-500 text-xs mt-1 block">CPF Inválido</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Nascimento</label>
                                <input type="date" value={formData.birth_date} onChange={e => handleChange('birth_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="email@empresa.com" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / WhatsApp</label>
                                <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="(00) 00000-0000" />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                                <textarea rows={2} value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contract' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo (Carteira)</label>
                                <input type="text" value={formData.job_title} onChange={e => handleChange('job_title', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Motorista Caminhão Truck" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento / Obra</label>
                                <input type="text" value={formData.department} onChange={e => handleChange('department', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Operacional / Obra A" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Matrícula (Sistema Antigo)</label>
                                <input type="text" value={formData.registration_number} onChange={e => handleChange('registration_number', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Admissão</label>
                                <input type="date" value={formData.admission_date} onChange={e => handleChange('admission_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Turno de Trabalho</label>
                                <select value={formData.work_shift_id} onChange={e => handleChange('work_shift_id', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
                                    <option value="">Sem Turno Definido (Personalizado)</option>
                                    {shifts.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entrada Padrão</label>
                                <input type="time" value={formData.work_start_time} onChange={e => handleChange('work_start_time', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Saída Padrão</label>
                                <input type="time" value={formData.work_end_time} onChange={e => handleChange('work_end_time', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">Salário Base (R$)</label>
                                <input type="text" value={formData.base_salary} onChange={e => handleChange('base_salary', e.target.value)} className="w-full bg-emerald-950/30 border border-emerald-500/50 rounded-lg p-3 text-emerald-400 font-bold focus:border-emerald-500 outline-none text-right" placeholder="0,00" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carga Horária Semanal</label>
                                <input type="number" value={formData.weekly_hours} onChange={e => handleChange('weekly_hours', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vale Transporte (Diário)</label>
                                <input type="text" value={formData.transport_fare} onChange={e => handleChange('transport_fare', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right" placeholder="0,00" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vale Refeição (Diário)</label>
                                <input type="text" value={formData.meal_allowance} onChange={e => handleChange('meal_allowance', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right" placeholder="0,00" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'banking' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2"><CreditCard size={16} /> Dados Bancários (Para Pagamento)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Banco</label>
                                        <input type="text" value={formData.bank_name} onChange={e => handleChange('bank_name', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Nubank, Bradesco" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agência</label>
                                        <input type="text" value={formData.bank_agency} onChange={e => handleChange('bank_agency', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conta & Dígito</label>
                                        <input type="text" value={formData.bank_account} onChange={e => handleChange('bank_account', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chave PIX (Preferencial)</label>
                                        <input type="text" value={formData.pix_key} onChange={e => handleChange('pix_key', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="CPF, Email ou Aleatória" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <h3 className="text-sm font-bold text-blue-400 uppercase mb-4 flex items-center gap-2"><FileText size={16} /> Documentos Complementares</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RG</label>
                                        <input type="text" value={formData.rg} onChange={e => handleChange('rg', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número CNH</label>
                                        <input type="text" value={formData.cnh_number} onChange={e => handleChange('cnh_number', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria CNH</label>
                                        <select value={formData.cnh_category} onChange={e => handleChange('cnh_category', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500">
                                            <option value="">Selecione...</option>
                                            <option value="A">A (Moto)</option>
                                            <option value="B">B (Carro)</option>
                                            <option value="C">C (Caminhão)</option>
                                            <option value="D">D (Ônibus/Van)</option>
                                            <option value="E">E (Carreta)</option>
                                            <option value="AD">AD</option>
                                            <option value="AE">AE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Validade CNH</label>
                                        <input type="date" value={formData.cnh_expiry} onChange={e => handleChange('cnh_expiry', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="px-8 py-3 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Salvando...' : <><Save size={20} /> Salvar Cadastro</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EmployeeForm;
