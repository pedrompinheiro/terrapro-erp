/**
 * TERRAPRO ERP - Maintenance Plan PDF Generator
 * Gera PDFs de checklist (formato planilha) e relatório por período
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TERRA_LOGO_BASE64 } from './terraLogoBase64';
import {
  MaintenancePlanTemplate,
  MaintenancePlanItem,
  MaintenanceReportData,
  INTERVAL_LABELS,
  INTERVAL_ORDER,
} from './maintenancePlanService';

// ============================================================
// CONSTANTES
// ============================================================

const TERRA_GREEN = [46, 125, 50] as const;
const HEADER_BG = [33, 37, 41] as const;
const WHITE = [255, 255, 255] as const;
const BLACK = [0, 0, 0] as const;
const LIGHT_GRAY = [245, 245, 245] as const;
const CATEGORY_BG = [220, 220, 220] as const;

const COMPANY_NAME = 'Transportadora e Terraplanagem Terra';
const COMPANY_CNPJ = 'CNPJ: 14.628.837/0001-94';

// ============================================================
// CHECKLIST PDF (formato planilha Excel)
// ============================================================

export interface ChecklistPDFOptions {
  date?: string;
  horimeter?: number;
  odometer?: number;
  mechanic?: string;
  notes?: string;
}

export function generateMaintenancePlanPDF(
  template: MaintenancePlanTemplate,
  items: MaintenancePlanItem[],
  options?: ChecklistPDFOptions,
) {
  const doc = new jsPDF('landscape', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 30;

  // --- HEADER ---
  const logoW = 80;
  const logoH = logoW / 1.88;
  doc.addImage(TERRA_LOGO_BASE64, 'PNG', margin, 12, logoW, logoH);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TERRA_GREEN);
  doc.text('PLANO DE MANUTENÇÃO', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(COMPANY_NAME, pageWidth / 2, 44, { align: 'center' });
  doc.text(COMPANY_CNPJ, pageWidth / 2, 55, { align: 'center' });

  // Green line
  doc.setDrawColor(...TERRA_GREEN);
  doc.setLineWidth(1.5);
  doc.line(margin, 62, pageWidth - margin, 62);

  // --- EQUIPMENT INFO ---
  let curY = 74;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  const col1X = margin;
  const col2X = margin + 200;
  const col3X = margin + 450;
  const col4X = margin + 620;

  const dateStr = options?.date || new Date().toLocaleDateString('pt-BR');

  doc.text('EQUIPAMENTO:', col1X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(template.asset_name || '', col1X + 80, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('SÉRIE:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(template.serial_number || '-', col2X + 40, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('DATA:', col3X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, col3X + 35, curY);

  curY += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('MARCA:', col1X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(template.brand || '-', col1X + 42, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('FROTA:', col2X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(template.fleet_number || '-', col2X + 40, curY);

  doc.setFont('helvetica', 'bold');
  doc.text('HORÍMETRO:', col3X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(options?.horimeter ? String(options.horimeter) : '________', col3X + 65, curY);

  curY += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('MODELO:', col1X, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(template.model || '-', col1X + 48, curY);

  curY += 10;

  // --- GROUP ITEMS BY INTERVAL + CATEGORY ---
  const grouped = groupItemsByInterval(items);

  // Build table rows
  const tableBody: any[][] = [];

  for (const intervalType of INTERVAL_ORDER) {
    const categories = grouped[intervalType];
    if (!categories) continue;

    const intervalLabel = INTERVAL_LABELS[intervalType] || intervalType;
    let firstInInterval = true;

    for (const [category, catItems] of Object.entries(categories)) {
      // Category header row
      tableBody.push([
        { content: firstInInterval ? intervalLabel : '', rowSpan: 1, styles: { fontStyle: 'bold', fontSize: 8, fillColor: [240, 240, 240] } },
        { content: category, colSpan: 1, styles: { fontStyle: 'bold', fontSize: 8, fillColor: [...CATEGORY_BG] } },
        { content: '', styles: { fillColor: [...CATEGORY_BG] } },
        { content: '', styles: { fillColor: [...CATEGORY_BG] } },
        { content: '', styles: { fillColor: [...CATEGORY_BG] } },
        { content: '', styles: { fillColor: [...CATEGORY_BG] } },
      ]);
      firstInInterval = false;

      for (const item of catItems) {
        tableBody.push([
          '',
          item.service_name,
          item.action_check ? 'X' : '',
          item.action_clean ? 'X' : '',
          item.action_replace ? 'X' : '',
          item.action_adjust ? 'X' : '',
        ]);
      }
    }
  }

  // --- DRAW TABLE ---
  autoTable(doc, {
    startY: curY,
    margin: { left: margin, right: margin },
    head: [[
      { content: 'INTERVALO DE\nSERVIÇO', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
      { content: 'OPERAÇÃO DE\nSERVIÇO', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
      { content: 'VERIFICAR', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
      { content: 'LIMPAR', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
      { content: 'TROCAR', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
      { content: 'AJUSTAR OU\nADICIONAR', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
    ]],
    body: tableBody,
    columnStyles: {
      0: { cellWidth: 100, halign: 'center', fontSize: 7, fontStyle: 'bold' },
      1: { cellWidth: 'auto', fontSize: 8 },
      2: { cellWidth: 55, halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: [...TERRA_GREEN] },
      3: { cellWidth: 55, halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: [...TERRA_GREEN] },
      4: { cellWidth: 55, halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: [...TERRA_GREEN] },
      5: { cellWidth: 80, halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: [...TERRA_GREEN] },
    },
    styles: {
      lineWidth: 0.3,
      lineColor: [180, 180, 180],
      cellPadding: 4,
      overflow: 'linebreak',
    },
    theme: 'grid',
    didParseCell: (data: any) => {
      // Style X marks
      if (data.section === 'body' && data.column.index >= 2 && data.cell.raw === 'X') {
        data.cell.styles.textColor = [...TERRA_GREEN];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // --- OBS + SIGNATURE ---
  const finalY = (doc as any).lastAutoTable?.finalY || curY + 200;
  let obsY = finalY + 15;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OBS:', margin, obsY);
  doc.setFont('helvetica', 'normal');
  doc.text(options?.notes || template.notes || '', margin + 30, obsY);

  obsY += 25;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, obsY, margin + 250, obsY);
  doc.setFontSize(8);
  doc.text('Assinatura do Responsável', margin, obsY + 12);

  if (options?.mechanic) {
    doc.text(`Mecânico: ${options.mechanic}`, margin + 300, obsY + 12);
  }

  // --- FOOTER ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado por TerraPro ERP em ${new Date().toLocaleDateString('pt-BR')} - Terra Máquinas Ltda`,
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' },
  );

  // Download
  const fileName = `Plano_Manutencao_${template.fleet_number || template.asset_name}_${dateStr.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

// ============================================================
// RELATÓRIO DE MANUTENÇÃO POR PERÍODO (PDF para Bunge)
// ============================================================

export interface ReportPDFOptions {
  dateFrom: string;
  dateTo: string;
  contratante?: string;
  showValues?: boolean;        // incluir valores (R$) no relatório
  showWhatsApp?: boolean;      // incluir mensagens do WhatsApp
  showPhotos?: boolean;        // incluir fotos das OS
  whatsappMessages?: import('./whatsappChatParser').WhatsAppEquipmentGroup[];
  photoCache?: Record<string, string>; // url → base64 (OS photos)
  whatsappPhotos?: Record<string, string>; // filename → base64 (WhatsApp photos from ZIP)
}

export function generateMaintenanceReportPDF(
  reportData: MaintenanceReportData[],
  options: ReportPDFOptions,
) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30;

  const dateFromFmt = formatDateBR(options.dateFrom);
  const dateToFmt = formatDateBR(options.dateTo);
  const contratante = options.contratante || 'Bunge Alimentos S.A.';

  // ===== PAGE 1: CAPA + RESUMO =====
  drawReportHeader(doc, margin);

  let curY = 90;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TERRA_GREEN);
  doc.text('RELATÓRIO DE MANUTENÇÃO', pageWidth / 2, curY, { align: 'center' });
  curY += 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(`Período: ${dateFromFmt} a ${dateToFmt}`, pageWidth / 2, curY, { align: 'center' });
  curY += 14;
  doc.text(`Contratante: ${contratante}`, pageWidth / 2, curY, { align: 'center' });
  curY += 25;

  // Separator
  doc.setDrawColor(...TERRA_GREEN);
  doc.setLineWidth(1);
  doc.line(margin, curY, pageWidth - margin, curY);
  curY += 20;

  const showValues = options.showValues !== false; // default true
  const showWhatsApp = options.showWhatsApp === true;
  const showPhotos = options.showPhotos === true;

  // Summary
  const totalOS = reportData.reduce((sum, r) => sum + r.serviceOrders.length + r.maintenanceOrders.length, 0);
  const totalCost = reportData.reduce((sum, r) => sum + r.totalCost, 0);
  const totalPrev = reportData.reduce((sum, r) => sum + r.totalPreventive, 0);
  const totalCorr = reportData.reduce((sum, r) => sum + r.totalCorrective, 0);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO GERAL', margin, curY);
  curY += 18;

  // Summary box
  const boxH = showValues ? 70 : 55;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, curY, pageWidth - margin * 2, boxH, 5, 5, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const sumCol1 = margin + 20;
  const sumCol2 = pageWidth / 2 + 20;

  doc.text(`Total de OS realizadas: ${totalOS}`, sumCol1, curY + 18);
  doc.text(`Preventivas: ${totalPrev}`, sumCol2, curY + 18);
  doc.text(`Equipamentos atendidos: ${reportData.length}`, sumCol1, curY + 36);
  doc.text(`Corretivas: ${totalCorr}`, sumCol2, curY + 36);
  if (showValues) {
    doc.text(`Custo total: R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sumCol1, curY + 54);
  }

  curY += boxH + 20;

  // Equipment summary table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPAMENTOS NO PERÍODO', margin, curY);
  curY += 10;

  const summaryBody = reportData.map(r => {
    const row: any[] = [
      r.template.fleet_number || '-',
      `${r.template.asset_name} ${r.template.brand || ''} ${r.template.model || ''}`,
      String(r.serviceOrders.length + r.maintenanceOrders.length),
      String(r.totalPreventive),
      String(r.totalCorrective),
    ];
    if (showValues) row.push(`R$ ${r.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    return row;
  });

  const summaryHead: any[] = [
    { content: 'FROTA', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 8 } },
    { content: 'EQUIPAMENTO', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 8 } },
    { content: 'TOTAL OS', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 8 } },
    { content: 'PREV.', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 8 } },
    { content: 'CORR.', styles: { halign: 'center', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 8 } },
  ];
  if (showValues) summaryHead.push({ content: 'CUSTO', styles: { halign: 'right', fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 8 } });

  const summaryColStyles: any = {
    0: { cellWidth: 60, halign: 'center', fontStyle: 'bold' },
    1: { cellWidth: 'auto' },
    2: { cellWidth: 55, halign: 'center' },
    3: { cellWidth: 45, halign: 'center' },
    4: { cellWidth: 45, halign: 'center' },
  };
  if (showValues) summaryColStyles[5] = { cellWidth: 90, halign: 'right' };

  autoTable(doc, {
    startY: curY,
    margin: { left: margin, right: margin },
    head: [summaryHead],
    body: summaryBody,
    columnStyles: summaryColStyles,
    styles: { fontSize: 8, cellPadding: 4 },
    alternateRowStyles: { fillColor: [...LIGHT_GRAY] },
    theme: 'grid',
  });

  // ===== DETAIL PAGES: One section per equipment =====
  for (const report of reportData) {
    doc.addPage();
    drawReportHeader(doc, margin);
    curY = 80;

    // Equipment header
    doc.setFillColor(...TERRA_GREEN);
    doc.rect(margin, curY, pageWidth - margin * 2, 24, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(
      `${report.template.fleet_number || ''} - ${report.template.asset_name} ${report.template.brand || ''} ${report.template.model || ''}`,
      margin + 10,
      curY + 16,
    );
    curY += 34;

    doc.setTextColor(...BLACK);

    // Service Orders from Almoxarifado
    if (report.serviceOrders.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDENS DE SERVIÇO - ALMOXARIFADO', margin, curY);
      curY += 12;

      for (const so of report.serviceOrders) {
        // Check page space
        if (curY > pageHeight - 120) {
          doc.addPage();
          drawReportHeader(doc, margin);
          curY = 80;
        }

        // OS header
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...TERRA_GREEN);
        // Real fields: order_number, technician_name, service_1..5, service_memo, total_value
        const osLabel = so.order_number ? `OS #${so.order_number}` : `OS ${formatDateBR(so.entry_date)}`;
        doc.text(`${osLabel} - ${formatDateBR(so.entry_date)}`, margin, curY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BLACK);
        if (so.technician_name) doc.text(`Mecânico: ${so.technician_name}`, margin + 250, curY);
        curY += 12;

        // Build service description from service_1..5 + service_memo
        const serviceDesc = [so.service_1, so.service_2, so.service_3, so.service_4, so.service_5, so.service_memo]
          .filter(Boolean).join('; ');
        if (serviceDesc) {
          doc.setFontSize(8);
          const lines = doc.splitTextToSize(`Serviço: ${serviceDesc}`, pageWidth - margin * 2 - 10);
          doc.text(lines, margin + 5, curY);
          curY += lines.length * 10;
        }

        // Defect info
        const defectDesc = [so.defect_1, so.defect_2, so.defect_memo].filter(Boolean).join('; ');
        if (defectDesc) {
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          const defLines = doc.splitTextToSize(`Defeito: ${defectDesc}`, pageWidth - margin * 2 - 10);
          doc.text(defLines, margin + 5, curY);
          curY += defLines.length * 9;
          doc.setTextColor(...BLACK);
        }

        // Items/parts table
        const soItems = so.service_order_items || [];
        if (soItems.length > 0) {
          const itemsHead: any[] = [
            { content: 'PRODUTO/SERVIÇO', styles: { fillColor: [100, 100, 100], textColor: [...WHITE], fontSize: 7 } },
            { content: 'QTD', styles: { halign: 'center', fillColor: [100, 100, 100], textColor: [...WHITE], fontSize: 7 } },
            { content: 'UN', styles: { halign: 'center', fillColor: [100, 100, 100], textColor: [...WHITE], fontSize: 7 } },
          ];
          if (showValues) {
            itemsHead.push(
              { content: 'VLR UNIT.', styles: { halign: 'right', fillColor: [100, 100, 100], textColor: [...WHITE], fontSize: 7 } },
              { content: 'TOTAL', styles: { halign: 'right', fillColor: [100, 100, 100], textColor: [...WHITE], fontSize: 7 } },
            );
          }

          const itemsBody = soItems.map((item: any) => {
            const row: any[] = [
              item.description || item.item_description || '-',
              String(item.quantity || 1),
              item.unit || 'UN',
            ];
            if (showValues) {
              const unitVal = Number(item.unit_price || item.unit_cost || 0);
              const totalVal = Number(item.total || item.total_cost || (item.quantity || 1) * unitVal);
              row.push(
                `R$ ${unitVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `R$ ${totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              );
            }
            return row;
          });

          const itemsColStyles: any = {
            0: { cellWidth: 'auto', fontSize: 7 },
            1: { cellWidth: 35, halign: 'center', fontSize: 7 },
            2: { cellWidth: 30, halign: 'center', fontSize: 7 },
          };
          if (showValues) {
            itemsColStyles[3] = { cellWidth: 65, halign: 'right', fontSize: 7 };
            itemsColStyles[4] = { cellWidth: 65, halign: 'right', fontSize: 7, fontStyle: 'bold' };
          }

          autoTable(doc, {
            startY: curY,
            margin: { left: margin + 5, right: margin },
            head: [itemsHead],
            body: itemsBody,
            columnStyles: itemsColStyles,
            styles: { cellPadding: 3 },
            theme: 'grid',
          });

          curY = (doc as any).lastAutoTable?.finalY + 5 || curY + 40;
        }

        // Photos from OS (embed if available in cache)
        const photos = [so.photo_1_url, so.photo_2_url, so.photo_3_url, so.photo_4_url].filter(Boolean);
        if (photos.length > 0 && showPhotos && options.photoCache) {
          // Check page space for photos
          if (curY > pageHeight - 180) {
            doc.addPage();
            drawReportHeader(doc, margin);
            curY = 80;
          }

          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 100);
          doc.text('Registro Fotográfico:', margin + 5, curY);
          curY += 8;

          let photoX = margin + 5;
          const photoW = 120;
          const photoH = 90;
          for (const photoUrl of photos) {
            const b64 = options.photoCache[photoUrl];
            if (b64) {
              try {
                if (photoX + photoW > pageWidth - margin) {
                  photoX = margin + 5;
                  curY += photoH + 5;
                }
                if (curY + photoH > pageHeight - 60) {
                  doc.addPage();
                  drawReportHeader(doc, margin);
                  curY = 80;
                  photoX = margin + 5;
                }
                doc.addImage(b64, 'JPEG', photoX, curY, photoW, photoH);
                photoX += photoW + 8;
              } catch { /* skip invalid image */ }
            }
          }
          curY += photoH + 10;
        } else if (photos.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(`[${photos.length} foto(s) registrada(s) na OS]`, margin + 5, curY);
          curY += 10;
        }

        // OS total cost (real field: total_value)
        const soTotal = Number(so.total_value || so.total_cost || 0);
        if (showValues && soTotal > 0) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...BLACK);
          doc.text(
            `Total OS: R$ ${soTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            pageWidth - margin,
            curY,
            { align: 'right' },
          );
          curY += 15;
        }

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, curY, pageWidth - margin, curY);
        curY += 10;
      }
    }

    // Maintenance Orders
    if (report.maintenanceOrders.length > 0) {
      if (curY > pageHeight - 100) {
        doc.addPage();
        drawReportHeader(doc, margin);
        curY = 80;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BLACK);
      doc.text('ORDENS DE SERVIÇO - MANUTENÇÃO INTERNA', margin, curY);
      curY += 12;

      const moBody = report.maintenanceOrders.map((mo: any) => [
        mo.seq_number ? `#${mo.seq_number}` : formatDateBR(mo.opened_at),
        formatDateBR(mo.opened_at),
        mo.type === 'PREVENTIVE' ? 'Preventiva' : mo.type === 'CORRECTIVE' ? 'Corretiva' : mo.type || '-',
        mo.description || '-',
        mo.mechanic || '-',
        mo.status === 'COMPLETED' ? 'Concluída' : mo.status || '-',
      ]);

      autoTable(doc, {
        startY: curY,
        margin: { left: margin, right: margin },
        head: [[
          { content: 'OS', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
          { content: 'DATA', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
          { content: 'TIPO', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
          { content: 'DESCRIÇÃO', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
          { content: 'MECÂNICO', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
          { content: 'STATUS', styles: { fillColor: [...HEADER_BG], textColor: [...WHITE], fontSize: 7 } },
        ]],
        body: moBody,
        columnStyles: {
          0: { cellWidth: 40, halign: 'center', fontSize: 7 },
          1: { cellWidth: 65, halign: 'center', fontSize: 7 },
          2: { cellWidth: 60, fontSize: 7 },
          3: { cellWidth: 'auto', fontSize: 7 },
          4: { cellWidth: 70, fontSize: 7 },
          5: { cellWidth: 55, halign: 'center', fontSize: 7 },
        },
        styles: { cellPadding: 3 },
        alternateRowStyles: { fillColor: [...LIGHT_GRAY] },
        theme: 'grid',
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 2) {
            const val = String(data.cell.raw || '');
            if (val.includes('Preventiva')) data.cell.styles.textColor = [...TERRA_GREEN];
            else if (val.includes('Corretiva')) data.cell.styles.textColor = [220, 50, 50];
          }
        },
      });

      curY = (doc as any).lastAutoTable?.finalY + 10 || curY + 50;
    }

    // ---- WhatsApp Messages Section ----
    if (showWhatsApp && options.whatsappMessages) {
      const equipGroup = options.whatsappMessages.find(g =>
        g.fleetNumber === report.template.fleet_number
      );

      if (equipGroup && equipGroup.messages.length > 0) {
        if (curY > pageHeight - 120) {
          doc.addPage();
          drawReportHeader(doc, margin);
          curY = 80;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...TERRA_GREEN);
        doc.text('REGISTROS WHATSAPP - GRUPO MANUTENÇÃO', margin, curY);
        curY += 5;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text(`${equipGroup.messages.length} mensagens | ${equipGroup.photoCount} fotos`, margin, curY + 8);
        curY += 14;

        const whatsBody = equipGroup.messages.slice(0, 50).map(msg => [
          msg.dateStr,
          msg.sender,
          (msg.text || '').substring(0, 100) + (msg.text && msg.text.length > 100 ? '...' : ''),
          msg.photoFile ? 'FOTO' : '',
        ]);

        autoTable(doc, {
          startY: curY,
          margin: { left: margin, right: margin },
          head: [[
            { content: 'DATA', styles: { fillColor: [37, 211, 102], textColor: [...WHITE], fontSize: 7 } },
            { content: 'MECÂNICO', styles: { fillColor: [37, 211, 102], textColor: [...WHITE], fontSize: 7 } },
            { content: 'MENSAGEM', styles: { fillColor: [37, 211, 102], textColor: [...WHITE], fontSize: 7 } },
            { content: '', styles: { fillColor: [37, 211, 102], textColor: [...WHITE], fontSize: 7 } },
          ]],
          body: whatsBody,
          columnStyles: {
            0: { cellWidth: 60, fontSize: 7 },
            1: { cellWidth: 80, fontSize: 7 },
            2: { cellWidth: 'auto', fontSize: 7 },
            3: { cellWidth: 20, halign: 'center', fontSize: 8 },
          },
          styles: { cellPadding: 3, overflow: 'linebreak' },
          alternateRowStyles: { fillColor: [240, 255, 240] },
          theme: 'grid',
        });

        curY = (doc as any).lastAutoTable?.finalY + 10 || curY + 50;

        // WhatsApp photos grid - use whatsappPhotos from ZIP extraction
        const wpPhotoMap = options.whatsappPhotos || options.photoCache || {};
        if (showPhotos && equipGroup.photoCount > 0 && Object.keys(wpPhotoMap).length > 0) {
          const whatsPhotos = equipGroup.messages.filter(m => m.photoFile);
          if (whatsPhotos.length > 0) {
            if (curY > pageHeight - 120) {
              doc.addPage();
              drawReportHeader(doc, margin);
              curY = 80;
            }

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(37, 211, 102);
            doc.text('Fotos WhatsApp:', margin, curY);
            curY += 8;

            let photoX = margin;
            const pw = 130;
            const ph = 97;
            for (const msg of whatsPhotos.slice(0, 20)) {
              // Try matching photoFile by exact name or partial name
              let b64: string | null = null;
              if (msg.photoFile) {
                // Direct match
                b64 = wpPhotoMap[msg.photoFile] || null;
                // Try without path prefix
                if (!b64) {
                  const baseName = msg.photoFile.split('/').pop() || msg.photoFile;
                  b64 = wpPhotoMap[baseName] || null;
                }
                // Try partial match (WhatsApp names like "00012345-PHOTO-2026-02-18...")
                if (!b64) {
                  const photoKey = Object.keys(wpPhotoMap).find(k =>
                    k.includes(msg.photoFile!) || msg.photoFile!.includes(k)
                  );
                  if (photoKey) b64 = wpPhotoMap[photoKey];
                }
              }
              if (b64) {
                try {
                  if (photoX + pw > pageWidth - margin) {
                    photoX = margin;
                    curY += ph + 14;
                  }
                  if (curY + ph > pageHeight - 60) {
                    doc.addPage();
                    drawReportHeader(doc, margin);
                    curY = 80;
                    photoX = margin;
                  }
                  doc.addImage(b64, 'JPEG', photoX, curY, pw, ph);
                  // Date caption below photo
                  doc.setFontSize(6);
                  doc.setTextColor(100, 100, 100);
                  doc.text(`${msg.dateStr} - ${msg.sender}`, photoX, curY + ph + 8);
                  photoX += pw + 8;
                } catch { /* skip */ }
              }
            }
            curY += ph + 18;
          }
        }
      }
    }

    // Equipment total (only when showing values)
    if (showValues) {
      if (curY > pageHeight - 40) {
        doc.addPage();
        drawReportHeader(doc, margin);
        curY = 80;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BLACK);
      doc.text(
        `CUSTO TOTAL ${report.template.fleet_number || ''}: R$ ${report.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        pageWidth - margin,
        curY + 10,
        { align: 'right' },
      );
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Gerado por TerraPro ERP em ${new Date().toLocaleDateString('pt-BR')} - Terra Máquinas Ltda`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' },
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
  }

  // Download
  const fileName = `Relatorio_Manutencao_${dateFromFmt.replace(/\//g, '-')}_a_${dateToFmt.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

// ============================================================
// HELPERS
// ============================================================

function drawReportHeader(doc: jsPDF, margin: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoW = 70;
  const logoH = logoW / 1.88;
  doc.addImage(TERRA_LOGO_BASE64, 'PNG', margin, 12, logoW, logoH);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text(COMPANY_NAME, pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_CNPJ, pageWidth / 2, 40, { align: 'center' });

  doc.setDrawColor(...TERRA_GREEN);
  doc.setLineWidth(1);
  doc.line(margin, 55, pageWidth - margin, 55);
}

function formatDateBR(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function groupItemsByInterval(items: MaintenancePlanItem[]): Record<string, Record<string, MaintenancePlanItem[]>> {
  const result: Record<string, Record<string, MaintenancePlanItem[]>> = {};
  for (const item of items) {
    if (!result[item.interval_type]) result[item.interval_type] = {};
    if (!result[item.interval_type][item.category]) result[item.interval_type][item.category] = [];
    result[item.interval_type][item.category].push(item);
  }
  return result;
}
