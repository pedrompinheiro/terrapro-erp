import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Plus,
    Download,
    Trash2,
    Filter,
    File,
    Image as ImageIcon,
    FileSpreadsheet,
    AlertCircle,
    Calendar,
    FolderOpen
} from 'lucide-react';
import { dashboardService } from '../services/api';
import { ERPDocument, DocumentCategory } from '../types';
import Modal from '../components/Modal';

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<ERPDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // New Document State
    const [newDoc, setNewDoc] = useState<Partial<ERPDocument>>({
        title: '',
        category: 'OUTROS',
        fileType: 'PDF',
        relatedTo: ''
    });

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        const data = await dashboardService.getDocuments();
        setDocuments(data);
        setLoading(false);
    };

    const handleUpload = async () => {
        if (!newDoc.title || !newDoc.category) return;

        const doc: ERPDocument = {
            id: `DOC-${Math.floor(Math.random() * 10000)}`,
            title: newDoc.title,
            category: newDoc.category as DocumentCategory,
            fileType: newDoc.fileType as any || 'PDF',
            filename: `${newDoc.title.replace(/\s+/g, '_').toUpperCase()}.${newDoc.fileType?.toLowerCase() || 'pdf'}`,
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            relatedTo: newDoc.relatedTo
        };

        await dashboardService.addDocument(doc);
        await loadDocuments();
        setIsUploadModalOpen(false);
        setNewDoc({ title: '', category: 'OUTROS', fileType: 'PDF', relatedTo: '' });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            await dashboardService.deleteDocument(id);
            await loadDocuments();
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText size={24} className="text-red-500" />;
            case 'DOCX': return <FileText size={24} className="text-blue-500" />;
            case 'XLSX': return <FileSpreadsheet size={24} className="text-emerald-500" />;
            case 'IMAGE': return <ImageIcon size={24} className="text-purple-500" />;
            default: return <File size={24} className="text-slate-500" />;
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.relatedTo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-screen flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <FolderOpen className="text-blue-500" size={32} />
                        Gestão Eletrônica de Documentos (GED)
                    </h2>
                    <p className="text-slate-500 mt-1 ml-11">Repositório centralizado de arquivos, licenças e contratos.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus size={18} /> Novo Documento
                </button>
            </div>

            {/* Filters & Toolbar */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shrink-0">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Search className="text-slate-500" size={20} />
                    <input
                        placeholder="Buscar por nome, veículo ou funcionário..."
                        className="bg-transparent text-white outline-none w-full placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {['ALL', 'FISCAL', 'LEGAL', 'RH', 'VEICULOS', 'LICENCAS'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {cat === 'ALL' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="group bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-slate-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                                    {getFileIcon(doc.fileType)}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{doc.category}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {doc.uploadDate}</span>
                                        <span className="text-xs text-slate-500">{doc.fileSize}</span>
                                        {doc.relatedTo && (
                                            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Ref: {doc.relatedTo}</span>
                                        )}
                                    </div>
                                    {doc.expiryDate && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-500">
                                            <AlertCircle size={12} />
                                            <span className="font-bold">Vence em: {doc.expiryDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Baixar">
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredDocs.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex p-4 rounded-full bg-slate-900 text-slate-600 mb-4">
                                <FolderOpen size={48} />
                            </div>
                            <h3 className="text-white font-bold text-lg">Nenhum documento encontrado</h3>
                            <p className="text-slate-500 text-sm">Tente ajustar os filtros ou adicione um novo documento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Novo Documento">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Título do Documento</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                            placeholder="Ex: Nota Fiscal 1234..."
                            value={newDoc.title}
                            onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                value={newDoc.category}
                                onChange={e => setNewDoc({ ...newDoc, category: e.target.value as any })}
                            >
                                <option value="FISCAL">Fiscal</option>
                                <option value="LEGAL">Legal / Contratos</option>
                                <option value="RH">Recursos Humanos</option>
                                <option value="VEICULOS">Veículos / Frota</option>
                                <option value="LICENCAS">Licenças / Alvarás</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Arquivo</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                value={newDoc.fileType}
                                onChange={e => setNewDoc({ ...newDoc, fileType: e.target.value as any })}
                            >
                                <option value="PDF">PDF Documento</option>
                                <option value="IMAGE">Imagem (JPG/PNG)</option>
                                <option value="DOCX">Word (DOCX)</option>
                                <option value="XLSX">Excel (XLSX)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Vincular a (Opcional)</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                            placeholder="Ex: João da Silva ou Placa ABC-1234"
                            value={newDoc.relatedTo}
                            onChange={e => setNewDoc({ ...newDoc, relatedTo: e.target.value })}
                        />
                    </div>

                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer group">
                        <FileText size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Clique para selecionar o arquivo</span>
                        <span className="text-xs mt-1">PDF, JPG, PNG, DOCX (Max 10MB)</span>
                    </div>

                    <button
                        onClick={handleUpload}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
                    >
                        <Download className="rotate-180" size={18} /> Upload Documento
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Documents;
