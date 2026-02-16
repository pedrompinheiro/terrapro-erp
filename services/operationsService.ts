
import { supabase } from '../lib/supabase';
import { EquipmentTimeline, TimelineCell } from './mockData';

export const operationsService = {
    // Busca dados para o mapa de operações
    getOperationsMapData: async (month: number, year: number): Promise<EquipmentTimeline[]> => {
        // 1. Buscar todos os ativos ativos
        const { data: assets, error: errAssets } = await supabase
            .from('assets')
            .select('id, name, model, code, status')
            // .eq('status', 'OPERATING') // Removido para mostrar TODOS os ativos
            .order('name');

        if (errAssets) {
            console.error('Error fetching assets:', errAssets);
            return [];
        }

        // 2. Buscar apontamentos do mês
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Último dia do mês

        const { data: operations, error: errOps } = await supabase
            .from('asset_daily_operations')
            .select('*')
            .gte('operation_date', startDate)
            .lte('operation_date', endDate);

        if (errOps) {
            console.error('Error fetching operations:', errOps);
            return [];
        }

        // 3. Montar Timeline
        const daysInMonth = new Date(year, month, 0).getDate();

        const timelineData: EquipmentTimeline[] = assets.map(asset => {
            const assetOps = operations?.filter(op => op.asset_id === asset.id) || [];

            const timeline: TimelineCell[] = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const op = assetOps.find(o => o.operation_date === dateStr);

                if (op) {
                    return {
                        id: op.id,
                        day,
                        status: op.status as any,
                        location: op.work_site || '',
                        hours: op.total_hours || 0,
                        startTime: op.start_time?.slice(0, 5),
                        endTime: op.end_time?.slice(0, 5),
                        hasLunchBreak: !!op.break_start,
                        lunchStartTime: op.break_start?.slice(0, 5),
                        lunchEndTime: op.break_end?.slice(0, 5)
                    };
                }

                return {
                    day,
                    status: 'EMPTY' as any
                };
            });

            return {
                id: asset.id,
                name: asset.name,
                model: asset.model,
                timeline
            };
        });

        return timelineData;
    },

    // Salvar/Atualizar Apontamento
    saveOperation: async (assetId: string, date: string, data: any) => {
        // Verifica se já existe
        const { data: existing } = await supabase
            .from('asset_daily_operations')
            .select('id')
            .eq('asset_id', assetId)
            .eq('operation_date', date)
            .single();

        const payload = {
            asset_id: assetId,
            operation_date: date,
            status: data.status,
            work_site: data.location,
            start_time: data.startTime,
            end_time: data.endTime,
            break_start: data.hasLunchBreak ? data.lunchStartTime : null,
            break_end: data.hasLunchBreak ? data.lunchEndTime : null,
            total_hours: data.hours
        };

        if (existing) {
            return await supabase
                .from('asset_daily_operations')
                .update(payload)
                .eq('id', existing.id);
        } else {
            return await supabase
                .from('asset_daily_operations')
                .insert(payload);
        }
    }
};
