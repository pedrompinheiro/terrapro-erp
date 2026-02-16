import { Asset, MaintenanceOS, StockItem, Transaction, AssetStatus, OSStatus, PaymentStatus, ERPDocument, AuditLogEntry, NetworkSession } from '../types';
import { MOCK_ACTIVITIES, MOCK_ASSETS, MOCK_STATS, MOCK_STOCK, MOCK_TRANSACTIONS, MOCK_MAINTENANCE_OS, MOCK_PAYROLL_DATA, MOCK_OPERATIONS_MAP_DATA, MOCK_DOCUMENTS, MOCK_AUDIT_LOGS, MOCK_SESSIONS, TimeRecord, PayrollEntry, EquipmentTimeline } from './mockData';
import { supabase } from '../lib/supabase';

const DELAY = 400; // Faster for better UX

// In-Memory Database
let _assets = [...MOCK_ASSETS];
let _maintenanceOS = [...MOCK_MAINTENANCE_OS];
let _stock = [...MOCK_STOCK];
let _transactions = [...MOCK_TRANSACTIONS];
// let _timeRecords = [...MOCK_TIME_RECORDS]; // Removido, usando Supabase agora
let _payrollData = [...MOCK_PAYROLL_DATA];
let _operationsMap = [...MOCK_OPERATIONS_MAP_DATA];
let _documents = [...MOCK_DOCUMENTS];
let _auditLogs = [...MOCK_AUDIT_LOGS];
let _activeSessions = [...MOCK_SESSIONS];

export const dashboardService = {
    // Assets
    getAssets: async (): Promise<Asset[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._assets]), DELAY));
    },
    addAsset: async (asset: Asset) => {
        _assets.push(asset);
        return new Promise(resolve => setTimeout(() => resolve(asset), DELAY));
    },
    updateAsset: async (updatedAsset: Asset) => {
        _assets = _assets.map(a => a.id === updatedAsset.id ? updatedAsset : a);
        return new Promise(resolve => setTimeout(() => resolve(updatedAsset), DELAY));
    },
    deleteAsset: async (id: string) => {
        _assets = _assets.filter(a => a.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Maintenance
    getMaintenanceOS: async (): Promise<MaintenanceOS[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._maintenanceOS]), DELAY));
    },
    addMaintenanceOS: async (os: MaintenanceOS) => {
        _maintenanceOS.push(os);
        return new Promise(resolve => setTimeout(() => resolve(os), DELAY));
    },
    updateMaintenanceOS: async (updatedOS: MaintenanceOS) => {
        _maintenanceOS = _maintenanceOS.map(os => os.id === updatedOS.id ? updatedOS : os);
        return new Promise(resolve => setTimeout(() => resolve(updatedOS), DELAY));
    },
    deleteMaintenanceOS: async (id: string) => {
        _maintenanceOS = _maintenanceOS.filter(os => os.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Stock
    getStock: async (): Promise<StockItem[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._stock]), DELAY));
    },
    addStockItem: async (item: StockItem) => {
        _stock.push(item);
        return new Promise(resolve => setTimeout(() => resolve(item), DELAY));
    },
    updateStockItem: async (updatedItem: StockItem) => {
        _stock = _stock.map(s => s.sku === updatedItem.sku ? updatedItem : s);
        return new Promise(resolve => setTimeout(() => resolve(updatedItem), DELAY));
    },
    deleteStockItem: async (sku: string) => {
        _stock = _stock.filter(s => s.sku !== sku);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Financial
    getTransactions: async (): Promise<Transaction[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._transactions]), DELAY));
    },
    addTransaction: async (item: Transaction) => {
        _transactions.push(item);
        return new Promise(resolve => setTimeout(() => resolve(item), DELAY));
    },
    updateTransaction: async (updatedItem: Transaction) => {
        _transactions = _transactions.map(t => t.id === updatedItem.id ? updatedItem : t);
        return new Promise(resolve => setTimeout(() => resolve(updatedItem), DELAY));
    },
    deleteTransaction: async (id: string) => {
        _transactions = _transactions.filter(t => t.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // HR
    getHREmployees: async () => {
        console.log('🔄 [api.ts] Buscando funcionarios...');
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('name');

        if (error) {
            console.error('❌ [api.ts] Erro ao buscar funcionários:', error);
            return [];
        }
        console.log('✅ [api.ts] Sucesso! Registros:', data?.length);
        return data || [];
    },

    // Helper para converter Decimal (8.5) -> Time (08:30)
    _decimalToTime: (decimal: number) => {
        if (!decimal && decimal !== 0) return '00:00';
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },

    // Helper para calcular total de horas baseado nas strings de tempo
    _calculateHours: (e1: string, s1: string, e2: string, s2: string) => {
        const toMinutes = (t: string) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return (h * 60) + m;
        };

        let total = 0;
        if (e1 && s1) total += Math.max(0, toMinutes(s1) - toMinutes(e1));
        if (e2 && s2) total += Math.max(0, toMinutes(s2) - toMinutes(e2)); // Correção: s2 - e2 (Saída2 - Entrada2)

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
            const startDetails = `${month}-01`;
            const endDetails = `${month}-31`;
            query = query.gte('date', startDetails).lte('date', endDetails);
        } else {
            query = query.limit(100);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar pontos:', error);
            return [];
        }

        // Mapear para TimeRecord
        return (data || []).map((row: any) => {
            // Se total_hours vier do banco (numeric), converte. Se não, tenta calcular ou 00:00
            let totalDisplay = '00:00';
            if (row.total_hours !== undefined && row.total_hours !== null) {
                // assume que vem numeric do banco (ex: 8.5)
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
            // Recalcular horas totais antes de salvar
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
                    total_hours: calc.decimal, // Salva como numeric no banco
                    status: 'MANUAL_EDIT'
                })
                .eq('id', updatedRecord.id);

            if (error) console.error('Erro update:', error);

            // Retorna o record atualizado com o total formatado para a UI
            return { ...updatedRecord, totalHours: calc.formatted };
        }
        return updatedRecord;
    },

    getHRPayroll: async (): Promise<PayrollEntry[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._payrollData]), DELAY));
    },

    // Operations Map
    getOperationsMapData: async (): Promise<EquipmentTimeline[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._operationsMap]), DELAY));
    },
    updateOperationsMapData: async (updatedTimeline: EquipmentTimeline) => {
        _operationsMap = _operationsMap.map(t => t.id === updatedTimeline.id ? updatedTimeline : t);
        return new Promise(resolve => setTimeout(() => resolve(updatedTimeline), DELAY));
    },

    // Documents
    getDocuments: async (): Promise<ERPDocument[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._documents]), DELAY));
    },
    addDocument: async (doc: ERPDocument) => {
        _documents.push(doc);
        return new Promise(resolve => setTimeout(() => resolve(doc), DELAY));
    },
    deleteDocument: async (id: string) => {
        _documents = _documents.filter(d => d.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Security & Audit
    getAuditLogs: async (): Promise<AuditLogEntry[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._auditLogs]), DELAY));
    },
    getActiveSessions: async (): Promise<NetworkSession[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._activeSessions]), DELAY));
    },

    // Others
    getStats: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_STATS), DELAY));
    },
    getActivities: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ACTIVITIES), DELAY));
    },
};
