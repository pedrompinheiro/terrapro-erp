
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const TestConnection: React.FC = () => {
    const [status, setStatus] = useState<string>('Verificando...');
    const [details, setDetails] = useState<string>('');
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        setConfig({ url, key: key ? key.substring(0, 10) + '...' : 'NÃO DEFINIDA' });

        if (!url || !key) {
            setStatus('ERRO: Configuração Ausente');
            setDetails('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env.local');
            return;
        }

        const supabase = createClient(url, key);

        const checkConnection = async () => {
            try {
                // Teste 1: Fetch direto (Diagnóstico de Rede/CORS)
                const response = await fetch(`${url}/rest/v1/employees?select=count`, {
                    headers: {
                        apikey: key || '',
                        Authorization: `Bearer ${key || ''}`
                    }
                });

                if (!response.ok) {
                    const text = await response.text();
                    setStatus(`ERRO HTTP ${response.status} ❌`);
                    setDetails(`Falha no fetch direto.\nStatus: ${response.status} ${response.statusText}\nResposta: ${text}`);
                    return;
                }

                // Teste 2: Cliente Supabase (se fetch passar)
                const { data, error, count } = await supabase
                    .from('employees')
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.error("Erro Supabase Completo:", error);
                    setStatus('FALHA NO CLIENTE ❌');
                    setDetails(`Mensagem: ${error.message}\nCódigo: ${error.code}\nHint: ${error.hint}\nObjeto: ${JSON.stringify(error)}`);
                } else {
                    setStatus('CONEXÃO BEM SUCEDIDA ✅');
                    setDetails(`Tudo certo! Conectado ao projeto via cliente.\nTotal de funcionários: ${count}`);
                }
            } catch (err: any) {
                setStatus('ERRO DE REDE/CÓDIGO 💥');
                setDetails(`Exceção capturada:\n${err.message || String(err)}\n\n(Provável bloqueio de CORS ou DNS)`);
            }
        };

        checkConnection();
    }, []);


    const createTestEmployee = async () => {
        setStatus('TENTANDO CRIAR FUNCIONÁRIO...');
        try {
            // Primeiro obtemos uma empresa (company_id)
            const supabase = createClient(config.url, config.key);

            // Tenta pegar id da empresa
            const { data: companies } = await supabase.from('companies').select('id').limit(1);
            const companyId = companies?.[0]?.id;

            if (!companyId) {
                setStatus('ERRO: S/ EMPRESA ❌');
                setDetails('Não foi possível encontrar uma empresa na tabela "companies" para vincular o funcionário.');
                return;
            }

            const { data, error } = await supabase
                .from('employees')
                .insert({
                    company_id: companyId,
                    full_name: 'Funcionário Teste ' + Math.floor(Math.random() * 1000),
                    job_title: 'Tester Frontend',
                    registration_number: 'TEST-' + Math.floor(Math.random() * 1000),
                    // active: true // Removido pois pode não existir no schema
                })
                .select();

            if (error) {
                setStatus('ERRO AO CRIAR ❌');
                setDetails(`Falha no INSERT: ${error.message}\nVerifique se há políticas RLS permitindo INSERT para users anônimos/autenticados.`);
            } else {
                setStatus('SUCESSO NA CRIAÇÃO ✅');
                setDetails(`Funcionário criado: ${JSON.stringify(data)}\nAgora recarregue a página de RH.`);
            }
        } catch (err: any) {
            setStatus('ERRO EXCEÇÃO 💥');
            setDetails(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-xl max-w-lg w-full shadow-2xl border border-slate-700">
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    🔍 Diagnóstico de Conexão
                </h1>

                <div className={`p-4 rounded-lg mb-6 text-center font-bold text-lg ${status.includes('BEM SUCEDIDA') || status.includes('SUCESSO') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                    {status}
                </div>

                <div className="space-y-4 text-sm text-slate-300 font-mono bg-slate-950 p-4 rounded-lg overflow-x-auto">
                    <div>
                        <span className="text-slate-500">URL do Projeto:</span><br />
                        {config.url || 'Não encontrada'}
                    </div>
                    <div>
                        <span className="text-slate-500">Chave API (Início):</span><br />
                        {config.key}
                    </div>
                    <div className="pt-2 border-t border-slate-800 mt-2">
                        <span className="text-slate-500">Detalhes do Teste:</span><br />
                        {details}
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                    >
                        🔄 Retestar Conexão
                    </button>

                    <button
                        onClick={createTestEmployee}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
                    >
                        ➕ Tentar Criar Funcionário de Teste
                    </button>
                </div>

                <div className="mt-6 text-xs text-slate-500 text-center">
                    Se a conexão funciona mas a lista vem vazia, tente criar um funcionário acima.<br />
                    Se falhar criar, é permissão (RLS) de INSERT.
                </div>
            </div>
        </div>
    );
};

export default TestConnection;

