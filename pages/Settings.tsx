import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCog, Lock, Save, Plus, Search, Loader, Pencil, Shield } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'operador', password: '' });

    // Permissions State
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
    const [systemModules, setSystemModules] = useState<any[]>([]);
    const [userPermissions, setUserPermissions] = useState<any[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        fetchUsers();
    }, []);

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
            password: '' // Senha vazia = não alterar
        });
        setIsModalOpen(true);
    };

    const handleOpenPermissions = async (user: any) => {
        setSelectedUserForPermissions(user);
        setLoadingPermissions(true);
        setIsPermissionsModalOpen(true);

        try {
            // 1. Buscas Módulos
            const { data: modules, error: modError } = await supabase
                .from('system_modules')
                .select('*')
                .eq('is_active', true)
                .order('category')
                .order('name');

            if (modError) throw modError;
            setSystemModules(modules || []);

            // 2. Busca Permissões Atuais do Usuário
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
            if (exists) {
                // Remove (Desmarcar) -> Remove da lista local (será deletado ou update false no save)
                // Vamos remover da lista para indicar "sem permissão"
                return prev.filter(p => p.module_slug !== moduleSlug);
            } else {
                // Adiciona (Marcar) -> Default all true for simplicity
                return [...prev, { module_slug: moduleSlug, can_read: true, can_create: true, can_update: true, can_delete: true }];
            }
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedUserForPermissions) return;
        setIsSaving(true);
        try {
            // Estratégia simples: Delete All user permissions and Insert All Selected
            // (Melhor seria UPSERT inteligente, mas DELETE+INSERT é seguro e limpo para esse caso)

            // 1. Delete todas existentes
            await supabase.from('user_permissions').delete().eq('user_id', selectedUserForPermissions.id);

            // 2. Insere as novas
            if (userPermissions.length > 0) {
                const payload = userPermissions.map(p => ({
                    user_id: selectedUserForPermissions.id,
                    module_slug: p.module_slug,
                    can_read: true, // Forçando tudo true no toggle simples
                    can_create: true,
                    can_update: true,
                    can_delete: true
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
        // Validação
        if (!userForm.email) return alert('Email é obrigatório');
        if (!editingUserId && !userForm.password) return alert('Senha é obrigatória para novos usuários');

        setIsSaving(true);
        try {
            const action = editingUserId ? 'updateUser' : 'createUser';
            const payload = {
                id: editingUserId, // Ignorado no create
                email: userForm.email,
                password: userForm.password, // Pode ser vazio no update
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

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Configurações & Acesso</h2>
                    <p className="text-slate-500 mt-1">Gestão de usuários, permissões e segurança do sistema.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Novo Usuário
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Nível de Segurança</p>
                        <h3 className="text-white font-bold text-lg">Protegido</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                        <UserCog size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Usuários Ativos</p>
                        <h3 className="text-white font-bold text-lg">{users.length} Usuários</h3>
                    </div>
                </div>
            </div>

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
                            <th className="px-8 py-4">Função (Role)</th>
                            <th className="px-8 py-4">Acesso</th>
                            <th className="px-8 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando usuários...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
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
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                            u.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-500' :
                                                u.role === 'MECHANIC' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-slate-700 text-slate-400'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-500 text-xs">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleOpenPermissions(u)}
                                            className="text-purple-500 hover:text-white font-bold text-xs flex items-center gap-1"
                                            title="Gerenciar Permissões"
                                        >
                                            <Shield size={14} /> Acessos
                                        </button>
                                        <div className="h-4 w-[1px] bg-slate-800"></div>
                                        <button
                                            onClick={() => handleOpenEdit(u)}
                                            className="text-blue-500 hover:text-white font-bold text-xs flex items-center justify-end gap-1"
                                        >
                                            <Pencil size={14} /> Editar
                                        </button>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>

            {/* Modal Editar Usuário */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUserId ? "Editar Usuário" : "Novo Usuário"}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            value={userForm.name}
                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            value={userForm.email}
                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                            placeholder="joao@terrapro.com"
                            disabled={!!editingUserId} // Email geralmente não muda fácil no Supabase Auth sem reconfirmar, melhor bloquear edição simples
                            title={editingUserId ? "Para alterar o email, crie um novo usuário." : ""}
                        />
                        {editingUserId && <p className="text-[10px] text-slate-500">O email não pode ser alterado diretamente.</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nível de Acesso (Role)</label>
                        <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            value={userForm.role}
                            onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                        >
                            <option value="operador">Operador (Acesso Limitado)</option>
                            <option value="gestor">Gestor / Mecânico (Ordens de Serviço)</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="viewer">Visualizador</option>
                            <option value="admin">Administrador (Mapas e Aprovações)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                            {editingUserId ? "Nova Senha (Opcional)" : "Senha Inicial"}
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none"
                                value={userForm.password}
                                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                placeholder={editingUserId ? "Deixe em branco para manter a atual" : "******"}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveUser}
                        disabled={isSaving}
                        className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? 'Salvando...' : <><Save size={18} /> {editingUserId ? 'Atualizar Usuário' : 'Criar Usuário'}</>}
                    </button>

                </div>
            </Modal>

            {/* Modal Permissões Granulares */}
            <Modal
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                title={`Permissões de Acesso: ${selectedUserForPermissions?.name?.split(' ')[0] || 'Usuário'}`}
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loadingPermissions ? (
                        <div className="p-12 text-center text-slate-500">Carregando módulos...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Agrupar por Categoria */}
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
                                                <div
                                                    key={mod.id}
                                                    onClick={() => handleTogglePermission(mod.slug)}
                                                    className={`
                                                        p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group
                                                        ${hasAccess
                                                            ? 'bg-emerald-900/10 border-emerald-500/30 hover:bg-emerald-900/20'
                                                            : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                                                        }
                                                    `}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-bold ${hasAccess ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                            {mod.name}
                                                        </p>
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

                            <button
                                onClick={handleSavePermissions}
                                disabled={isSaving}
                                className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all sticky bottom-0"
                            >
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
