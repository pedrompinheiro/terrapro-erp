import { supabase } from '../lib/supabase';
import { Asset } from '../types';

export const fleetManagementService = {
    getAssets: async () => {
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Asset[];
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
    }
};
