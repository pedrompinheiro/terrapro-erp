import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface UserPermission {
    module_slug: string;
    module_name: string;
    category: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
}

export function usePermission() {
    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['user_permissions'],
        queryFn: async () => {
            // Verifica se há sessão ativa primeiro
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return [];

            const { data, error } = await supabase
                .from('view_user_permissions')
                .select('*');

            if (error) {
                console.error('Erro ao carregar permissões:', error);
                return [];
            }

            return data as UserPermission[];
        },
        staleTime: 1000 * 60 * 5, // Cache por 5 minutos
        retry: 1
    });

    const hasPermission = (moduleSlug: string, action: 'read' | 'create' | 'update' | 'delete' = 'read') => {
        // Se estiver carregando, nega por padrão (fail-safe) ou retorna false
        if (isLoading) return false;

        // Se for undefined/null slug, permite (ex: dashboard publico)
        if (!moduleSlug) return true;

        // Admin Master Override (Opcional, manter comentado para produção)
        // const isMaster = true; 
        // if (isMaster) return true;

        const permission = permissions.find(p => p.module_slug === moduleSlug);
        if (!permission) return false;

        switch (action) {
            case 'create': return permission.can_create;
            case 'read': return permission.can_read;
            case 'update': return permission.can_update;
            case 'delete': return permission.can_delete;
            default: return false;
        }
    };

    return { permissions, loading: isLoading, hasPermission };
}
