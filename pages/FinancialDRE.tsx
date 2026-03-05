import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

interface DRERow {
  mes_competencia: string;
  grupo_dre: string;
  centro_codigo: string;
  centro_nome: string;
  centro_tipo: string;
  valor_total: number;
  qtd_titulos: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FinancialDRE: React.FC<Props> = ({ isOpen, onClose }) => {
  const [dreMonth, setDreMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [dreData, setDreData] = useState({
    receitaBruta: 0,
    custosDiretos: 0,
    despesasFixas: 0,
    resultadoFinanceiro: 0,
    details: {
      receitas: [] as { nome: string; valor: number }[],
      custos: [] as { nome: string; valor: number }[],
      despesas: [] as { nome: string; valor: number }[],
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadDREData();
    }
  }, [isOpen, dreMonth]);

  const loadDREData = async () => {
    setLoading(true);
    try {
      // Consumir vw_dre_competencia do SQL
      const mesDate = dreMonth + '-01';
      const { data, error } = await supabase
        .from('vw_dre_competencia')
        .select('*')
        .eq('mes_competencia', mesDate);

      if (error) {
        console.error('Erro ao carregar DRE da view:', error);
        // Fallback: tentar carregar sem a view (dados brutos)
        await loadDREFallback();
        return;
      }

      if (!data || data.length === 0) {
        setDreData({
          receitaBruta: 0, custosDiretos: 0, despesasFixas: 0, resultadoFinanceiro: 0,
          details: { receitas: [], custos: [], despesas: [] }
        });
        return;
      }

      // Processar dados da view
      let receitaBruta = 0;
      let custosDiretos = 0;
      let despesasFixas = 0;
      let resultadoFinanceiro = 0;
      const receitas: { nome: string; valor: number }[] = [];
      const custos: { nome: string; valor: number }[] = [];
      const despesas: { nome: string; valor: number }[] = [];

      (data as DRERow[]).forEach(row => {
        const valor = Number(row.valor_total);
        const grupo = row.grupo_dre || '';

        if (grupo.includes('Receita') && !grupo.includes('Financeira')) {
          receitaBruta += valor;
          const existing = receitas.find(r => r.nome === row.centro_nome);
          if (existing) existing.valor += valor;
          else receitas.push({ nome: row.centro_nome, valor });
        } else if (grupo.includes('Custos Diretos') || grupo.includes('CPV')) {
          custosDiretos += valor;
          const existing = custos.find(r => r.nome === row.centro_nome);
          if (existing) existing.valor += valor;
          else custos.push({ nome: row.centro_nome, valor });
        } else if (grupo.includes('Despesas') && !grupo.includes('Financeira')) {
          despesasFixas += valor;
          const existing = despesas.find(r => r.nome === row.centro_nome);
          if (existing) existing.valor += valor;
          else despesas.push({ nome: row.centro_nome, valor });
        } else if (grupo.includes('Financeiro') || grupo.includes('Financeira')) {
          resultadoFinanceiro += valor;
        }
      });

      setDreData({
        receitaBruta,
        custosDiretos,
        despesasFixas,
        resultadoFinanceiro,
        details: { receitas, custos, despesas }
      });
    } catch (err) {
      console.error('Erro ao carregar DRE:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback: carregar dados brutos se a view nao existir
  const loadDREFallback = async () => {
    try {
      const [year, month] = dreMonth.split('-').map(Number);
      const startDate = `${dreMonth}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      // Buscar receitas
      const { data: recebiveis } = await supabase
        .from('contas_receber')
        .select('id, valor_original, centro_custo_id, centros_custo:centros_custo(nome, grupo_dre)')
        .gte('data_vencimento', startDate)
        .lte('data_vencimento', endDate)
        .neq('status', 'CANCELADO');

      // Buscar despesas
      const { data: pagaveis } = await supabase
        .from('contas_pagar')
        .select('id, valor_original, centro_custo_id, centros_custo:centros_custo(nome, grupo_dre)')
        .gte('data_vencimento', startDate)
        .lte('data_vencimento', endDate)
        .neq('status', 'CANCELADO');

      // Buscar rateios do período (para contas que têm rateio ao invés de CC direto)
      const allIds = [
        ...(recebiveis || []).map(r => r.id),
        ...(pagaveis || []).map(p => p.id),
      ].filter(Boolean);

      let rateioMap: Record<string, { centro_nome: string; grupo_dre: string; valor: number }[]> = {};
      if (allIds.length > 0) {
        const { data: rateios } = await supabase
          .from('rateio_centro_custo')
          .select('lancamento_id, valor, centros_custo:centros_custo(nome, grupo_dre)')
          .in('lancamento_id', allIds);
        if (rateios) {
          for (const rat of rateios as any[]) {
            if (!rateioMap[rat.lancamento_id]) rateioMap[rat.lancamento_id] = [];
            rateioMap[rat.lancamento_id].push({
              centro_nome: rat.centros_custo?.nome || 'Outros',
              grupo_dre: rat.centros_custo?.grupo_dre || '',
              valor: rat.valor,
            });
          }
        }
      }

      // Helper: acumular valor em array de {nome, valor}
      const acumular = (arr: { nome: string; valor: number }[], nome: string, valor: number) => {
        const existing = arr.find(x => x.nome === nome);
        if (existing) existing.valor += valor;
        else arr.push({ nome, valor });
      };

      let receitaBruta = 0;
      let custosDiretos = 0;
      let despesasFixas = 0;
      const receitas: { nome: string; valor: number }[] = [];
      const custos: { nome: string; valor: number }[] = [];
      const despesas: { nome: string; valor: number }[] = [];

      (recebiveis || []).forEach((r: any) => {
        const rateioEntries = rateioMap[r.id];
        if (rateioEntries && rateioEntries.length > 0) {
          // Tem rateio — distribuir valor pelos centros
          for (const rat of rateioEntries) {
            if (rat.grupo_dre.includes('Receita')) {
              receitaBruta += rat.valor;
              acumular(receitas, rat.centro_nome, rat.valor);
            }
          }
        } else {
          // Sem rateio — usar CC direto
          const grupo = r.centros_custo?.grupo_dre || '';
          const nome = r.centros_custo?.nome || 'Outros';
          if (grupo.includes('Receita')) {
            receitaBruta += r.valor_original;
            acumular(receitas, nome, r.valor_original);
          }
        }
      });

      (pagaveis || []).forEach((p: any) => {
        const rateioEntries = rateioMap[p.id];
        if (rateioEntries && rateioEntries.length > 0) {
          // Tem rateio — distribuir valor pelos centros
          for (const rat of rateioEntries) {
            if (rat.grupo_dre.includes('Custos Diretos') || rat.grupo_dre.includes('CPV')) {
              custosDiretos += rat.valor;
              acumular(custos, rat.centro_nome, rat.valor);
            } else {
              despesasFixas += rat.valor;
              acumular(despesas, rat.centro_nome, rat.valor);
            }
          }
        } else {
          // Sem rateio — usar CC direto
          const grupo = p.centros_custo?.grupo_dre || '';
          const nome = p.centros_custo?.nome || 'Outros';
          if (grupo.includes('Custos Diretos') || grupo.includes('CPV')) {
            custosDiretos += p.valor_original;
            acumular(custos, nome, p.valor_original);
          } else {
            despesasFixas += p.valor_original;
            acumular(despesas, nome, p.valor_original);
          }
        }
      });

      setDreData({
        receitaBruta,
        custosDiretos,
        despesasFixas,
        resultadoFinanceiro: 0,
        details: { receitas, custos, despesas }
      });
    } catch (err) {
      console.error('Erro no fallback DRE:', err);
    }
  };

  const receitaLiquida = dreData.receitaBruta * 0.94;
  const lucroBruto = receitaLiquida - Math.abs(dreData.custosDiretos);
  const ebitda = lucroBruto - Math.abs(dreData.despesasFixas);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Demonstrativo de Resultado (DRE Gerencial)" size="2xl">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <Calendar className="text-slate-500" size={20} />
            <input
              type="month"
              value={dreMonth}
              onChange={(e) => setDreMonth(e.target.value)}
              className="bg-slate-950 text-white border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">Regime de Competencia</p>
            <p className="text-sm font-bold text-white">Consolidado</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-800">
                {/* RECEITA BRUTA */}
                <tr className="bg-slate-900 sticky top-0 z-10">
                  <td className="p-4 font-black text-emerald-400">1. RECEITA OPERACIONAL BRUTA</td>
                  <td className="p-4 text-right font-black text-emerald-400">
                    R$ {dreData.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {dreData.details.receitas.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.receitas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono">
                      {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}

                {/* DEDUCOES */}
                <tr className="bg-slate-950/50">
                  <td className="p-3 font-bold text-rose-400 pl-6 text-xs">(-) Impostos / Deducoes (Simulado 6%)</td>
                  <td className="p-3 text-right font-bold text-rose-400 text-xs">
                    (R$ {(dreData.receitaBruta * 0.06).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>

                {/* RECEITA LIQUIDA */}
                <tr className="bg-slate-800 border-t border-slate-700">
                  <td className="p-3 font-black text-white text-xs uppercase tracking-wider">= RECEITA LIQUIDA</td>
                  <td className="p-3 text-right font-black text-white">
                    R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* CPV */}
                <tr className="bg-slate-900 mt-4 border-t-2 border-slate-800 sticky top-10">
                  <td className="p-4 font-black text-amber-500">2. CUSTOS DIRETOS (CPV)</td>
                  <td className="p-4 text-right font-black text-amber-500">
                    (R$ {Math.abs(dreData.custosDiretos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                {dreData.details.custos.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.custos.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono text-rose-400">
                      ({Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                ))}

                {/* LUCRO BRUTO */}
                <tr className="bg-slate-800 border-t border-slate-700">
                  <td className="p-3 font-black text-white text-xs uppercase tracking-wider">= LUCRO BRUTO</td>
                  <td className="p-3 text-right font-black text-white">
                    R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* DESPESAS OP */}
                <tr className="bg-slate-900 mt-4 border-t-2 border-slate-800">
                  <td className="p-4 font-black text-rose-500">3. DESPESAS OPERACIONAIS</td>
                  <td className="p-4 text-right font-black text-rose-500">
                    (R$ {Math.abs(dreData.despesasFixas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                {dreData.details.despesas.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.despesas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-rose-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono text-rose-400">
                      ({Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                ))}

                {/* EBITDA */}
                <tr className="bg-slate-800 border-t-2 border-slate-600">
                  <td className="p-4 font-black text-white text-lg">= EBITDA</td>
                  <td className={`p-4 text-right font-black text-lg ${ebitda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FinancialDRE;
