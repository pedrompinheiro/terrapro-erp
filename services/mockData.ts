
import { AssetStatus, OSStatus, Asset, MaintenanceOS, StockItem, Transaction, PaymentStatus, ERPDocument } from '../types';

export const MOCK_ASSETS: Asset[] = [
    {
        id: 'EXC-042',
        name: 'Escavadeira CAT 320',
        model: 'CAT 320',
        status: AssetStatus.OPERATING,
        horometer: 12450,
        nextRevision: '12500h',
        efficiency: 92,
        coordinates: { lat: -22.2558, lng: -54.8322 },
        telemetry: {
            lastUpdate: '2024-02-01 10:42:15',
            speed: 0,
            ignition: true,
            voltage: 26.4,
            batteryLevel: 98,
            satelliteCount: 12,
            address: 'Rodovia BR-163, Km 256, Dourados - MS',
            deviceModel: 'Suntech ST8310'
        }
    },
    {
        id: 'TRT-015',
        name: 'Trator JD 7200',
        model: 'JD 7200',
        status: AssetStatus.OPERATING,
        horometer: 8540,
        nextRevision: '8600h',
        efficiency: 88,
        coordinates: { lat: -22.2580, lng: -54.8300 },
        telemetry: {
            lastUpdate: '2024-02-01 10:41:50',
            speed: 12,
            ignition: true,
            voltage: 13.8,
            batteryLevel: 100,
            satelliteCount: 14,
            address: 'Fazenda Sta. Rita - Talhão 04',
            deviceModel: 'Teltonika FMB920'
        }
    },
    {
        id: 'EXC-045',
        name: 'Escavadeira Volvo',
        model: 'EC200',
        status: AssetStatus.MAINTENANCE,
        horometer: 13200,
        nextRevision: '13000h',
        efficiency: 0,
        coordinates: { lat: -22.2600, lng: -54.8250 },
        telemetry: {
            lastUpdate: '2024-02-01 08:30:00',
            speed: 0,
            ignition: false,
            voltage: 24.1,
            batteryLevel: 85,
            satelliteCount: 0,
            address: 'Oficina Central TerraPro',
            deviceModel: 'Suntech ST310U'
        },
        manuals: [
            {
                id: 'MAN-001',
                title: 'Manual de Serviço Volvo EC200',
                filename: 'VOLVO_EC200_SERVICE.pdf',
                category: 'OUTROS',
                uploadDate: '2023-01-15',
                fileSize: '15.4 MB',
                fileType: 'PDF',
                relatedTo: 'EXC-045'
            }
        ]
    },
];

export const MOCK_ACTIVITIES = [
    { time: '08:42', user: 'Ricardo Silva', action: 'Iniciou turno no ativo EXC-042', project: 'Rodovia BR-101' },
    { time: '08:15', user: 'Sistema GPS', action: 'Alerta: Baixo nível de diesel detectado', project: 'TRT-015' },
    { time: '07:30', user: 'André Santos', action: 'Finalizou controle diário ontem', project: 'Jardim Europa' },
    { time: '07:15', user: 'Marcos Oliveira', action: 'Check-list pré-operacional OK', project: 'Rodovia BR-101' },
];

export const MOCK_STATS = [
    { title: "Máquinas em Operação", value: "38 / 52", trend: "+2 hoje", trendUp: true, iconType: "activity", iconBg: "bg-[#007a33]" },
    { title: "Controles Diários", value: "12 Pendentes", trend: "Urgente", trendUp: false, iconType: "clock", iconBg: "bg-orange-600" },
    { title: "Alertas de Manutenção", value: "04 Ativos", trend: "Crítico", trendUp: false, iconType: "alert", iconBg: "bg-rose-600" },
    { title: "Equipes em Campo", value: "08 Frentes", trend: "Normal", trendUp: true, iconType: "map", iconBg: "bg-slate-700" },
];

export const MOCK_STOCK: StockItem[] = [
    { sku: 'FIL-001', description: 'Filtro de Ar Primário', category: 'Filtros', currentQty: 12, minQty: 15, location: 'A-01', status: 'WARNING' },
    { sku: 'OLE-15W', description: 'Óleo Motor 15W40', category: 'Lubrificantes', currentQty: 200, minQty: 100, location: 'T-01', status: 'NORMAL' },
    { sku: 'PNE-295', description: 'Pneu 295/80 R22.5', category: 'Pneus', currentQty: 2, minQty: 4, location: 'B-02', status: 'CRITICAL' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'FAT-001', client: 'Construtora Norte', project: 'Rodovia BR-101', dueDate: '2024-02-15', amount: 45000.00, status: PaymentStatus.PENDING },
    { id: 'FAT-002', client: 'Agropecuária Sul', project: 'Fazenda Sta. Rita', dueDate: '2024-02-10', amount: 12500.00, status: PaymentStatus.PAID },
    { id: 'FAT-003', client: 'Prefeitura Dourados', project: 'Tapa Buracos', dueDate: '2024-01-30', amount: 8200.00, status: PaymentStatus.OVERDUE },
];

export const MOCK_MAINTENANCE_OS: MaintenanceOS[] = [
    { id: 'OS-8820', assetId: 'EXC-042', assetName: 'Escavadeira CAT 320', priority: 'HIGH', status: OSStatus.IN_PROGRESS, mechanic: 'João Mecânico', description: 'Vazamento no cilindro hidráulico principal', progress: 60, partsNeeded: ['Kit Vedação 120mm', 'Óleo Hidráulico 68'] },
    { id: 'OS-8821', asset_id: 'TRT-015', assetName: 'Trator JD 7200', priority: 'URGENT', status: OSStatus.WAITING_PARTS, mechanic: 'Carlos Lima', description: 'Superaquecimento do motor - Troca de radiador', progress: 30, partsNeeded: ['Radiador JD-7200', 'Aditivo Arrefecimento'] },
    { id: 'OS-8822', asset_id: 'CMH-002', assetName: 'Caminhão G420', priority: 'LOW', status: OSStatus.PENDING, description: 'Revisão preventiva 5.000km', progress: 0 },
    { id: 'OS-8823', asset_id: 'EXC-045', assetName: 'Escavadeira Volvo', priority: 'MEDIUM', status: OSStatus.COMPLETED, mechanic: 'João Mecânico', description: 'Troca de dentes da caçamba', progress: 100 },
];

export interface TimeRecord {
    id?: string;
    date: string;
    entry1: string;
    exit1: string;
    entry2: string;
    exit2: string;
    totalHours: string;
    status: 'REGULAR' | 'ABSENT' | 'MANUAL_EDIT' | 'OVERTIME' | 'MISSING';
}

export interface PayrollEntry {
    id: number;
    employeeName: string;
    role: string;
    baseSalary: number;
    advances: number;
    overtimeValue: number;
    discounts: number;
}

export const MOCK_TIME_RECORDS: TimeRecord[] = [
    { date: '2024-01-28', entry1: '08:00', exit1: '12:00', entry2: '13:00', exit2: '17:00', totalHours: '08:00', status: 'REGULAR' },
    { date: '2024-01-29', entry1: '08:05', exit1: '12:00', entry2: '13:00', exit2: '17:15', totalHours: '08:10', status: 'REGULAR' },
    { date: '2024-01-30', entry1: '08:00', exit1: '', entry2: '', exit2: '', totalHours: '04:00', status: 'ABSENT' },
    { date: '2024-01-31', entry1: '08:00', exit1: '12:00', entry2: '13:00', exit2: '19:00', totalHours: '10:00', status: 'OVERTIME' },
];

export const MOCK_PAYROLL_DATA: PayrollEntry[] = [
    { id: 1, employeeName: 'João da Silva', role: 'Mecânico Chefe', baseSalary: 4500.00, advances: 500.00, overtimeValue: 350.00, discounts: 280.00 },
    { id: 2, employeeName: 'Maria Oliveira', role: 'Gerente ADM', baseSalary: 6200.00, advances: 0.00, overtimeValue: 0.00, discounts: 650.00 },
    { id: 3, employeeName: 'Carlos Santos', role: 'Operador', baseSalary: 3200.00, advances: 1200.00, overtimeValue: 150.00, discounts: 180.00 },
];

export interface TimelineCell {
    day: number;
    status: 'WORKED' | 'STANDBY' | 'MAINTENANCE' | 'RAIN' | 'EMPTY';
    location?: string;
    hours?: number;
    startTime?: string;
    endTime?: string;
    hasLunchBreak?: boolean;
    lunchStartTime?: string;
    lunchEndTime?: string;
}

export interface EquipmentTimeline {
    id: string;
    name: string;
    model: string;
    timeline: TimelineCell[];
}

const DAYS_IN_MONTH = 31;
const generateMockTimeline = (): TimelineCell[] => {
    return Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
        const day = i + 1;
        const rand = Math.random();
        let status: TimelineCell['status'] = 'WORKED';
        let location = 'PEDREIRA';
        let hours = 8.5;
        let startTime = '07:30';
        let endTime = '17:00';
        let hasLunchBreak = true;
        let lunchStartTime = '12:00';
        let lunchEndTime = '13:00';

        if (rand > 0.8) {
            status = 'STANDBY';
            location = 'OFICINA';
            hours = 0;
            startTime = '';
            endTime = '';
            hasLunchBreak = false;
        }
        else if (rand > 0.9) {
            status = 'MAINTENANCE';
            location = 'OFICINA';
            hours = 0;
            startTime = '';
            endTime = '';
            hasLunchBreak = false;
        }
        else if (day === 25 || day === 31) {
            status = 'EMPTY';
            location = '';
            hours = 0;
            startTime = '';
            endTime = '';
            hasLunchBreak = false;
        }

        return {
            day,
            status,
            location,
            hours,
            startTime: status === 'WORKED' ? startTime : undefined,
            endTime: status === 'WORKED' ? endTime : undefined,
            hasLunchBreak: status === 'WORKED' ? hasLunchBreak : false,
            lunchStartTime: status === 'WORKED' ? lunchStartTime : undefined,
            lunchEndTime: status === 'WORKED' ? lunchEndTime : undefined
        };
    });
};

export const MOCK_OPERATIONS_MAP_DATA: EquipmentTimeline[] = [
    { id: 'EC-SDLG-03', name: 'Escavadeira SDLG', model: 'SDLG 920', timeline: generateMockTimeline() },
    { id: 'ESC-CAT-01', name: 'Escavadeira CAT', model: '320D', timeline: generateMockTimeline() },
    { id: 'PTR-05', name: 'Patrol 140K', model: '140K', timeline: generateMockTimeline() },
    { id: 'TRT-D6', name: 'Trator D6', model: 'D6N', timeline: generateMockTimeline() },
    { id: 'CAM-01', name: 'Caminhão Basc.', model: 'VW 31.330', timeline: generateMockTimeline() },
];

export const MOCK_DOCUMENTS: ERPDocument[] = [
    { id: 'DOC-001', title: 'Nota Fiscal - Aquisição Peças', filename: 'NF_29384_PECAS.pdf', category: 'FISCAL', uploadDate: '2024-02-01', fileSize: '1.2 MB', fileType: 'PDF' },
    { id: 'DOC-002', title: 'Contrato Social Consolidado', filename: 'CONTRATO_SOCIAL_2024.pdf', category: 'LEGAL', uploadDate: '2024-01-15', fileSize: '2.5 MB', fileType: 'PDF' },
    { id: 'DOC-003', title: 'CRLV 2024 - Caminhão G420', filename: 'CRLV_CAM01.pdf', category: 'VEICULOS', uploadDate: '2024-01-10', expiryDate: '2024-12-31', fileSize: '850 KB', fileType: 'PDF', relatedTo: 'Caminhão G420' },
    { id: 'DOC-004', title: 'Holerite Jan/24 - João Silva', filename: 'HOLERITE_JOAO_JAN24.pdf', category: 'RH', uploadDate: '2024-01-30', fileSize: '450 KB', fileType: 'PDF', relatedTo: 'João da Silva' },
    { id: 'DOC-005', title: 'Licença Ambiental Operação (LAO)', filename: 'LAO_PEDREIRA_01.pdf', category: 'LICENCAS', uploadDate: '2023-06-01', expiryDate: '2025-06-01', fileSize: '4.8 MB', fileType: 'PDF' },
    { id: 'DOC-006', title: 'Foto Avaria - Escavadeira 042', filename: 'AVARIA_EXC042.jpg', category: 'VEICULOS', uploadDate: '2024-02-01', fileSize: '3.2 MB', fileType: 'IMAGE', relatedTo: 'Escavadeira CAT 320' },
    { id: 'DOC-007', title: 'Manual Técnico - Trator D6', filename: 'MANUAL_D6N.pdf', category: 'VEICULOS', uploadDate: '2023-01-01', fileSize: '12 MB', fileType: 'PDF', relatedTo: 'Trator D6' },
    { id: 'DOC-008', title: 'Contrato Prestação Serviços - Obra Estrada', filename: 'CONTRATO_OBRA_ESTRADA.docx', category: 'LEGAL', uploadDate: '2024-01-05', fileSize: '540 KB', fileType: 'DOCX' },
];

import { AuditLogEntry, NetworkSession } from '../types';

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    {
        id: 'LOG-001',
        timestamp: '2024-02-02 16:30:45',
        userId: 'admin',
        userName: 'Admin User',
        action: 'DELETE',
        resource: 'Ativo',
        details: 'Excluiu o ativo [EXC-999] - Escavadeira Antiga',
        ipAddress: '192.168.100.15',
        severity: 'HIGH',
        screenshotUrl: 'https://via.placeholder.com/800x600?text=Evidence+Screenshot+Delete'
    },
    {
        id: 'LOG-002',
        timestamp: '2024-02-02 15:15:22',
        userId: 'usr_jrocha',
        userName: 'João Rocha',
        action: 'UPDATE',
        resource: 'Financeiro',
        details: 'Alterou vencimento da NF-29384 para 20/02/2024',
        ipAddress: '192.168.100.22',
        severity: 'MEDIUM'
    },
    {
        id: 'LOG-003',
        timestamp: '2024-02-02 14:00:10',
        userId: 'admin',
        userName: 'Admin User',
        action: 'LOGIN',
        resource: 'Sistema',
        details: 'Login realizado com sucesso',
        ipAddress: '192.168.100.15',
        severity: 'LOW'
    },
    {
        id: 'LOG-004',
        timestamp: '2024-02-02 10:45:00',
        userId: 'usr_asilva',
        userName: 'Ana Silva',
        action: 'CREATE',
        resource: 'Documentos',
        details: 'Upload de contrato C-9922.pdf',
        ipAddress: '192.168.100.33',
        severity: 'LOW',
        screenshotUrl: 'https://via.placeholder.com/800x600?text=Evidence+Screenshot+Upload'
    },
    {
        id: 'LOG-005',
        timestamp: '2024-02-01 18:30:00',
        userId: 'usr_jrocha',
        userName: 'João Rocha',
        action: 'EXPORT',
        resource: 'Relatórios',
        details: 'Exportou relatório completo de frota',
        ipAddress: '192.168.100.22',
        severity: 'MEDIUM'
    }
];

export const MOCK_SESSIONS: NetworkSession[] = [
    {
        id: 'SES-001',
        userId: 'admin',
        userName: 'Admin User',
        device: 'MacBook Pro 16"',
        ipAddress: '192.168.100.15',
        lastActive: 'Agora',
        currentScreen: 'Auditoria e Segurança',
        status: 'ACTIVE',
        thumbnailUrl: 'https://via.placeholder.com/300x200/1e293b/ffffff?text=Admin+View'
    },
    {
        id: 'SES-002',
        userId: 'usr_jrocha',
        userName: 'João Rocha',
        device: 'Dell Latitude 5420',
        ipAddress: '192.168.100.22',
        lastActive: '2 min atrás',
        currentScreen: 'Financeiro > Lançamentos',
        status: 'ACTIVE',
        thumbnailUrl: 'https://via.placeholder.com/300x200/0f172a/ffffff?text=Financeiro'
    },
    {
        id: 'SES-003',
        userId: 'usr_asilva',
        userName: 'Ana Silva',
        device: 'iPad Pro',
        ipAddress: '192.168.100.33',
        lastActive: '15 min atrás',
        currentScreen: 'Gestão de Documentos',
        status: 'IDLE',
        thumbnailUrl: 'https://via.placeholder.com/300x200/334155/ffffff?text=iPad+Idle'
    }
];
