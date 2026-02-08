
import React, { useState } from 'react';
import { Users, Building2, Briefcase, Search, Plus, Save, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

type EntityType = 'CLIENTS' | 'SUPPLIERS' | 'EMPLOYEES';

const Registrations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<EntityType>('CLIENTS');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data
    const clients = [
        { id: 1, name: 'Construtora Horizonte', doc: '12.345.678/0001-90', email: 'contato@horizonte.com', phone: '(11) 99999-0000', city: 'São Paulo, SP' },
        { id: 2, name: 'Mineração Vale do Sul', doc: '98.765.432/0001-10', email: 'compras@valedosul.com', phone: '(31) 3333-4444', city: 'Belo Horizonte, MG' },
    ];

    const suppliers = [
        { id: 1, name: 'Peças & Cia', doc: '11.222.333/0001-55', category: 'Peças Mecânicas', contact: 'Roberto', phone: '(11) 5555-1234' },
        { id: 2, name: 'PetroDiesel Distribuidora', doc: '44.555.666/0001-88', category: 'Combustível', contact: 'Fernanda', phone: '(21) 98888-7777' },
    ];

    const employees = [
        { id: 1, name: 'João da Silva', role: 'Mecânico Chefe', email: 'joao.silva@terrapro.com', status: 'ACTIVE' },
        { id: 2, name: 'Maria Oliveira', role: 'Gerente Operacional', email: 'maria.oliveira@terrapro.com', status: 'ACTIVE' },
        { id: 3, name: 'Carlos Santos', role: 'Operador de Máquinas', email: 'carlos.santos@terrapro.com', status: 'VACATION' },
    ];

    const renderHeader = () => (
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Cadastros Gerais</h2>
                <p className="text-slate-500 mt-1">Gestão centralizada de entidades do sistema.</p>
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2"
            >
                <Plus size={18} />
                {activeTab === 'CLIENTS' ? 'Novo Cliente' : activeTab === 'SUPPLIERS' ? 'Novo Fornecedor' : 'Novo Funcionário'}
            </button>
        </div>
    );

    const renderTabs = () => (
        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
            <button
                onClick={() => setActiveTab('CLIENTS')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'CLIENTS' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
            >
                <div className="flex items-center gap-2">
                    <Users size={18} /> Clientes
                </div>
            </button>
            <button
                onClick={() => setActiveTab('SUPPLIERS')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'SUPPLIERS' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
            >
                <div className="flex items-center gap-2">
                    <Building2 size={18} /> Fornecedores
                </div>
            </button>
            <button
                onClick={() => setActiveTab('EMPLOYEES')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'EMPLOYEES' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
            >
                <div className="flex items-center gap-2">
                    <Briefcase size={18} /> Funcionários
                </div>
            </button>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {renderHeader()}
            {renderTabs()}

            {/* Main Content Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/20">
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            placeholder="Buscar..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                {activeTab === 'CLIENTS' && (
                                    <>
                                        <th className="px-8 py-4">Nome / Razão Social</th>
                                        <th className="px-8 py-4">CNPJ / CPF</th>
                                        <th className="px-8 py-4">Contato</th>
                                        <th className="px-8 py-4">Cidade</th>
                                    </>
                                )}
                                {activeTab === 'SUPPLIERS' && (
                                    <>
                                        <th className="px-8 py-4">Fornecedor</th>
                                        <th className="px-8 py-4">CNPJ</th>
                                        <th className="px-8 py-4">Categoria</th>
                                        <th className="px-8 py-4">Contato Oficial</th>
                                    </>
                                )}
                                {activeTab === 'EMPLOYEES' && (
                                    <>
                                        <th className="px-8 py-4">Colaborador</th>
                                        <th className="px-8 py-4">Cargo / Função</th>
                                        <th className="px-8 py-4">Email Corporativo</th>
                                        <th className="px-8 py-4">Status</th>
                                    </>
                                )}
                                <th className="px-8 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {activeTab === 'CLIENTS' && clients.map(c => (
                                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{c.name}</td>
                                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{c.doc}</td>
                                    <td className="px-8 py-5 text-slate-300">
                                        <div className="flex flex-col">
                                            <span>{c.email}</span>
                                            <span className="text-xs text-slate-500">{c.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-400">{c.city}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'SUPPLIERS' && suppliers.map(s => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{s.name}</td>
                                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{s.doc}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold uppercase text-slate-300">{s.category}</span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-300">
                                        <div className="flex flex-col">
                                            <span>{s.contact}</span>
                                            <span className="text-xs text-slate-500">{s.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'EMPLOYEES' && employees.map(e => (
                                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{e.name}</td>
                                    <td className="px-8 py-5 text-slate-300">{e.role}</td>
                                    <td className="px-8 py-5 text-slate-400">{e.email}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${e.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {e.status === 'ACTIVE' ? 'Ativo' : 'Férias'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    activeTab === 'CLIENTS' ? 'Novo Cliente' :
                        activeTab === 'SUPPLIERS' ? 'Novo Fornecedor' : 'Novo Funcionário'
                }
            >
                {activeTab === 'CLIENTS' ? (
                    <div className="space-y-6">
                        {/* Tabs for Client Form */}
                        <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
                            <button className="px-3 py-1.5 text-xs font-bold text-blue-500 border-b-2 border-blue-500">Dados Gerais</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">Comercial e Crédito</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">Societário e Docs</button>
                        </div>

                        {/* General Data Section */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Razão Social / Nome Completo</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Terraplanagem do Brasil LTDA" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">CNPJ / CPF</label>
                                    <div className="flex gap-2">
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="00.000.000/0001-00" />
                                        <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl" title="Consulta Receita Federal"><Search size={18} /></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Inscrição Estadual</label>
                                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="Isento" />
                                </div>
                            </div>
                        </div>

                        {/* Commercial & Credit Section Preview (Simulated inside the long form for simplicity or tabs logic can be added later) */}
                        <div className="pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Análise de Crédito e Vendas</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Limite de Crédito (R$)</label>
                                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none" placeholder="0,00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Classificação (Rating)</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                        <option>BOM - Aprovado</option>
                                        <option>REGULAR - Restrito</option>
                                        <option>RUIM - Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-8 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Condição de Pagamento Padrão</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                        <option>28 DDL</option>
                                        <option>30/60/90 DDL</option>
                                        <option>À Vista (Antecipado)</option>
                                    </select>
                                </div>
                                <div className="col-span-12 md:col-span-4 space-y-2 flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-3 rounded-xl w-full hover:border-blue-500 transition-colors">
                                        <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                        <span className="text-xs font-bold text-white">Vender só à Vista</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Societary Section */}
                        <div className="pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quadro Societário e Documentos</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-5"><input className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" placeholder="Nome do Sócio 1" /></div>
                                    <div className="col-span-3"><input className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" placeholder="CPF" /></div>
                                    <div className="col-span-3"><input className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" placeholder="% Part." /></div>
                                    <div className="col-span-1 flex items-center justify-center"><button className="p-2 bg-blue-600/20 text-blue-500 rounded-lg"><Plus size={14} /></button></div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 border border-dashed border-slate-700 bg-slate-900/50 p-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                                        Anexar Cartão CNPJ
                                    </button>
                                    <button className="flex-1 border border-dashed border-slate-700 bg-slate-900/50 p-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                                        Anexar Contrato Social
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Cancelar</button>
                            <button onClick={() => setIsModalOpen(false)} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                                <Save size={18} /> Salvar Cliente Completo
                            </button>
                        </div>
                    </div>
                ) : (
                    // Default Simple Form for other tabs (Suppliers/Employees) since user specially requested CLIENT info detail
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo / Razão Social</label>
                            <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        {activeTab !== 'EMPLOYEES' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Documento (CPF/CNPJ)</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                        )}
                        {activeTab === 'EMPLOYEES' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Cargo / Função</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                    <option>Mecânico</option>
                                    <option>Operador</option>
                                    <option>Administrativo</option>
                                    <option>Gerente</option>
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Salário Base (CLT)</label>
                                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
                                    <span className="text-slate-500 text-xs">R$</span>
                                    <input className="w-full bg-transparent text-white focus:outline-none" placeholder="2.500,00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Admissão</label>
                                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                        </div>

                        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Composição Salarial ("Penduricalhos")</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Periculosidade (30%)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Insalubridade (Grau Médio)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Adicional Noturno (20%)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Salário Família</span>
                                </label>
                            </div>
                            <div className="pt-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Bonificação Fixa (Função)</label>
                                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 mt-1">
                                    <span className="text-slate-500 text-xs">R$</span>
                                    <input className="w-full bg-transparent text-white text-xs focus:outline-none" placeholder="0,00" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Salvar Colaborador
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Registrations;
