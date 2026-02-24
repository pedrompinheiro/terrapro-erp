import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCog, Lock, Save, Plus, Loader, Pencil, Shield, CheckCircle, XCircle, Clock, Ban, Key, Eye, EyeOff, ExternalLink, Wifi, WifiOff, Upload, FileKey, AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

// ============================================
// Tipos
// ============================================

type SettingsTab = 'USERS' | 'API_KEYS';

interface SystemSetting {
    id: string;
    key: string;
    value: string | null;
    label: string;
    description: string;
    category: string;
    is_secret: boolean;
    updated_at: string;
}

// ============================================
// Componente Principal
// ============================================

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('USERS');

    // --- User Management State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'operador', password: '' });
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
    const [systemModules, setSystemModules] = useState<any[]>([]);
    const [userPermissions, setUserPermissions] = useState<any[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- API Keys State ---
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [testingKey, setTestingKey] = useState<string | null>(null);

    // --- Certificate State ---
    const [certFile, setCertFile] = useState<File | null>(null);
    const [certPassword, setCertPassword] = useState('');
    const [certUploading, setCertUploading] = useState(false);
    const [certTesting, setCertTesting] = useState(false);
    const [certInfo, setCertInfo] = useState<{
        configured: boolean;
        cn?: string;
        issuer?: string;
        expiry?: string;
        expired?: boolean;
        days_remaining?: number;
        error?: string;
    } | null>(null);
    const [certRemoving, setCertRemoving] = useState(false);

    // ============================================
    // Fetch Users
    // ============================================

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'listUsers' }
            });
            if (error) {
                console.error("Function error:", error);
                setUsers([]);
            } else {
                setUsers(data || []);
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Fetch API Settings
    // ============================================

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('category')
                .order('label');

            if (error) throw error;
            setSettings(data || []);
        } catch (error: any) {
            console.error('Erro ao carregar settings:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    // ============================================
    // Certificate Functions
    // ============================================

    const fetchCertInfo = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('nfe-consulta', {
                body: { action: 'certInfo' },
            });
            if (error) {
                console.warn('Edge Function nfe-consulta não disponível:', error.message);
                setCertInfo(null);
                return;
            }
            setCertInfo(data);
        } catch {
            setCertInfo(null);
        }
    };

    const handleCertUpload = async () => {
        if (!certFile) return alert('Selecione um arquivo .pfx/.p12');
        if (!certPassword) return alert('Informe a senha do certificado');

        setCertUploading(true);
        try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1] || result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(certFile);
            });

            // Save PFX base64
            const pfxSetting = settings.find(s => s.key === 'nfe_certificate_pfx');
            const pwdSetting = settings.find(s => s.key === 'nfe_certificate_password');

            if (!pfxSetting || !pwdSetting) {
                throw new Error('Configurações de certificado não encontradas. Execute o SQL setup_nfe_certificate.sql primeiro.');
            }

            // Save both values
            const { error: pfxError } = await supabase
                .from('system_settings')
                .update({ value: base64 })
                .eq('id', pfxSetting.id);
            if (pfxError) throw pfxError;

            const { error: pwdError } = await supabase
                .from('system_settings')
                .update({ value: certPassword })
                .eq('id', pwdSetting.id);
            if (pwdError) throw pwdError;

            // Update local state
            setSettings(prev => prev.map(s => {
                if (s.key === 'nfe_certificate_pfx') return { ...s, value: base64, updated_at: new Date().toISOString() };
                if (s.key === 'nfe_certificate_password') return { ...s, value: certPassword, updated_at: new Date().toISOString() };
                return s;
            }));

            setCertFile(null);
            setCertPassword('');
            alert('Certificado salvo com sucesso!');

            // Refresh cert info
            await fetchCertInfo();
        } catch (error: any) {
            alert('Erro ao salvar certificado: ' + error.message);
        } finally {
            setCertUploading(false);
        }
    };

    const handleCertTest = async () => {
        setCertTesting(true);
        try {
            const { data, error } = await supabase.functions.invoke('nfe-consulta', {
                body: { action: 'test' },
            });
            if (error) throw error;
            if (!data?.success) {
                alert('Erro: ' + (data?.error || 'Falha no teste'));
                return;
            }
            const cert = data.certificate;
            const status = cert.expired ? 'EXPIRADO' : `Válido (${cert.days_remaining} dias restantes)`;
            alert(
                `Certificado OK!\n\n` +
                `Titular: ${cert.cn}\n` +
                `Emissor: ${cert.issuer}\n` +
                `Validade: ${new Date(cert.expiry).toLocaleDateString('pt-BR')}\n` +
                `Status: ${status}\n` +
                `CNPJ configurado: ${data.cnpj_configured ? data.cnpj : 'NÃO'}`
            );
            setCertInfo({ configured: true, cn: cert.cn, issuer: cert.issuer, expiry: cert.expiry, expired: cert.expired, days_remaining: cert.days_remaining });
        } catch (error: any) {
            alert('Erro no teste: ' + error.message);
        } finally {
            setCertTesting(false);
        }
    };

    const handleCertRemove = async () => {
        if (!window.confirm('Remover o certificado digital? A consulta SEFAZ ficará indisponível.')) return;
        setCertRemoving(true);
        try {
            const pfxSetting = settings.find(s => s.key === 'nfe_certificate_pfx');
            const pwdSetting = settings.find(s => s.key === 'nfe_certificate_password');
            if (pfxSetting) {
                await supabase.from('system_settings').update({ value: null }).eq('id', pfxSetting.id);
            }
            if (pwdSetting) {
                await supabase.from('system_settings').update({ value: null }).eq('id', pwdSetting.id);
            }
            setSettings(prev => prev.map(s => {
                if (s.key === 'nfe_certificate_pfx' || s.key === 'nfe_certificate_password') return { ...s, value: null };
                return s;
            }));
            setCertInfo({ configured: false });
            alert('Certificado removido.');
        } catch (error: any) {
            alert('Erro ao remover: ' + error.message);
        } finally {
            setCertRemoving(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSettings();
        fetchCertInfo();
    }, []);

    // ============================================
    // User Handlers
    // ============================================

    const pendingUsers = users.filter(u => u.profileStatus === 'PENDING');

    const handleSetUserStatus = async (userId: string, status: 'APPROVED' | 'BLOCKED') => {
        const label = status === 'APPROVED' ? 'aprovar' : 'bloquear';
        if (!window.confirm(`Confirma ${label} este usuário?`)) return;

        try {
            // Tenta via Edge Function primeiro
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'setUserStatus', payload: { userId, status } }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, profileStatus: status } : u));
        } catch (edgeFnError: any) {
            console.warn('Edge Function falhou, tentando fallback direto:', edgeFnError.message);
            // Fallback: atualiza direto pela tabela user_profiles
            try {
                const { error: directError } = await supabase
                    .from('user_profiles')
                    .update({ status })
                    .eq('id', userId);
                if (directError) throw directError;
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, profileStatus: status } : u));
            } catch (directErr: any) {
                alert('Erro ao alterar status: ' + directErr.message);
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingUserId(null);
        setUserForm({ name: '', email: '', role: 'operador', password: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setEditingUserId(user.id);
        setUserForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'operador',
            password: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenPermissions = async (user: any) => {
        setSelectedUserForPermissions(user);
        setLoadingPermissions(true);
        setIsPermissionsModalOpen(true);

        try {
            const { data: modules, error: modError } = await supabase
                .from('system_modules')
                .select('*')
                .eq('is_active', true)
                .order('category')
                .order('name');
            if (modError) throw modError;
            setSystemModules(modules || []);

            const { data: perms, error: permError } = await supabase
                .from('user_permissions')
                .select('module_slug, can_read, can_create, can_update, can_delete')
                .eq('user_id', user.id);
            if (permError) throw permError;
            setUserPermissions(perms || []);
        } catch (error: any) {
            console.error("Erro ao carregar permissões:", error);
            alert("Erro ao carregar permissões: " + error.message);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleTogglePermission = (moduleSlug: string) => {
        setUserPermissions(prev => {
            const exists = prev.find(p => p.module_slug === moduleSlug);
            if (exists) return prev.filter(p => p.module_slug !== moduleSlug);
            return [...prev, { module_slug: moduleSlug, can_read: true, can_create: true, can_update: true, can_delete: true }];
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedUserForPermissions) return;
        setIsSaving(true);
        try {
            await supabase.from('user_permissions').delete().eq('user_id', selectedUserForPermissions.id);
            if (userPermissions.length > 0) {
                const payload = userPermissions.map(p => ({
                    user_id: selectedUserForPermissions.id,
                    module_slug: p.module_slug,
                    can_read: true, can_create: true, can_update: true, can_delete: true
                }));
                const { error } = await supabase.from('user_permissions').insert(payload);
                if (error) throw error;
            }
            alert("Permissões atualizadas com sucesso!");
            setIsPermissionsModalOpen(false);
        } catch (error: any) {
            alert("Erro ao salvar permissões: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveUser = async () => {
        if (!userForm.email) return alert('Email é obrigatório');
        if (!editingUserId && !userForm.password) return alert('Senha é obrigatória para novos usuários');

        setIsSaving(true);
        try {
            const action = editingUserId ? 'updateUser' : 'createUser';
            const payload = {
                id: editingUserId,
                email: userForm.email,
                password: userForm.password,
                fullName: userForm.name,
                role: userForm.role
            };
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action, payload }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            alert(editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            alert('Erro ao salvar usuário: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================
    // API Keys Handlers
    // ============================================

    const handleSaveSetting = async (setting: SystemSetting) => {
        const newValue = editedValues[setting.key];
        if (newValue === undefined) return;

        setSavingKey(setting.key);
        try {
            const { error } = await supabase
                .from('system_settings')
                .update({ value: newValue || null })
                .eq('id', setting.id);

            if (error) throw error;

            // Atualizar local
            setSettings(prev => prev.map(s =>
                s.id === setting.id ? { ...s, value: newValue || null, updated_at: new Date().toISOString() } : s
            ));

            // Limpar edited
            setEditedValues(prev => {
                const copy = { ...prev };
                delete copy[setting.key];
                return copy;
            });

        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSavingKey(null);
        }
    };

    const handleTestKey = async (setting: SystemSetting) => {
        const value = editedValues[setting.key] ?? setting.value;
        if (!value) {
            alert('Insira uma chave antes de testar.');
            return;
        }

        setTestingKey(setting.key);
        try {
            if (setting.key === 'gemini_api_key') {
                // Testa Gemini fazendo uma chamada simples
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${value}`);
                if (res.ok) {
                    alert('Gemini AI: Conexão OK! Chave válida.');
                } else {
                    const data = await res.json();
                    alert('Gemini AI: ERRO - ' + (data.error?.message || res.statusText));
                }
            } else if (setting.key === 'selsyn_api_key' || setting.key === 'selsyn_api_url') {
                alert('Selsyn: Teste manual necessário. Verifique se a URL e token estão corretos na tela de GPS.');
            } else {
                alert('Teste não disponível para esta chave.');
            }
        } catch (error: any) {
            alert('Erro no teste: ' + error.message);
        } finally {
            setTestingKey(null);
        }
    };

    const toggleVisibility = (key: string) => {
        setVisibleKeys(prev => {
            const copy = new Set(prev);
            if (copy.has(key)) copy.delete(key);
            else copy.add(key);
            return copy;
        });
    };

    const maskValue = (value: string | null) => {
        if (!value) return '';
        if (value.length <= 8) return '*'.repeat(value.length);
        return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
    };

    const settingsByCategory = settings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {});

    const categoryLabels: Record<string, string> = {
        certificados: 'Certificado Digital (NF-e / SEFAZ)',
        api_keys: 'Chaves de API & Integrações',
        system: 'Parâmetros do Sistema',
        notifications: 'Notificações por Email (SMTP)',
    };

    const categoryIcons: Record<string, React.ReactNode> = {
        certificados: <FileKey size={16} className="text-cyan-400" />,
        api_keys: <Key size={16} className="text-violet-400" />,
        system: <ShieldCheck size={16} className="text-blue-400" />,
        notifications: <ExternalLink size={16} className="text-amber-400" />,
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Configurações & Acesso</h2>
                    <p className="text-slate-500 mt-1">Gestão de usuários, integrações e segurança do sistema.</p>
                </div>
                {activeTab === 'USERS' && (
                    <button
                        onClick={handleOpenCreate}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Novo Usuário
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-xl w-fit border border-slate-800">
                <button
                    onClick={() => setActiveTab('USERS')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'USERS'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'text-slate-500 hover:text-white'
                    }`}
                >
                    <UserCog size={16} /> Usuários
                    {pendingUsers.length > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-black text-black flex items-center justify-center">
                            {pendingUsers.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('API_KEYS')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'API_KEYS'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'text-slate-500 hover:text-white'
                    }`}
                >
                    <Key size={16} /> Integrações & API
                    {settings.filter(s => s.category === 'api_keys' && !s.value).length > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center">
                            {settings.filter(s => s.category === 'api_keys' && !s.value).length}
                        </span>
                    )}
                </button>
            </div>

            {/* =============================== */}
            {/* TAB: USERS                       */}
            {/* =============================== */}
            {activeTab === 'USERS' && (
                <>
                    {/* Alerta de pendentes */}
                    {pendingUsers.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-xl">
                                    <Clock size={24} className="text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-amber-400 font-bold text-sm">
                                        {pendingUsers.length} usuário{pendingUsers.length > 1 ? 's' : ''} aguardando aprovação
                                    </h3>
                                    <p className="text-amber-500/70 text-xs mt-0.5">
                                        {pendingUsers.map(u => u.name).join(', ')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {pendingUsers.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleSetUserStatus(u.id, 'APPROVED')}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                                    >
                                        <CheckCircle size={14} /> Aprovar {u.name?.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cards resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><ShieldCheck size={32} /></div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">Nível de Segurança</p>
                                <h3 className="text-white font-bold text-lg">Protegido</h3>
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><UserCog size={32} /></div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">Usuários Ativos</p>
                                <h3 className="text-white font-bold text-lg">{users.filter(u => u.profileStatus === 'APPROVED').length} Usuários</h3>
                            </div>
                        </div>
                        {pendingUsers.length > 0 && (
                            <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl flex items-center gap-4">
                                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl"><Clock size={32} /></div>
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase">Pendentes</p>
                                    <h3 className="text-amber-400 font-bold text-lg">{pendingUsers.length} Aguardando</h3>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabela de Usuários */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Usuários do Sistema</h3>
                            <button onClick={fetchUsers} className="text-slate-500 hover:text-white" title="Atualizar Lista"><Loader size={16} /></button>
                        </div>

                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Usuário</th>
                                    <th className="px-8 py-4">Email</th>
                                    <th className="px-8 py-4">Função</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Último Acesso</th>
                                    <th className="px-8 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Carregando usuários...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className={`hover:bg-slate-800/30 transition-colors ${u.profileStatus === 'PENDING' ? 'bg-amber-500/5' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        u.profileStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30' :
                                                        u.profileStatus === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {(u.name || (u.email || '?')[0]).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white">{u.name || 'Sem Nome'}</span>
                                                        {u.id === editingUserId && <span className="text-[10px] text-emerald-500">Editando agora...</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-400">{u.email}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                                    u.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-500' :
                                                    u.role === 'MECHANIC' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-slate-700 text-slate-400'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {u.profileStatus === 'PENDING' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                                            <Clock size={11} /> PENDENTE
                                                        </span>
                                                        <button
                                                            onClick={() => handleSetUserStatus(u.id, 'APPROVED')}
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 shadow-sm"
                                                        >
                                                            <CheckCircle size={11} /> APROVAR
                                                        </button>
                                                        <button
                                                            onClick={() => handleSetUserStatus(u.id, 'BLOCKED')}
                                                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-red-600 text-slate-500 hover:text-white transition-all flex items-center gap-1"
                                                        >
                                                            <Ban size={11} />
                                                        </button>
                                                    </div>
                                                ) : u.profileStatus === 'APPROVED' ? (
                                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                                                        <CheckCircle size={11} /> APROVADO
                                                    </span>
                                                ) : u.profileStatus === 'BLOCKED' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                                            <XCircle size={11} /> BLOQUEADO
                                                        </span>
                                                        <button
                                                            onClick={() => handleSetUserStatus(u.id, 'APPROVED')}
                                                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-emerald-600 text-slate-500 hover:text-white transition-all flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={11} /> Reativar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 text-xs">
                                                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenPermissions(u)} className="text-purple-500 hover:text-white font-bold text-xs flex items-center gap-1" title="Gerenciar Permissões">
                                                    <Shield size={14} /> Acessos
                                                </button>
                                                <div className="h-4 w-[1px] bg-slate-800"></div>
                                                <button onClick={() => handleOpenEdit(u)} className="text-blue-500 hover:text-white font-bold text-xs flex items-center justify-end gap-1">
                                                    <Pencil size={14} /> Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* =============================== */}
            {/* TAB: API KEYS                    */}
            {/* =============================== */}
            {activeTab === 'API_KEYS' && (
                <div className="space-y-6">
                    {loadingSettings ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                            <Loader size={24} className="animate-spin mx-auto mb-3" />
                            Carregando configurações...
                        </div>
                    ) : settings.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                            <Key size={48} className="mx-auto mb-4 text-slate-700" />
                            <p className="text-slate-500 font-bold">Nenhuma configuração encontrada</p>
                            <p className="text-slate-600 text-sm mt-2">
                                Execute o SQL <code className="bg-slate-800 px-2 py-0.5 rounded text-violet-400">create_system_settings.sql</code> no Supabase para criar a tabela.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ===== CERTIFICADO DIGITAL (seção especial) ===== */}
                            {settingsByCategory['certificados'] && (
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                    <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                                        <FileKey size={16} className="text-cyan-400" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white">
                                            Certificado Digital A1 (NF-e / SEFAZ)
                                        </h3>
                                    </div>

                                    <div className="p-5 space-y-5">
                                        {/* Status do certificado */}
                                        {certInfo?.configured ? (
                                            <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                                                certInfo.expired
                                                    ? 'bg-red-500/5 border-red-500/20'
                                                    : (certInfo.days_remaining && certInfo.days_remaining < 30)
                                                        ? 'bg-amber-500/5 border-amber-500/20'
                                                        : 'bg-emerald-500/5 border-emerald-500/20'
                                            }`}>
                                                <div className={`p-2 rounded-lg ${
                                                    certInfo.expired ? 'bg-red-500/10' : 'bg-emerald-500/10'
                                                }`}>
                                                    <FileKey size={20} className={certInfo.expired ? 'text-red-400' : 'text-emerald-400'} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-white">{certInfo.cn}</span>
                                                        {certInfo.expired ? (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                                                                <AlertTriangle size={9} /> Expirado
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                <CheckCircle size={9} /> Ativo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Emissor: {certInfo.issuer} | Validade: {certInfo.expiry ? new Date(certInfo.expiry).toLocaleDateString('pt-BR') : '-'}
                                                        {certInfo.days_remaining !== undefined && !certInfo.expired && (
                                                            <span className={certInfo.days_remaining < 30 ? ' text-amber-400 font-bold' : ''}>
                                                                {' '}({certInfo.days_remaining} dias restantes)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={handleCertTest}
                                                        disabled={certTesting}
                                                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {certTesting ? <Loader size={12} className="animate-spin" /> : <Wifi size={12} />}
                                                        Testar
                                                    </button>
                                                    <button
                                                        onClick={handleCertRemove}
                                                        disabled={certRemoving}
                                                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-red-600/20 text-slate-500 hover:text-red-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {certRemoving ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 text-center">
                                                <FileKey size={32} className="mx-auto mb-2 text-slate-600" />
                                                <p className="text-sm text-slate-400 font-bold">Nenhum certificado configurado</p>
                                                <p className="text-xs text-slate-600 mt-1">Faça upload do arquivo .pfx para habilitar consulta de NF-e na SEFAZ</p>
                                            </div>
                                        )}

                                        {/* Upload form */}
                                        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase">
                                                {certInfo?.configured ? 'Substituir Certificado' : 'Enviar Certificado'}
                                            </h4>
                                            <div className="grid grid-cols-[1fr_200px_auto] gap-3 items-end">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Arquivo .pfx / .p12</label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept=".pfx,.p12"
                                                            onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cyan-600/20 file:text-cyan-400 hover:file:bg-cyan-600/30 focus:border-cyan-500 outline-none"
                                                        />
                                                    </div>
                                                    {certFile && (
                                                        <p className="text-[10px] text-cyan-400/70 mt-1">{certFile.name} ({(certFile.size / 1024).toFixed(1)} KB)</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Senha do Certificado</label>
                                                    <input
                                                        type="password"
                                                        value={certPassword}
                                                        onChange={(e) => setCertPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleCertUpload}
                                                    disabled={!certFile || !certPassword || certUploading}
                                                    className="px-5 py-2.5 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {certUploading ? (
                                                        <><Loader size={14} className="animate-spin" /> Salvando...</>
                                                    ) : (
                                                        <><Upload size={14} /> Enviar</>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-600 leading-relaxed">
                                                O certificado A1 (.pfx) sera armazenado de forma segura no banco de dados e usado exclusivamente
                                                para consulta de NF-e na SEFAZ via mTLS. Apenas certificados tipo A1 (arquivo) sao suportados.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== DEMAIS CATEGORIAS (exceto certificados) ===== */}
                            {Object.entries(settingsByCategory)
                                .filter(([category]) => category !== 'certificados')
                                .map(([category, items]) => (
                                <div key={category} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                    <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                                        {categoryIcons[category] || <Key size={16} className="text-slate-400" />}
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white">
                                            {categoryLabels[category] || category}
                                        </h3>
                                    </div>

                                    <div className="divide-y divide-slate-800/50">
                                        {items.filter(s => s.key !== 'nfe_certificate_pfx' && s.key !== 'nfe_certificate_password').map(setting => {
                                            const isEdited = editedValues[setting.key] !== undefined;
                                            const currentValue = isEdited ? editedValues[setting.key] : (setting.value || '');
                                            const isVisible = visibleKeys.has(setting.key);
                                            const hasValue = !!(setting.value);

                                            return (
                                                <div key={setting.id} className="p-5 hover:bg-slate-800/20 transition-colors">
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-1.5">
                                                                <span className="text-sm font-bold text-white">{setting.label}</span>
                                                                {hasValue ? (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                        <Wifi size={9} /> Configurado
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                                                                        <WifiOff size={9} /> Não configurado
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 leading-relaxed">{setting.description}</p>
                                                            <p className="text-[10px] text-slate-700 font-mono mt-1">{setting.key}</p>
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-shrink-0 w-[420px]">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type={setting.is_secret && !isVisible ? 'password' : 'text'}
                                                                    value={isEdited ? currentValue : (setting.is_secret && !isVisible ? maskValue(setting.value) : currentValue)}
                                                                    onChange={e => setEditedValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                                                                    onFocus={() => {
                                                                        if (!isEdited && setting.is_secret) {
                                                                            setEditedValues(prev => ({ ...prev, [setting.key]: setting.value || '' }));
                                                                        }
                                                                    }}
                                                                    placeholder={setting.is_secret ? '••••••••••••' : 'Não definido'}
                                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500 outline-none font-mono pr-10"
                                                                />
                                                                {setting.is_secret && (
                                                                    <button
                                                                        onClick={() => toggleVisibility(setting.key)}
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white p-1"
                                                                        title={isVisible ? 'Esconder' : 'Mostrar'}
                                                                    >
                                                                        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {setting.category === 'api_keys' && (
                                                                <button
                                                                    onClick={() => handleTestKey(setting)}
                                                                    disabled={testingKey === setting.key}
                                                                    className="px-3 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                                                                    title="Testar conexão"
                                                                >
                                                                    {testingKey === setting.key ? <Loader size={12} className="animate-spin" /> : <Wifi size={12} />}
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => handleSaveSetting(setting)}
                                                                disabled={!isEdited || savingKey === setting.key}
                                                                className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-30 ${
                                                                    isEdited
                                                                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20'
                                                                        : 'bg-slate-800 text-slate-600'
                                                                }`}
                                                            >
                                                                {savingKey === setting.key ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {setting.updated_at && hasValue && (
                                                        <p className="text-[10px] text-slate-700 mt-2">
                                                            Atualizado em {new Date(setting.updated_at).toLocaleString('pt-BR')}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Modal Editar Usuário */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUserId ? "Editar Usuário" : "Novo Usuário"}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="Ex: João da Silva" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="joao@terrapro.com" disabled={!!editingUserId} title={editingUserId ? "Para alterar o email, crie um novo usuário." : ""} />
                        {editingUserId && <p className="text-[10px] text-slate-500">O email não pode ser alterado diretamente.</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nível de Acesso (Role)</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                            <option value="operador">Operador (Acesso Limitado)</option>
                            <option value="gestor">Gestor / Mecânico (Ordens de Serviço)</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="viewer">Visualizador</option>
                            <option value="admin">Administrador (Mapas e Aprovações)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{editingUserId ? "Nova Senha (Opcional)" : "Senha Inicial"}</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder={editingUserId ? "Deixe em branco para manter a atual" : "******"} />
                        </div>
                    </div>
                    <button onClick={handleSaveUser} disabled={isSaving} className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                        {isSaving ? 'Salvando...' : <><Save size={18} /> {editingUserId ? 'Atualizar Usuário' : 'Criar Usuário'}</>}
                    </button>
                </div>
            </Modal>

            {/* Modal Permissões */}
            <Modal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} title={`Permissões de Acesso: ${selectedUserForPermissions?.name?.split(' ')[0] || 'Usuário'}`}>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loadingPermissions ? (
                        <div className="p-12 text-center text-slate-500">Carregando módulos...</div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(systemModules.reduce((acc: any, mod) => {
                                if (!acc[mod.category]) acc[mod.category] = [];
                                acc[mod.category].push(mod);
                                return acc;
                            }, {})).map(([category, modules]: [string, any]) => (
                                <div key={category} className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-1">{category}</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {modules.map((mod: any) => {
                                            const hasAccess = userPermissions.some(p => p.module_slug === mod.slug);
                                            return (
                                                <div key={mod.id} onClick={() => handleTogglePermission(mod.slug)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${hasAccess ? 'bg-emerald-900/10 border-emerald-500/30 hover:bg-emerald-900/20' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'}`}>
                                                    <div>
                                                        <p className={`text-sm font-bold ${hasAccess ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{mod.name}</p>
                                                        <p className="text-[10px] text-slate-600 font-mono">{mod.slug}</p>
                                                    </div>
                                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${hasAccess ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${hasAccess ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleSavePermissions} disabled={isSaving} className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all sticky bottom-0">
                                {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar Permissões</>}
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
