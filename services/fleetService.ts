
import { supabase } from '../lib/supabase';
import { Asset, AssetStatus } from '../types';
import { fetchFleetPositions, getVehicleStatus } from './selsyn';

export const fleetManagementService = {
    getAssets: async () => {
        // 1. Fetch Assets from DB
        const { data: assetsData, error } = await supabase
            .from('assets')
            .select('*')
            .order('name');

        if (error) throw error;

        let assets = assetsData as Asset[];

        try {
            // 2. Fetch Real-time GPS Data (Operator Level)
            const positions = await fetchFleetPositions();
            // console.log(`[FleetService] Selsyn returned ${positions.length} positions.`);

            // 3. Merge Data
            let matchCount = 0;
            assets = assets.map(asset => {
                const normalize = (s: string) => s ? s.replace(/[\s-]/g, '').toUpperCase() : '';
                const assetName = normalize(asset.name);
                const assetCode = normalize(asset.code);

                // Match with identifier (PLACA) or Friendly Name
                const pos = positions.find(p => {
                    const plate = normalize(p.identificador);
                    const trackerName = normalize(p.rastreavel); // Fallback match

                    // Debug Log for first item only to avoid spam
                    // if (asset.code === 'AAA-0001') console.log('Checking match:', { plate, trackerName, assetName, assetCode });

                    return plate === assetName || plate === assetCode ||
                        (trackerName && (trackerName === assetName || trackerName === assetCode));
                });

                if (pos) {
                    matchCount++;
                    const statusSelsyn = getVehicleStatus(pos);
                    let mappedStatus = AssetStatus.AVAILABLE;

                    if (statusSelsyn === 'moving') mappedStatus = AssetStatus.OPERATING;
                    else if (statusSelsyn === 'idle') mappedStatus = AssetStatus.IDLE;
                    else if (statusSelsyn === 'offline') mappedStatus = AssetStatus.MAINTENANCE;
                    else mappedStatus = AssetStatus.AVAILABLE;

                    // Handle date format from Operator API
                    const lastUpdate = pos.dataHora ? new Date(pos.dataHora).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

                    return {
                        ...asset,
                        status: mappedStatus,
                        coordinates: { lat: pos.latitude, lng: pos.longitude },
                        telemetry: {
                            ...asset.telemetry,
                            speed: pos.velocidade,
                            ignition: pos.ignicao,
                            lastUpdate: lastUpdate,
                            address: pos.endereco || 'Localização GPS',
                            voltage: pos.fonteEnergia || 0,
                            batteryLevel: 100, // Mock
                            satelliteCount: 8, // Mock
                            deviceModel: pos.tipo || 'Rastreador'
                        }
                    };
                }
                return asset;
            });

            console.log(`[FleetService] Merge Result: ${matchCount} matches out of ${assets.length} assets.`);

        } catch (err) {
            console.error('Failed to merge GPS data:', err);
        }

        return assets;
    },

    createAsset: async (asset: Partial<Asset>) => {
        // We get the current user to find their company_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        // Fetch user profile to get company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!profile) throw new Error("User profile not found");

        const { data, error } = await supabase
            .from('assets')
            .insert({
                ...asset,
                company_id: profile.company_id
            })
            .select()
            .single();

        if (error) throw error;
        return data as Asset;
    },

    updateAsset: async (asset: Asset) => {
        const { data, error } = await supabase
            .from('assets')
            .update(asset)
            .eq('id', asset.id)
            .select()
            .single();

        if (error) throw error;
        return data as Asset;
    },

    deleteAsset: async (id: string) => {
        const { error } = await supabase
            .from('assets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Novo método para buscar funcionários da mesma empresa do usuário logado
    getEmployees: async () => {
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Buscar perfil para saber a company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.company_id) {
            console.warn("Usuário sem empresa vinculada, retornando lista vazia.");
            return [];
        }

        // Buscar funcionários apenas dessa empresa
        const { data, error } = await supabase
            .from('employees')
            .select('id, full_name')
            .eq('company_id', profile.company_id)
            .order('full_name');

        if (error) {
            console.error("Erro ao buscar funcionários:", error);
            throw error;
        }

        return data || [];
    }
};
