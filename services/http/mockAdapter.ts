
import { dashboardService } from '../api';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function handleMockRequest(url: string, method: string, data?: any) {
    console.log(`[MockAdapter] ${method} ${url}`, data);

    // Simulate network delay logic is already in dashboardService, but we can add more if needed.
    // However, dashboardService returns Promises with delay.

    switch (true) {
        // Assets / Fleet
        case url === '/fleet/assets' && method === 'GET':
            return dashboardService.getAssets();

        case url === '/fleet/assets' && method === 'POST':
            return dashboardService.addAsset(data);

        case url.startsWith('/fleet/assets/') && method === 'PUT':
            // Extract ID? dashboardService.updateAsset expects an Asset object with ID
            return dashboardService.updateAsset(data);

        case url.startsWith('/fleet/assets/') && method === 'DELETE':
            const id = url.split('/').pop();
            if (id) return dashboardService.deleteAsset(id);
            break;

        // Security
        case url === '/security/audit-logs' && method === 'GET':
            return dashboardService.getAuditLogs();

        case url === '/security/sessions' && method === 'GET':
            return dashboardService.getActiveSessions();

        default:
            console.warn(`[MockAdapter] No handler for ${method} ${url}`);
            throw new Error(`Mock endpoint not implemented: ${url}`);
    }
}
