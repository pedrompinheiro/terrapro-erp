
import React, { useState } from 'react';
import { ShieldCheck, UserCog, Lock, Save, Plus, Search } from 'lucide-react';
import Modal from '../components/Modal';

const Settings: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const users = [
        { id: 1, name: 'Pedro Miranda', email: 'admin@terrapro.com', role: 'ADMIN', lastLogin: 'Hoje 14:30' },
        { id: 2, name: 'João Mecânico', email: 'joao@terrapro.com', role: 'OPERATOR', lastLogin: 'Ontem 09:15' },
        { id: 3, name: 'Maria Financeiro', email: 'maria@terrapro.com', role: 'MANAGER', lastLogin: 'Hoje 08:00' },
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Configurações & Acesso</h2>
                    <p className="text-slate-500 mt-1">Gestão de usuários, permissões e segurança do sistema.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
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
                        <h3 className="text-white font-bold text-lg">Alto (MFA Ativo)</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                        <UserCog size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Usuários Ativos</p>
                        <h3 className="text-white font-bold text-lg">12 Usuários</h3>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Usuários do Sistema</h3>
                    <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 w-full max-w-md focus-within:border-blue-500 transition-all">
                        <Search size={18} className="text-slate-500" />
                        <input
                            placeholder="Buscar usuário por nome ou email..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
                        />
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-8 py-4">Usuário</th>
                            <th className="px-8 py-4">Email</th>
                            <th className="px-8 py-4">Função (Role)</th>
                            <th className="px-8 py-4">Último Acesso</th>
                            <th className="px-8 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {u.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-white">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-slate-400">{u.email}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                            u.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-slate-700 text-slate-400'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-slate-500 text-xs">{u.lastLogin}</td>
                                <td className="px-8 py-5 text-right">
                                    <button className="text-blue-500 hover:text-white font-bold text-xs">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Usuário"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nível de Acesso (Role)</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                            <option value="OPERATOR">Operador (Acesso Limitado)</option>
                            <option value="MECHANIC">Mecânico (Ordens de Serviço)</option>
                            <option value="MANAGER">Gerente (Relatórios e Aprovações)</option>
                            <option value="ADMIN">Administrador (Acesso Total)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Senha Temporária</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Criar Usuário
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
