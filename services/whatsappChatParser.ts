/**
 * TERRAPRO ERP - WhatsApp Chat Parser
 * Parseia o backup do chat do grupo "Manutenção/Trocas"
 * para cruzar com planos de manutenção e gerar relatórios
 */

// ============================================================
// NORMALIZAÇÃO DE NOMES (contatos do WhatsApp → nome real)
// ============================================================
const SENDER_NAME_MAP: Record<string, string> = {
  'Fernando Spier Tche Barbaridade': 'Fernando Spier',
};

function normalizeSender(sender: string): string {
  return SENDER_NAME_MAP[sender] || sender;
}

// ============================================================
// TYPES
// ============================================================

export interface WhatsAppMessage {
  date: Date;
  dateStr: string;     // DD/MM/YYYY
  timeStr: string;     // HH:MM:SS
  sender: string;
  text: string;
  photoFile?: string;  // nome do arquivo foto anexada
  videoFile?: string;
  audioFile?: string;
  hasMedia: boolean;
  equipmentMatches: string[];  // fleet_numbers matched
}

export interface WhatsAppEquipmentGroup {
  fleetNumber: string;
  messages: WhatsAppMessage[];
  photoCount: number;
  messageCount: number;
}

// ============================================================
// EQUIPMENT KEYWORDS → FLEET NUMBER MAPPING
// ============================================================

const EQUIPMENT_KEYWORDS: { keywords: string[]; fleetNumber: string }[] = [
  { keywords: ['924k', '924 k', '924K'], fleetNumber: '924K' },
  { keywords: ['l60f', 'L60F', 'l 60f', 'L 60F', 'pá 04', 'pa 04', 'pá 06', 'pa 06', 'pá 08', 'pa 08'], fleetNumber: 'L60F' },
  { keywords: ['pc04', 'PC04', 'pá 04', 'pa 04', 'volvo 04', 'frota 04'], fleetNumber: 'PC04' },
  { keywords: ['pc06', 'PC06', 'pá 06', 'pa 06', 'volvo 06'], fleetNumber: 'PC06' },
  { keywords: ['pc08', 'PC08', 'pá 08', 'pa 08', 'volvo 08'], fleetNumber: 'PC08' },
  { keywords: ['mini 242', 'mini242', 'MINI 242', 'cat 242', 'cat242', 'mini cat'], fleetNumber: 'MINI 242' },
  { keywords: ['ec140', 'EC140', 'ec 140', 'EC 140', 'ec-140'], fleetNumber: 'EC-140' },
  { keywords: ['ec220', 'EC220', 'ec 220', 'EC 220', 'ec03'], fleetNumber: 'EC03' },
  { keywords: ['trator 02', 'TRATOR 02', 'd6k', 'D6K', 'trator de esteira', 'cat esteira'], fleetNumber: 'TRATOR 02' },
  { keywords: ['valtra', 'VALTRA', 'trator 03', 'TRATOR 03', 'bm100', 'BM100', 'trator agrícola', 'trator agricola'], fleetNumber: 'TRATOR VALTRA 03' },
  { keywords: ['cb01', 'CB01', 'basculante 01'], fleetNumber: 'CB01' },
  { keywords: ['cb02', 'CB02', 'basculante 02'], fleetNumber: 'CB02' },
  { keywords: ['cb03', 'CB03', 'basculante 03'], fleetNumber: 'CB03' },
  { keywords: ['cb04', 'CB04', 'basculante 04'], fleetNumber: 'CB04' },
  { keywords: ['cb05', 'CB05', 'basculante 05'], fleetNumber: 'CB05' },
  { keywords: ['cb06', 'CB06', 'basculante 06'], fleetNumber: 'CB06' },
  { keywords: ['cb08', 'CB08', 'basculante 08'], fleetNumber: 'CB08' },
  // Generic matches
  { keywords: ['farelo'], fleetNumber: '924K' },
  { keywords: ['biomassa'], fleetNumber: 'L60F' },
  { keywords: ['soja'], fleetNumber: 'L60F' },
];

// Maintenance-related keywords to filter relevant messages
const MAINTENANCE_KEYWORDS = [
  'troc', 'óleo', 'oleo', 'filtro', 'correia', 'horimetro', 'horímetro',
  'hr.', 'hr ', 'manutenç', 'manutenc', 'diesel', 'racor', 'pneu',
  'freio', 'ar condicionado', 'lubrific', 'motor', 'hidráulic', 'hidraulic',
  'complet', 'abastec', 'arrefec', 'graxa', 'consert', 'repar',
  'solda', 'caçamba', 'cacamba', 'lâmina', 'lamina', 'vidro', 'alternador',
  'partida', 'bateria', 'esteira', 'sapata', 'rolete', 'sirene',
  'bomba', 'cilindro', 'vedaç', 'vedac', 'retent', 'junta', 'gaxeta',
  'revis', 'inspect', 'calibr', 'ajust', 'regula', 'alinham',
  'faca', 'dente', 'concha', 'pino', 'bucha', 'mangueira',
];

// ============================================================
// PARSER
// ============================================================

/**
 * Parse WhatsApp chat export text into structured messages
 */
export function parseWhatsAppChat(chatText: string): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [];

  // WhatsApp format: [DD/MM/YYYY, HH:MM:SS] Sender: Message
  // Also handles: ‎ (zero-width chars before attachments)
  const lineRegex = /^\[?(\d{2}\/\d{2}\/\d{4}),?\s+(\d{2}:\d{2}:\d{2})\]?\s+(.+?):\s+([\s\S]*?)$/;
  const attachRegex = /<anexado:\s*(\S+)>/;

  const lines = chatText.split('\n');
  let currentMsg: WhatsAppMessage | null = null;

  for (const line of lines) {
    const cleanLine = line.replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
    if (!cleanLine) continue;

    const match = cleanLine.match(lineRegex);
    if (match) {
      // Save previous message
      if (currentMsg) {
        processMessage(currentMsg);
        messages.push(currentMsg);
      }

      const [, dateStr, timeStr, sender, text] = match;
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);

      // Check for attachments
      const attachMatch = text.match(attachRegex);
      let photoFile: string | undefined;
      let videoFile: string | undefined;
      let audioFile: string | undefined;

      if (attachMatch) {
        const filename = attachMatch[1];
        const fnUpper = filename.toUpperCase();
        if (fnUpper.includes('PHOTO') || fnUpper.includes('IMG') || /\.(jpg|jpeg|png|webp)$/i.test(filename)) {
          photoFile = filename;
        } else if (fnUpper.includes('VIDEO') || fnUpper.includes('VID') || /\.(mp4|3gp|mov)$/i.test(filename)) {
          videoFile = filename;
        } else if (fnUpper.includes('AUDIO') || fnUpper.includes('PTT') || /\.(opus|ogg|mp3)$/i.test(filename)) {
          audioFile = filename;
        }
      }

      currentMsg = {
        date,
        dateStr,
        timeStr,
        sender: normalizeSender(sender),
        text: text.replace(attachRegex, '').replace(/^[\s‎]+|[\s‎]+$/g, ''),
        photoFile,
        videoFile,
        audioFile,
        hasMedia: !!(photoFile || videoFile || audioFile),
        equipmentMatches: [],
      };
    } else if (currentMsg) {
      // Continuation of previous message
      currentMsg.text += '\n' + cleanLine;
    }
  }

  // Don't forget last message
  if (currentMsg) {
    processMessage(currentMsg);
    messages.push(currentMsg);
  }

  return messages;
}

/**
 * Match equipment keywords and filter maintenance relevance
 */
function processMessage(msg: WhatsAppMessage) {
  const textLower = msg.text.toLowerCase();
  const matches = new Set<string>();

  for (const eq of EQUIPMENT_KEYWORDS) {
    for (const kw of eq.keywords) {
      if (textLower.includes(kw.toLowerCase())) {
        matches.add(eq.fleetNumber);
      }
    }
  }

  msg.equipmentMatches = Array.from(matches);
}

/**
 * Check if a message is maintenance-related
 */
export function isMaintenanceRelated(msg: WhatsAppMessage): boolean {
  const textLower = msg.text.toLowerCase();
  return MAINTENANCE_KEYWORDS.some(kw => textLower.includes(kw)) || msg.hasMedia;
}

// ============================================================
// GROUPING & FILTERING
// ============================================================

/**
 * Filter messages by date range and optionally by equipment
 */
export function filterMessages(
  messages: WhatsAppMessage[],
  dateFrom: string,
  dateTo: string,
  fleetNumber?: string,
  onlyMaintenance: boolean = true,
): WhatsAppMessage[] {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59);

  return messages.filter(msg => {
    if (msg.date < from || msg.date > to) return false;
    if (fleetNumber && !msg.equipmentMatches.includes(fleetNumber)) return false;
    if (onlyMaintenance && !isMaintenanceRelated(msg)) return false;
    return true;
  });
}

/**
 * Group messages by equipment fleet number
 */
export function groupByEquipment(messages: WhatsAppMessage[]): WhatsAppEquipmentGroup[] {
  const groups: Record<string, WhatsAppMessage[]> = {};

  for (const msg of messages) {
    for (const fleet of msg.equipmentMatches) {
      if (!groups[fleet]) groups[fleet] = [];
      groups[fleet].push(msg);
    }
  }

  return Object.entries(groups)
    .map(([fleetNumber, msgs]) => ({
      fleetNumber,
      messages: msgs.sort((a, b) => a.date.getTime() - b.date.getTime()),
      photoCount: msgs.filter(m => m.photoFile).length,
      messageCount: msgs.length,
    }))
    .sort((a, b) => a.fleetNumber.localeCompare(b.fleetNumber));
}

/**
 * Get statistics summary
 */
export function getChatStats(messages: WhatsAppMessage[]) {
  const senders = new Set(messages.map(m => m.sender));
  const photos = messages.filter(m => m.photoFile);
  const equipment = new Set(messages.flatMap(m => m.equipmentMatches));
  const maintenanceRelated = messages.filter(isMaintenanceRelated);

  return {
    totalMessages: messages.length,
    totalPhotos: photos.length,
    totalSenders: senders.size,
    senders: Array.from(senders),
    equipmentMentioned: Array.from(equipment),
    maintenanceMessages: maintenanceRelated.length,
    dateRange: messages.length > 0 ? {
      from: messages[0].dateStr,
      to: messages[messages.length - 1].dateStr,
    } : null,
  };
}

/**
 * Load photo as base64 from file path (for PDF embedding)
 */
export async function loadPhotoAsBase64(photoPath: string): Promise<string | null> {
  try {
    const response = await fetch(photoPath);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
