import { Asset, MaintenanceOS, ERPDocument, AuditLogEntry, NetworkSession } from '../types';
import { TimeRecord, PayrollEntry, EquipmentTimeline } from './mockData';
import { supabase } from '../lib/supabase';

// ============================================================
// dashboardService — 100% Supabase, zero dados mocados
// ============================================================

export const dashboardService = {

    // ─── ATIVOS / FROTA ──────────────────────────────────────

    getAssets: async (): Promise<Asset[]> => {
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .order('name');
        if (error) { console.error('[api] getAssets:', error.message); return []; }
        return data || [];
    },

    addAsset: async (asset: Partial<Asset>): Promise<Asset | null> => {
        const { data, error } = await supabase
            .from('assets')
            .insert(asset)
            .select()
            .single();
        if (error) { console.error('[api] addAsset:', error.message); return null; }
        return data;
    },

    updateAsset: async (updatedAsset: Asset): Promise<Asset | null> => {
        const { data, error } = await supabase
            .from('assets')
            .update(updatedAsset)
            .eq('id', updatedAsset.id)
            .select()
            .single();
        if (error) { console.error('[api] updateAsset:', error.message); return null; }
        return data;
    },

    deleteAsset: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from('assets')
            .update({ status: 'INATIVO', ativa: false })
            .eq('id', id);
        if (error) { console.error('[api] deleteAsset:', error.message); return false; }
        return true;
    },

    // ─── MANUTENÇÃO ──────────────────────────────────────────

    getMaintenanceOS: async (): Promise<MaintenanceOS[]> => {
        const { data, error } = await supabase
            .from('maintenance_os')
            .select('*, asset:assets(id, name, model)')
            .order('opened_at', { ascending: false });
        if (error) { console.error('[api] getMaintenanceOS:', error.message); return []; }
        return (data || []).map((row: any) => ({
            ...row,
            assetName: row.asset?.name || row.asset_id,
        }));
    },

    addMaintenanceOS: async (os: Partial<MaintenanceOS>): Promise<MaintenanceOS | null> => {
        const { data, error } = await supabase
            .from('maintenance_os')
            .insert(os)
            .select()
            .single();
        if (error) { console.error('[api] addMaintenanceOS:', error.message); return null; }
        return data;
    },

    updateMaintenanceOS: async (updatedOS: MaintenanceOS): Promise<MaintenanceOS | null> => {
        const { data, error } = await supabase
            .from('maintenance_os')
            .update(updatedOS)
            .eq('id', updatedOS.id)
            .select()
            .single();
        if (error) { console.error('[api] updateMaintenanceOS:', error.message); return null; }
        return data;
    },

    deleteMaintenanceOS: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from('maintenance_os')
            .update({ status: 'CANCELADO' })
            .eq('id', id);
        if (error) { console.error('[api] deleteMaintenanceOS:', error.message); return false; }
        return true;
    },

    // ─── RH — FUNCIONÁRIOS ───────────────────────────────────

    getHREmployees: async () => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('name');
        if (error) { console.error('[api] getHREmployees:', error.message); return []; }
        return data || [];
    },

    _decimalToTime: (decimal: number) => {
        if (!decimal && decimal !== 0) return '00:00';
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },

    _calculateHours: (e1: string, s1: string, e2: string, s2: string) => {
        const toMinutes = (t: string) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return (h * 60) + m;
        };
        let total = 0;
        if (e1 && s1) total += Math.max(0, toMinutes(s1) - toMinutes(e1));
        if (e2 && s2) total += Math.max(0, toMinutes(s2) - toMinutes(e2));
        const h = Math.floor(total / 60);
        const m = total % 60;
        return {
            formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            decimal: Number((total / 60).toFixed(2))
        };
    },

    getHRTimeRecords: async (employeeId?: string, month?: string): Promise<TimeRecord[]> => {
        if (!employeeId) return [];
        let query = supabase
            .from('time_entries')
            .select('*')
            .eq('employee_id', employeeId)
            .order('date', { ascending: false });
        if (month) {
            query = query.gte('date', `${month}-01`).lte('date', `${month}-31`);
        } else {
            query = query.limit(100);
        }
        const { data, error } = await query;
        if (error) { console.error('[api] getHRTimeRecords:', error.message); return []; }
        return (data || []).map((row: any) => {
            let totalDisplay = '00:00';
            if (row.total_hours !== undefined && row.total_hours !== null) {
                const hours = Math.floor(row.total_hours);
                const minutes = Math.round((row.total_hours - hours) * 60);
                totalDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
            return {
                id: row.id,
                date: row.date,
                entry1: row.entry_time ? row.entry_time.slice(0, 5) : '',
                exit1: row.break_start ? row.break_start.slice(0, 5) : '',
                entry2: row.break_end ? row.break_end.slice(0, 5) : '',
                exit2: row.exit_time ? row.exit_time.slice(0, 5) : '',
                totalHours: totalDisplay,
                status: row.status === 'APPROVED' ? 'REGULAR' : (row.status || 'REGULAR') as any,
                originalStatus: row.status
            };
        });
    },

    updateHRTimeRecord: async (updatedRecord: TimeRecord & { id?: string }) => {
        if (updatedRecord.id) {
            const calc = dashboardService._calculateHours(
                updatedRecord.entry1,
                updatedRecord.exit1,
                updatedRecord.entry2,
                updatedRecord.exit2
            );
            const { error } = await supabase
                .from('time_entries')
                .update({
                    entry_time: updatedRecord.entry1 || null,
                    break_start: updatedRecord.exit1 || null,
                    break_end: updatedRecord.entry2 || null,
                    exit_time: updatedRecord.exit2 || null,
                    total_hours: calc.decimal,
                    status: 'MANUAL_EDIT'
                })
                .eq('id', updatedRecord.id);
            if (error) console.error('[api] updateHRTimeRecord:', error.message);
            return { ...updatedRecord, totalHours: calc.formatted };
        }
        return updatedRecord;
    },

    getHRPayroll: async (): Promise<PayrollEntry[]> => {
        const { data, error } = await supabase
            .from('employees')
            .select('id, name, role, salary, advances')
            .eq('active', true)
            .order('name');
        if (error) { console.error('[api] getHRPayroll:', error.message); return []; }
        return (data || []).map((emp: any) => ({
            id: emp.id,
            employeeName: emp.name,
            role: emp.role || 'Funcionário',
            baseSalary: Number(emp.salary) || 0,
            advances: Number(emp.advances) || 0,
            overtimeValue: 0,
            discounts: 0,
        }));
    },

    // ─── MAPA DE OPERAÇÕES ───────────────────────────────────

    getOperationsMapData: async (): Promise<EquipmentTimeline[]> => {
        const { operationsService } = await import('./operationsService');
        const today = new Date();
        return operationsService.getOperationsMapData(today.getMonth() + 1, today.getFullYear());
    },

    updateOperationsMapData: async (updatedTimeline: EquipmentTimeline) => {
        return updatedTimeline;
    },

    // ─── DOCUMENTOS ──────────────────────────────────────────

    getDocuments: async (): Promise<ERPDocument[]> => {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('ativo', true)
            .order('uploaded_at', { ascending: false });
        if (error) { console.error('[api] getDocuments:', error.message); return []; }
        return (data || []).map((d: any) => ({
            id: d.id,
            title: d.name || d.title || '—',
            filename: d.filename || d.name || '—',
            category: (d.category || 'GERAL') as any,
            fileSize: d.size || '—',
            fileType: (d.file_type || 'PDF') as 'PDF' | 'DOCX' | 'IMAGE' | 'XLSX',
            uploadDate: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('pt-BR') : '—',
            relatedTo: d.related_to,
        }));
    },

    addDocument: async (doc: Partial<ERPDocument>): Promise<ERPDocument | null> => {
        const { data, error } = await supabase
            .from('documents')
            .insert({
                name: doc.title || doc.filename,
                filename: doc.filename,
                category: doc.category,
                size: doc.fileSize,
                ativo: true,
            })
            .select()
            .single();
        if (error) { console.error('[api] addDocument:', error.message); return null; }
        return data;
    },

    deleteDocument: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from('documents')
            .update({ ativo: false })
            .eq('id', id);
        if (error) { console.error('[api] deleteDocument:', error.message); return false; }
        return true;
    },

    // ─── AUDITORIA ───────────────────────────────────────────

    getAuditLogs: async (): Promise<AuditLogEntry[]> => {
        const { data, error } = await supabase
            .from('financial_audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) { console.error('[api] getAuditLogs:', error.message); return []; }
        return (data || []).map((row: any) => ({
            id: row.id,
            timestamp: new Date(row.created_at).toLocaleString('pt-BR'),
            userId: row.usuario_id || '',
            userName: row.usuario_id || 'Sistema',
            action: (row.operacao || 'UPDATE').toUpperCase() as any,
            resource: row.tabela || 'financeiro',
            details: row.dados_depois
                ? JSON.stringify(row.dados_depois).slice(0, 120)
                : 'Alteração registrada',
            ipAddress: '—',
            severity: row.operacao === 'DELETE' ? 'HIGH' : 'LOW' as any,
            screenshotUrl: undefined,
        }));
    },

    getActiveSessions: async (): Promise<NetworkSession[]> => {
        return [];
    },

    // ─── ESTATÍSTICAS DO DASHBOARD ───────────────────────────

    getStats: async () => {
        try {
            const [assetsRes, maintenanceRes, movimentosRes] = await Promise.all([
                supabase
                    .from('assets')
                    .select('id', { count: 'exact', head: true })
                    .eq('ativa', true),
                supabase
                    .from('maintenance_os')
                    .select('id', { count: 'exact', head: true })
                    .in('status', ['PENDING', 'URGENT', 'WAITING_PARTS']),
                supabase
                    .from('movimentos_bancarios')
                    .select('valor, tipo_movimento'),
            ]);

            const totalAtivos = assetsRes.count || 0;
            const totalAlertas = maintenanceRes.count || 0;

            let saldo = 0;
            (movimentosRes.data || []).forEach((m: any) => {
                if (m.tipo_movimento === 'CREDITO') saldo += Number(m.valor);
                else saldo -= Number(m.valor);
            });

            const formatSaldo = (v: number) => {
                if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2)}M`;
                if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(1)}K`;
                return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            };

            return [
                { title: 'Saldo Financeiro', value: formatSaldo(saldo), trend: saldo >= 0 ? 'Positivo' : 'Negativo', trendUp: saldo >= 0, type: 'activity', iconBg: 'bg-blue-600', route: '/financial' },
                { title: 'Ativos Monitorados', value: `${totalAtivos} ativos`, trend: '100% Online', trendUp: true, type: 'map', iconBg: 'bg-emerald-600', route: '/fleet' },
                { title: 'Alertas Manutenção', value: totalAlertas > 0 ? `${totalAlertas} Pendentes` : 'Em dia', trend: totalAlertas > 0 ? 'Ação necessária' : 'Sem pendências', trendUp: totalAlertas === 0, type: 'alert', iconBg: totalAlertas > 0 ? 'bg-rose-600' : 'bg-emerald-600', route: '/maintenance' },
                { title: 'Automação WhatsApp', value: 'Ativo', trend: 'Ouvindo...', trendUp: true, type: 'activity', iconBg: 'bg-purple-600', route: '/whatsapp' },
            ];
        } catch (err) {
            console.error('[api] getStats:', err);
            return [];
        }
    },

    // ─── FEED DE ATIVIDADES ──────────────────────────────────

    getActivities: async () => {
        const { data, error } = await supabase
            .from('financial_audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error || !data || data.length === 0) return [];
        return data.map((row: any) => {
            const op = (row.operacao || 'update').toLowerCase();
            const tabela = (row.tabela || 'registro').replace(/_/g, ' ');
            const hora = new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dataBr = new Date(row.created_at).toLocaleDateString('pt-BR');
            return {
                time: `${dataBr} ${hora}`,
                user: row.usuario_id || 'Sistema',
                action: `${op.charAt(0).toUpperCase() + op.slice(1)} em ${tabela}`,
                project: row.registro_id ? `ID: ${String(row.registro_id).slice(0, 8)}` : 'Financeiro',
            };
        });
    },
};
