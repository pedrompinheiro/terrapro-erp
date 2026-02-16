import toast from 'react-hot-toast';

/**
 * Utilitários para notificações toast consistentes em todo o sistema
 */

export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            duration: 3000,
        });
    },

    error: (message: string) => {
        toast.error(message, {
            duration: 4000,
        });
    },

    loading: (message: string) => {
        return toast.loading(message);
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, messages);
    },

    dismiss: (toastId: string) => {
        toast.dismiss(toastId);
    },

    // Atalhos específicos do sistema
    saved: () => toast.success('✅ Salvo com sucesso!'),
    deleted: () => toast.success('🗑️ Deletado com sucesso!'),
    updated: () => toast.success('✏️ Atualizado com sucesso!'),
    copied: () => toast.success('📋 Copiado!'),

    errorGeneric: () => toast.error('❌ Erro ao processar. Tente novamente.'),
    errorNetwork: () => toast.error('🌐 Erro de conexão. Verifique sua internet.'),
    errorPermission: () => toast.error('🔒 Você não tem permissão para esta ação.'),
};

export default showToast;
