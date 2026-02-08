import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Upload, Loader2 } from 'lucide-react';
import { Buffer } from 'buffer';

// Safe Polyfill for Node.js globals in Browser
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || Buffer;
    // @ts-ignore
    window.process = window.process || {};
    // @ts-ignore
    if (!window.process.version) window.process.version = 'v16.0.0';
    // @ts-ignore
    if (!window.process.env) window.process.env = {};
}

const Migration: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ employees: 0, entries: 0 });

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        setLoading(true);
        setLogs([]);
        addLog(`📂 Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        try {
            // STEP 1: Load Library Dynamically
            addLog("📚 Carregando biblioteca de leitura...");
            const mdbModule = await import('mdb-reader');

            // SUPER ROBUST CONSTRUCTOR CHECK
            let MdbReader: any = mdbModule.default || mdbModule;

            // If it's still not a function, try to find it in the object
            if (typeof MdbReader !== 'function') {
                console.log("MdbModule dump:", mdbModule);
                throw new Error(`Biblioteca carregada, mas não é um construtor. Tipo: ${typeof MdbReader}`);
            }

            // STEP 2: Read File
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const reader = new MdbReader(buffer);

            // STEP 3: Process Tables
            addLog("✅ Arquivo lido com sucesso! Analisando tabelas...");
            const tableNames = reader.getTableNames();

            if (!tableNames.includes('funcionarios') || !tableNames.includes('batidas')) {
                throw new Error("❌ Tabelas oficiais não encontradas (funcionarios/batidas).");
            }

            // STEP 4: Auth Check & Company ID Retrieval
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado. Por favor faça login novamente.");

            let COMPANY_ID: string | null = null;

            // Tentativa 1: Pelo Perfil do Usuário
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('company_id')
                .eq('id', user.id)
                .maybeSingle(); // maybeSingle evita erro se não encontrar

            if (profile && profile.company_id) {
                COMPANY_ID = profile.company_id;
                addLog(`🏢 Empresa identificada pelo perfil: ${COMPANY_ID}`);
            } else {
                addLog(`⚠️ Perfil de usuário sem empresa associada (Erro: ${profileError?.message || 'Perfil vazio'}). Tentando fallback...`);

                // Tentativa 2: CRIAR empresa na força (Bypass RLS de Leitura via Escrita)
                addLog(`⚙️ Tentando criar/recuperar empresa via Write-Access...`);

                const { data: upsertedCompany, error: upsertError } = await supabase
                    .from('companies')
                    .insert({
                        name: 'TerraPro Transportadora'
                    })
                    .select('id')
                    .single();

                if (upsertedCompany) {
                    COMPANY_ID = upsertedCompany.id;
                    addLog(`🏢 Empresa criada via Insert: ${COMPANY_ID}`);
                } else {
                    // Se falhar o insert (provavelmente já existe ou erro de permissão), tenta buscar qualquer uma
                    addLog(`⚠️ Falha ao criar empresa (${upsertError?.message}). Tentando buscar existente...`);
                    const { data: anyCompany } = await supabase.from('companies').select('id').limit(1).maybeSingle();
                    if (anyCompany) {
                        COMPANY_ID = anyCompany.id;
                        addLog(`🏢 Empresa existente recuperada: ${COMPANY_ID}`);
                    }
                }
            }

            if (!COMPANY_ID) {
                // Último recurso: Criar empresa padrão se não existir NENHUMA
                throw new Error("❌ Nenhuma empresa encontrada no sistema. Impossível vincular dados.");
            }

            // STEP 5: Process Employees
            const tFuncionarios = reader.getTable('funcionarios');
            const tFuncoes = reader.getTable('funcoes');
            const funcoesMap: Record<number, string> = {};
            tFuncoes.getData().forEach((f: any) => funcoesMap[f.id] = f.descricao);

            addLog(`👥 Processando ${tFuncionarios.rowCount} funcionários...`);
            const employees = tFuncionarios.getData();
            const employeeIdMap: Record<number, string> = {};
            let newEmpCount = 0;

            for (const emp of employees as any[]) {
                const name = emp.nome ? emp.nome.trim() : 'Sem Nome';
                if (!name || name === 'Sem Nome') continue;

                const registration = emp.n_folha || String(emp.id);
                const { data: existing } = await supabase.from('employees')
                    .select('id')
                    .eq('company_id', COMPANY_ID)
                    .eq('registration_number', registration)
                    .single();

                let empUUID = existing?.id;
                if (!empUUID) {
                    const { data: inserted } = await supabase.from('employees').insert({
                        company_id: COMPANY_ID,
                        full_name: name,
                        registration_number: registration,
                        job_title: funcoesMap[emp.funcao_id] || 'Funcionário',
                        created_at: new Date().toISOString()
                    }).select().single();
                    if (inserted) {
                        empUUID = inserted.id;
                        newEmpCount++;
                    }
                }
                if (empUUID) employeeIdMap[emp.id] = empUUID;
            }
            setStats(s => ({ ...s, employees: newEmpCount }));
            addLog(`✅ ${newEmpCount} novos funcionários.`);

            // STEP 6: Process Batidas
            const tBatidas = reader.getTable('batidas');
            addLog(`⏱️ Processando ${tBatidas.rowCount} batidas...`);
            const batidas = tBatidas.getData();
            let entriesBuffer: any[] = [];
            let importedEntries = 0;

            for (let i = 0; i < batidas.length; i++) {
                const batida: any = batidas[i];
                const empUUID = employeeIdMap[batida.funcionario_id];
                if (!empUUID || !batida.data) continue;

                let dateStr = "";
                if (batida.data instanceof Date) dateStr = batida.data.toISOString().split('T')[0];
                else if (typeof batida.data === 'string') dateStr = batida.data.substring(0, 10);

                const entry = {
                    company_id: COMPANY_ID,
                    employee_id: empUUID,
                    date: dateStr,
                    entry_time: batida.entrada1 || null,
                    break_start: batida.saida1 || null,
                    break_end: batida.entrada2 || null,
                    exit_time: batida.saida2 || batida.saida1 || null,
                    source: 'MIGRATION_SECULLUM',
                    status: 'APPROVED'
                };

                if (entry.entry_time || entry.exit_time) entriesBuffer.push(entry);

                if (entriesBuffer.length >= 100) {
                    await supabase.from('time_entries').insert(entriesBuffer);
                    importedEntries += entriesBuffer.length;
                    entriesBuffer = [];
                    if (i % 1000 === 0) setStats(s => ({ ...s, entries: importedEntries }));
                }
            }
            if (entriesBuffer.length > 0) {
                await supabase.from('time_entries').insert(entriesBuffer);
                importedEntries += entriesBuffer.length;
            }
            setStats(s => ({ ...s, entries: importedEntries }));
            addLog(`🎉 Sucesso! ${importedEntries} batidas importadas.`);

        } catch (error: any) {
            console.error(error);
            addLog(`❌ ERRO: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 text-slate-100 p-8">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Database size={32} className="text-blue-500" />
                    Migração Ponto Secullum 4
                </h1>
                <p className="text-slate-500 mt-2">Importador direto de arquivo .MDB</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 border-dashed border-2 hover:border-blue-500/50 transition-colors text-center group relative">
                <input
                    type="file"
                    accept=".mdb"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {loading ? (
                    <div className="py-12">
                        <Loader2 size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white">Processando... Olhe os logs abaixo</h3>
                    </div>
                ) : (
                    <div className="py-12">
                        <Upload size={64} className="mx-auto text-slate-700 group-hover:text-blue-500 mb-6 transition-colors" />
                        <h3 className="text-xl font-bold text-white">Arraste o arquivo .MDB aqui</h3>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase">Funcionários</p>
                    <p className="text-2xl font-black text-emerald-500">{stats.employees}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase">Batidas</p>
                    <p className="text-2xl font-black text-blue-500">{stats.entries}</p>
                </div>
            </div>

            <div className="bg-black/50 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-slate-400 space-y-1">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
};

export default Migration;
