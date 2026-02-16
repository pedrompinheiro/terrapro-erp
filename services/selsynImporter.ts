
import { supabase } from '../lib/supabase';

// Dados extraídos do CSV
const csvVehicles = [
    { code: 'AAA-0001', type: 'Motoniveladora', name: 'MN08 - MOTONIVELADORA 140M', brand: 'CATERPILLAR', model: '140M' },
    { code: 'AAA-0002', type: 'Escavadeira', name: 'ME04 - MINI ESC 302.7', brand: 'CATERPILLAR', model: '302.7' },
    { code: 'AAA-0003', type: 'Rolo Compactador', name: 'RC04 - MINI ROLO COMPACTADOR', brand: '', model: 'CB-14' },
    { code: 'AAA-0004', type: 'Escavadeira', name: 'ME05 - MINI ESC E10', brand: '', model: 'E10' },
    { code: 'AAA-0005', type: 'Escavadeira', name: 'ME01 - MINI ESC 303.5', brand: 'CATERPILLAR', model: '303.5' },
    { code: 'AAA-0006', type: 'Escavadeira', name: 'ME02 - MINI ESC 303.5', brand: '', model: '303.5' },
    { code: 'AAA-0007', type: 'Retro Escavadeira', name: 'RT01 - RETROESCAVADEIRA 416F', brand: '', model: '416F' },
    { code: 'AAA-0008', type: 'Retro Escavadeira', name: 'RT02 - RETROESCAVADEIRA 416F', brand: '', model: '416F' },
    { code: 'AAA-0009', type: 'Escavadeira', name: 'ME03 - MINI ESC SV08', brand: '', model: 'SV08' },
    { code: 'AAA-0010', type: 'Retro Escavadeira', name: 'RT06 - RETROESCAVADEIRA 416', brand: '', model: '416' },
    { code: 'AAA-0011', type: 'Rolo Compactador', name: 'RC01 - ROLO COMPACTADOR PATA CA25P', brand: '', model: 'CA25P' },
    { code: 'AAA-0012', type: 'Rolo Compactador', name: 'RC02 - ROLO COMPACTADOR CHAPA CA25L', brand: '', model: 'CA25L' },
    { code: 'AAA-0013', type: 'Rolo Compactador', name: 'RC03 - ROLO COMPACTADOR PATA CA250', brand: '', model: 'CA250' },
    { code: 'AAA-0014', type: 'Escavadeira', name: 'EC01 - ESCAVADEIRA EC140', brand: 'VOLVO', model: 'EC140BLCM' },
    { code: 'AAA-0015', type: 'Escavadeira', name: 'EC02 - ESCAVADEIRA EC220', brand: '', model: 'EC220' },
    { code: 'AAA-0016', type: 'Escavadeira', name: 'EC03 - ESCAVADEIRA SDLG', brand: '', model: 'LG6150' },
    { code: 'AAA-0017', type: 'Mini Carregadeira', name: 'MC02 - MINI PÁ CARREGADEIRA 242D3', brand: 'CATERPILLAR', model: '242D3' },
    { code: 'AAA-0018', type: 'Mini Carregadeira', name: 'MC03 - MINI PÁ CARREGADEIRA L220', brand: 'NEW HOLLAND', model: 'L220' },
    { code: 'AAA-0019', type: 'Mini Carregadeira', name: 'MC04 - MINI PÁ CARREGADEIRA 226B3', brand: '', model: '226B3' },
    { code: 'AAA-0020', type: 'Mini Carregadeira', name: 'MC05 - MINI PÁ CARREGADEIRA 242D3', brand: 'CATERPILLAR', model: '242D3' },
    { code: 'AAA-0021', type: 'Carregadeira', name: 'PC05 - PA CARREGADEIRA KOMATSU', brand: 'KOMATSU', model: 'WA180' },
    { code: 'AAA-0022', type: 'Motoniveladora', name: 'MN02 - MOTONIVELADORA 140H', brand: '', model: '140H' },
    { code: 'AAA-0023', type: 'Trator', name: 'TR01 - TRATOR GRUA 6110J', brand: 'JOHN DEERE', model: '6110J' },
    { code: 'AAA-0024', type: 'Trator', name: 'TR02 - TRATOR 6605', brand: 'JOHN DEERE', model: '6605' },
    { code: 'AAA-0026', type: 'Trator', name: 'TR03 - TRATOR VALTRA BH185I', brand: 'JOHN DEERE', model: 'BH185I' },
    { code: 'AAA-0027', type: 'Carregadeira', name: 'PC03 - PA CARREGADEIRA L60F', brand: '', model: 'L60F' },
    { code: 'AAA-0028', type: 'Escavadeira', name: 'EC05 - ESCAVADEIRA EC130 KOMATSU', brand: 'KOMATSU', model: 'EC130' },
    { code: 'AAA-0029', type: 'Motoniveladora', name: 'MN04 - MOTONIVELADORA 140G', brand: 'CATERPILLAR', model: '140G' },
    { code: 'AAA-0030', type: 'Retro Escavadeira', name: 'RT05 - RETROESCAVADEIRA 416', brand: '', model: '416' },
    { code: 'AAA-0031', type: 'Mini Carregadeira', name: 'MC01 - MINI PÁ CARREGADEIRA MC70', brand: 'VOLVO', model: 'MC70' },
    { code: 'AAA-0032', type: 'Rolo Compactador', name: 'RC05 - ROLO COMPACTADOR PATA CA25P ENGP', brand: '', model: 'CA25P' },
    { code: 'AAA-0033', type: 'Carregadeira', name: 'PC09 - PA CARREGADEIRA L60F 2011', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0034', type: 'Motoniveladora', name: 'MN03- MOTONIVELADORA 170B - NEW HOLLAND', brand: 'NEW HOLLAND', model: '170B' },
    { code: 'AAA-0035', type: 'Carregadeira', name: 'PC04 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0036', type: 'Escavadeira', name: 'ME06 - MINI ESC E10 02', brand: 'MASERATI', model: 'E10' },
    { code: 'AAA-0037', type: 'Colheitadeira', name: 'COLHEDEIRA JOHN DHEERE 1550', brand: 'JOHN DEERE', model: '1550' },
    { code: 'AAA-0038', type: 'Carregadeira', name: 'PC02 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0039', type: 'Carregadeira', name: 'PC01 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0040', type: 'Carregadeira', name: 'PC06 - PA CARREGADEIRA L60F (CAVEIRÃO)', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0041', type: 'Carregadeira', name: 'PC08 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0058', type: 'Rolo Compactador', name: 'RC06 - ROLO COMPACTADOR PATA CA250-II', brand: '', model: 'CA250 - II' },
    { code: 'AAA-0059', type: 'Rolo Compactador', name: 'RC07 - ROLO COMPACTADOR CHAPA CAT', brand: 'CATERPILLAR', model: 'CS533E' },
    { code: 'AAA-0060', type: 'Rolo Compactador de Pneus', name: 'RP01 - ROLO DE PNEUS', brand: '', model: 'AP-26' },
    { code: 'AAA-0061', type: 'Caminhão Tanque', name: 'CT05 - PIPA 2216', brand: 'MERCEDES-BENZ', model: 'L2216' },
    { code: 'AAA-0062', type: 'Escavadeira', name: 'EC04 - ESCAVADEIRA SDLG', brand: 'VOLVO', model: 'LG6150' },
    { code: 'AAA-0063', type: 'Carregadeira', name: 'PC15 - PA CARREGADEIRA L110F 2016', brand: 'VOLVO', model: 'L110F' },
    { code: 'AAA-0064', type: 'Carregadeira', name: 'PC16 - PA CARREGADEIRA 924K 2025', brand: 'CATERPILLAR', model: '924K' },
    { code: 'AAA-0065', type: 'Trator de Esteira', name: 'TE01 - TRATOR ESTEIRA', brand: 'KOMATSU', model: 'D41E' },
    { code: 'AAA-0067', type: 'Trator', name: 'TR04 - TRATOR VALTRA 785', brand: 'VALTRA', model: '785' },
    { code: 'AAA-0068', type: 'Retro Escavadeira', name: 'RT03 - RETROESCAVADEIRA JCB', brand: '', model: '3CX' },
    { code: 'AAA-0069', type: 'Empilhadeira', name: 'EMPILHADEIRA LONKING', brand: '', model: '' },
    { code: 'AAA-0070', type: 'Escavadeira', name: 'EC06 - ESCAVADEIRA CAT 336DL', brand: 'CATERPILLAR', model: '336DL' },
    { code: 'AAA-9999', type: 'Avião', name: 'TESTE', brand: 'FERRARI', model: 'foda' },
    { code: 'AOW-6H81', type: 'Cavalo Mecânico', name: 'CAVALO MECANICO FH400', brand: 'VOLVO', model: 'FH400' },
    { code: 'ATX-0A31', type: 'Cavalo Mecânico', name: 'CAVALO MECANICO FH380', brand: 'VOLVO', model: 'FH380' },
    { code: 'AVK-5223', type: 'Cavalo Mecânico', name: 'CAVALO MECANICO FH440', brand: 'VOLVO', model: 'FH440' },
    { code: 'BAN-4D40', type: 'Carregadeira', name: 'PC07- FARELO 924K', brand: '', model: '' },
    { code: 'BDM-2B00', type: 'Pickup', name: 'F-1000 DUPLA RAMBO', brand: 'FORD', model: 'F-1000' },
    { code: 'BUH-8401', type: 'Pickup', name: 'D-20', brand: 'GMC', model: 'D-20' },
    { code: 'CHF-3H35', type: 'Caçamba', name: 'CB02 - CAMINHÃO BASCULANTE CARGO 2425', brand: 'FORD', model: 'CARGO 2425' },
    { code: 'CPT-3786', type: 'Caminhão Tanque', name: 'CT06 - PIPA 1520 TOCO (LENDARIO PEPITA)', brand: 'MERCEDES-BENZ', model: '1520' },
    { code: 'DDO-8I60', type: 'Guincho', name: 'PG01 - POLIGUINDASTE', brand: 'MERCEDES-BENZ', model: '1720' },
    { code: 'EFU-4J78', type: 'Caçamba', name: 'CB08 - CAMINHÃO BASCULANTE 31.260', brand: 'VOLKSWAGEN', model: '31.260' },
    { code: 'GLA-6110', type: 'Caminhão Plataforma', name: 'PRANCHA VOLVO N10', brand: 'VOLVO', model: 'N10' },
    { code: 'GVE-8F27', type: 'Caminhão Tanque', name: 'CT04 - PIPA 2423', brand: 'MERCEDES-BENZ', model: '2423' },
    { code: 'GXA-2216', type: 'Caçamba', name: 'CB05 - CAMINHÃO BASCULANTE 31.320', brand: '', model: '31.320' },
    { code: 'HNC-9I30', type: 'Caçamba', name: 'CB07 - CAMINHÃO BASCULANTE 31.320', brand: '', model: '31.320' },
    { code: 'HOA-8960', type: 'Caçamba', name: 'CB06 - CAMINHÃO BASCULANTE 31.320', brand: 'VOLKSWAGEN', model: '31.320' },
    { code: 'HQR-7D64', type: 'Caçamba', name: 'CB01 - CAMINHÃO BASCULANTE CARGO 1418', brand: '', model: 'CARGO 1418' },
    { code: 'HQV-9784', type: 'Caçamba', name: 'CB09 - CAMINHÃO BASCULANTE 1113 (LOJA)', brand: 'MERCEDES-BENZ', model: '1113' },
    { code: 'HRA-9309', type: 'Pickup', name: 'F1000 AZUL', brand: 'FORD', model: 'F1000' },
    { code: 'HRD-1566', type: 'Pickup', name: 'F-1000 PRATA', brand: 'FORD', model: 'F-1000' },
    { code: 'HSJ-1167', type: 'Micro-ônibus', name: 'MO02 - ONIBUS VOLARE V8', brand: 'VOLKSWAGEN', model: 'MARCOPOLO VOLARE V8' },
    { code: 'HSO-7122', type: 'Moto', name: 'MT - BROS VERMELHA HSO 7122', brand: '', model: 'BROS NXR150' },
    { code: 'HTP-2919', type: 'Pickup', name: 'CA01 - F350 (LITUCERA)', brand: '', model: 'F350' },
    { code: 'HTU-5182', type: 'Moto', name: 'MT - BROS PRETA', brand: 'HONDA', model: 'NXR150' },
    { code: 'ISP-6F11', type: 'Caçamba', name: 'CB04 - CAMINHÃO BASCULANTE 26.260', brand: 'VOLKSWAGEN', model: '26.260' },
    { code: 'KHZ-4292', type: 'Caminhão Tanque', name: 'CT01 - PIPA TRUCK', brand: 'FORD', model: 'CARGO 2628' },
    { code: 'KJX-7A19', type: 'Caminhão Tanque', name: 'CT02 - PIPA TOCO', brand: 'MERCEDES-BENZ', model: '1420' },
    { code: 'KOQ-1I32', type: 'Caçamba', name: 'CB10 - CAMINHÃO BASCULANTE 2622', brand: '', model: '2622E' },
    { code: 'KRF-4C08', type: 'Caçamba', name: 'CB11 - CAMINHÃO BASCULANTE 17.190', brand: 'VOLKSWAGEN', model: '17.190' },
    { code: 'LSX-5B07', type: 'Caçamba', name: 'CB12 - CAMINHÃO BASCULANTE 17.190', brand: 'VOLKSWAGEN', model: '17.190' },
    { code: 'MCM-8836', type: 'Caçamba', name: 'CB03 - CAMINHÃO BASCULANTE CARGO 2631', brand: '', model: 'CARGO 2631' },
    { code: 'MSZ-1E47', type: 'Caminhão Plataforma', name: 'FORD CARGO 8150 PRANCHA', brand: '', model: 'CARGO' },
    { code: 'NBK-3692', type: 'Caminhão', name: 'CC01 - DELIVERY 8.150E (LOJA)', brand: '', model: '8.150E' },
    { code: 'NRI-0G84', type: 'Moto', name: 'MT - BROS VERMELHA', brand: 'HONDA', model: 'NXR150' },
    { code: 'NRU-5A71', type: 'Carro', name: 'SAVEIRO', brand: '', model: 'SAVEIRO' },
    { code: 'PRK-9F72', type: 'Pickup', name: 'STRADA', brand: 'FIAT', model: 'STRADA' },
    { code: 'TEM-0P00', type: 'Caminhão Tanque', name: 'CT-03 - PIPA EXERCITO', brand: 'MERCEDES-BENZ', model: '199' }
];

export const importSelsynVehicles = async (onLog: (msg: string) => void) => {
    onLog("Iniciando importação...");

    // Get Current Company
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não Autenticado");

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if not found immediately

    let companyId = profile?.company_id;

    if (!companyId) {
        onLog("⚠️ Perfil não encontrado. Buscando empresa padrão (Fallback)...");
        const { data: companies } = await supabase.from('companies').select('id').limit(1);
        if (companies && companies.length > 0) {
            companyId = companies[0].id;
            onLog(`✅ Usando empresa padrão: ${companyId}`);
        } else {
            throw new Error("Impossível determinar a empresa. Perfil e Lista de Empresas vazios.");
        }
    } else {
        onLog(`Empresa ID: ${companyId}`);
    }

    let success = 0;

    for (const v of csvVehicles) {
        // Check if exists by CODE (Placa)
        const { data: existing } = await supabase
            .from('assets')
            .select('id')
            .eq('code', v.code)
            .single();

        if (existing) {
            onLog(`Atualizando ${v.code}...`);
            await supabase.from('assets').update({
                name: v.name,
                model: v.model,
                brand: v.brand || 'GENERIC',
                telemetry: {
                    deviceType: v.type,
                    originalCsvData: v
                }
            }).eq('id', existing.id);
        } else {
            onLog(`Criando ${v.code}...`);
            const { error } = await supabase.from('assets').insert({
                company_id: companyId,
                name: v.name,
                code: v.code,
                model: v.model,
                brand: v.brand || 'GENERIC',
                status: 'AVAILABLE',
                horometer_total: 0,
                odometer_total: 0,
                telemetry: {
                    deviceType: v.type,
                    originalCsvData: v
                }
            });
            if (error) onLog(`ERRO ${v.code}: ${error.message}`);
        }
        success++;
    }
    onLog(`Concluído! ${success} veículos processados.`);
};
