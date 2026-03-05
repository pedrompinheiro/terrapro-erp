/**
 * Servico de Seguranca Administrativa
 * Valida senha mestra via Edge Function (nunca expoe senha no client)
 */

import { supabase } from '../lib/supabase';

class AdminSecurityService {
    /**
     * Verificar senha do administrador via Edge Function
     */
    async verify(password: string): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sessao expirada');

        const { data, error } = await supabase.functions.invoke('verify-admin-password', {
            body: { action: 'verify', password }
        });

        if (error) throw new Error(error.message || 'Erro ao verificar senha');
        return data?.valid === true;
    }

    /**
     * Alterar senha do administrador via Edge Function
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sessao expirada');

        const { data, error } = await supabase.functions.invoke('verify-admin-password', {
            body: { action: 'change', password: currentPassword, newPassword }
        });

        if (error) {
            if (error.message?.includes('403')) throw new Error('Senha atual incorreta');
            throw new Error(error.message || 'Erro ao alterar senha');
        }

        if (data?.error) throw new Error(data.error);
        return data?.success === true;
    }
}

export const adminSecurityService = new AdminSecurityService();
export default adminSecurityService;
