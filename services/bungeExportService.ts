/**
 * ============================================================
 * Serviço de Exportação PDF/XLS - Faturamento BUNGE
 * Gera documentos no padrão Terra para envio ao cliente
 * ============================================================
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BungeBilling, BungeBillingItem, HECalcResult, HEDayDetail, formatMonthYear, formatCurrency } from './bungeService';
import { TERRA_LOGO_BASE64 } from './terraLogoBase64';

// ============================================================
// CONSTANTES DE LAYOUT
// ============================================================

const TERRA_GREEN = [46, 125, 50] as const;    // Verde escuro do logo
const HEADER_BG = [33, 37, 41] as const;       // Fundo escuro cabeçalho tabela
const WHITE = [255, 255, 255] as const;
const BLACK = [0, 0, 0] as const;
const YELLOW_BG = [255, 255, 0] as const;
const LIGHT_GRAY = [245, 245, 245] as const;

const COMPANY_NAME = 'Transportadora e Terraplanagem Terra';
const COMPANY_CNPJ = 'CNPJ: 14.628.837/0001-94';
const COMPANY_FULL = 'Transportadora e Terraplanagem Terra LTDA-ME';
const CONTACT_LINE = 'Contato através do telefone (67) 99115-2262/(67) 99908-7268/(67) 98451-1588';
const EMAIL_LINE = 'Em caso de dúvidas, entrar em contato através do e-mail: trans.terra@hotmail.com';
const CONFIDENTIAL = 'DOCUMENTO CONFIDENCIAL';

// ============================================================
// HELPERS
// ============================================================

/** Remove segundos de HH:MM:SS → HH:MM */
function fmtTime(val: string | null | undefined): string {
  if (!val || val === '-' || val === '') return '-';
  const s = String(val).trim();
  // HH:MM:SS → HH:MM
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  // H:MM:SS → 0H:MM
  if (/^\d{1}:\d{2}:\d{2}$/.test(s)) return ('0' + s).slice(0, 5);
  // Already HH:MM
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  return s;
}

/** Formata minutos como HH:MM com leading zeros */
function fmtHM(totalMinutes: number): string {
  if (totalMinutes <= 0) return '-';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Desenha o cabeçalho padrão Terra com logo real.
 * Retorna o Y onde o conteúdo deve começar.
 */
function drawHeader(doc: jsPDF, dateStr: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  const margin = 30;

  // Logo real da Terra (imagem PNG base64)
  // Aspecto original: 800x425 → proporção ~1.88:1
  const logoW = 100;
  const logoH = logoW / 1.88; // ~53pt
  const logoX = margin;
  const logoY = 12;
  doc.addImage(TERRA_LOGO_BASE64, 'PNG', logoX, logoY, logoW, logoH);

  // Nome empresa à direita do logo (centralizado verticalmente)
  const textX = logoX + logoW + ((pageWidth - margin - logoX - logoW) / 2);
  doc.setTextColor(...BLACK);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, textX, logoY + 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_CNPJ, textX, logoY + 26, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(COMPANY_FULL, textX, logoY + 35, { align: 'center' });

  // Linha separadora verde após logo
  const lineY = logoY + logoH + 5;
  doc.setDrawColor(...TERRA_GREEN);
  doc.setLineWidth(1.2);
  doc.line(margin, lineY, pageWidth - margin, lineY);

  // Data
  const dateY = lineY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('Data', centerX - 45, dateY + 8);

  // Campo data com fundo amarelo
  doc.setFillColor(...YELLOW_BG);
  doc.rect(centerX - 10, dateY, 80, 13, 'F');
  doc.setDrawColor(0);
  doc.rect(centerX - 10, dateY, 80, 13, 'S');
  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.text(dateStr, centerX + 30, dateY + 9, { align: 'center' });

  // Retorna Y onde o conteúdo pode começar
  return dateY + 20;
}

function drawFooterContact(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Linha pontilhada
  doc.setDrawColor(0, 0, 0);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(30, pageHeight - 50, pageWidth - 30, pageHeight - 50);
  doc.setLineDashPattern([], 0);

  // Contato
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(CONTACT_LINE, centerX, pageHeight - 42, { align: 'center' });

  // Linha pontilhada
  doc.setLineDashPattern([2, 2], 0);
  doc.line(30, pageHeight - 35, pageWidth - 30, pageHeight - 35);
  doc.setLineDashPattern([], 0);

  // Documento confidencial
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(CONFIDENTIAL, centerX, pageHeight - 25, { align: 'center' });
}

function drawFooterEmail(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  doc.setLineDashPattern([2, 2], 0);
  doc.line(30, pageHeight - 55, pageWidth - 30, pageHeight - 55);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(EMAIL_LINE, centerX, pageHeight - 45, { align: 'center' });
  doc.text('ou através do telefone (67) 9908-7268', centerX, pageHeight - 38, { align: 'center' });

  doc.setLineDashPattern([2, 2], 0);
  doc.line(30, pageHeight - 32, pageWidth - 30, pageHeight - 32);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(CONFIDENTIAL, centerX, pageHeight - 20, { align: 'center' });
}

function formatDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================================
// EXPORTAR MENSALIDADE PDF
// ============================================================

export function exportMensalidadePDF(billing: BungeBilling, items: BungeBillingItem[]) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  let curY = drawHeader(doc, formatDate());

  // Título "Fechamento"
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Fechamento', pageWidth / 2, curY, { align: 'center' });
  curY += 16;

  // Descrição
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const mesAno = formatMonthYear(billing.reference_month);
  doc.text(
    `Mensalidade dos equipamentos abaixo descritos na unidade da Bunge Alimentos S/A no mês de ${mesAno}.`,
    30, curY
  );
  curY += 14;

  // Tabela de itens
  const tableData = items.map(item => [
    item.equipment_description,
    formatCurrency(item.total_value),
  ]);

  // Linha total
  tableData.push(['Valor à faturar', formatCurrency(billing.total)]);

  autoTable(doc, {
    startY: curY,
    margin: { left: 30, right: 30 },
    head: [['Descrição', 'Valor Total (R$)']],
    body: tableData,
    headStyles: {
      fillColor: [...HEADER_BG],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [...BLACK],
      cellPadding: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 120 },
    },
    didParseCell: (data: any) => {
      // Label "BAL" na primeira coluna da primeira linha body
      if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) {
        // Nada especial
      }
      // Última linha (total) em negrito
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    alternateRowStyles: {
      fillColor: [...LIGHT_GRAY],
    },
  });

  drawFooterContact(doc);

  // Salvar
  const filename = `Transportadora e Terraplanagem Terra (Mensalidade-${billing.reference_month.replace('-', '-')}).pdf`;
  doc.save(filename);
  return filename;
}

// ============================================================
// EXPORTAR HE PDF
// ============================================================

export function exportHEPDF(billing: BungeBilling, items: BungeBillingItem[], heCalc?: HECalcResult) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  let curY = drawHeader(doc, formatDate());

  // Descrição
  const mesAno = formatMonthYear(billing.reference_month);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Calculos de hora extra referentes ao mês de ${mesAno}.`, 30, curY);
  curY += 16;

  // Tabela resumo HE
  const heItem = items[0];
  const tableData = [
    [
      heItem?.equipment_description || 'L-60F (Farelo)',
      heItem?.he_total_hours_display || '00:00',
      formatCurrency(heItem?.total_value || 0),
    ],
  ];

  autoTable(doc, {
    startY: curY,
    margin: { left: 30, right: 30 },
    head: [['Equipamento', 'Hora extra', 'Valor H.E.(R$)']],
    body: tableData,
    headStyles: {
      fillColor: [...HEADER_BG],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [...BLACK],
      cellPadding: 8,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'right' },
    },
  });

  // Linha total
  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  autoTable(doc, {
    startY: finalY,
    margin: { left: 30, right: 30 },
    body: [['Total a receber(R$)', formatCurrency(billing.total)]],
    showHead: false,
    bodyStyles: {
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [...BLACK],
      cellPadding: 8,
    },
    columnStyles: {
      0: { halign: 'right' },
      1: { halign: 'right', cellWidth: 120 },
    },
    tableLineColor: [...TERRA_GREEN],
    tableLineWidth: 1,
  });

  drawFooterEmail(doc);

  // ---- Página 2: Detalhamento diário ----
  const heDetails = heItem?.he_details as HEDayDetail[] | null;
  if (heDetails && heDetails.length > 0) {
    doc.addPage();
    const p2Y = drawHeader(doc, formatDate());

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Detalhamento diário - HE Farelo - ${mesAno}`, 30, p2Y);

    // Colunas: Data | Dia | Entr. Op1 | Saída Op2 | Iníc. Máq | Fim Máq | Hrs Máq | HE
    // (S.Op1 e E.Op2 removidos — só interessa entrada do 1º e saída do 2º)
    const detailData = heDetails
      .filter(d => d.machine_minutes > 0)
      .map(d => [
        d.date.split('-').reverse().join('/'),
        d.dayOfWeek + (d.isHoliday ? ' *' : ''),
        fmtTime(d.op1_entry),
        fmtTime(d.op2_exit),
        fmtTime(d.machine_start),
        fmtTime(d.machine_end),
        fmtHM(d.machine_minutes),
        d.overtime_minutes > 0 ? fmtHM(d.overtime_minutes) : '-',
      ]);

    // Identificar linhas de feriado para colorir
    const holidayRowIndexes = new Set<number>();
    heDetails.filter(d => d.machine_minutes > 0).forEach((d, i) => {
      if (d.isHoliday) holidayRowIndexes.add(i);
    });

    // A4 portrait = 595pt width, margins 30+30 = 60pt, available ~535pt
    const availW = doc.internal.pageSize.getWidth() - 60; // 30 each side
    autoTable(doc, {
      startY: p2Y + 12,
      margin: { left: 30, right: 30 },
      tableWidth: availW,
      head: [['Data', 'Dia', 'Entr. Op1', 'Saída Op2', 'Iníc. Máq', 'Fim Máq', 'Hrs Máq', 'HE']],
      body: detailData,
      headStyles: {
        fillColor: [...HEADER_BG],
        textColor: [...WHITE],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [...BLACK],
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: availW * 0.14, halign: 'center' },  // Data
        1: { cellWidth: availW * 0.07, halign: 'center' },  // Dia
        2: { cellWidth: availW * 0.12, halign: 'center' },  // Entr. Op1
        3: { cellWidth: availW * 0.12, halign: 'center' },  // Saída Op2
        4: { cellWidth: availW * 0.12, halign: 'center' },  // Iníc. Máq
        5: { cellWidth: availW * 0.12, halign: 'center' },  // Fim Máq
        6: { cellWidth: availW * 0.16, halign: 'center', fontStyle: 'bold' }, // Hrs Máq
        7: { cellWidth: availW * 0.15, halign: 'center', fontStyle: 'bold' }, // HE
      },
      alternateRowStyles: {
        fillColor: [...LIGHT_GRAY],
      },
      didParseCell: (data: any) => {
        // Destacar linhas de feriado com fundo avermelhado
        if (data.section === 'body' && holidayRowIndexes.has(data.row.index)) {
          data.cell.styles.fillColor = [255, 235, 235];
          data.cell.styles.fontStyle = 'bold';
        }
        // HE column em destaque quando > 0
        if (data.section === 'body' && data.column.index === 7 && data.cell.raw !== '-') {
          data.cell.styles.textColor = [200, 50, 50];
        }
      },
    });

    // Totais no rodapé da tabela
    const finalY2 = (doc as any).lastAutoTable?.finalY || 400;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const totalHE = heCalc?.totalOvertimeHours || heItem?.he_total_hours_display || '00:00';
    doc.text(`Total HE: ${totalHE}  |  Valor/hora: ${formatCurrency(heCalc?.ratePerHour || 165)}  |  Total: ${formatCurrency(billing.total)}`, 30, finalY2 + 15);

    // Legenda feriados (se houver)
    if (holidayRowIndexes.size > 0) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text('* Feriado/Domingo — todas as horas trabalhadas contam como hora extra', 30, finalY2 + 28);
    }

    drawFooterContact(doc);
  }

  const filename = `Transportadora e Terraplanagem Terra LTDA(HE FARELO ${billing.reference_month.split('-')[1]}-${billing.reference_month.split('-')[0]}).pdf`;
  doc.save(filename);
  return filename;
}

// ============================================================
// EXPORTAR LOCAÇÃO PDF
// ============================================================

export function exportLocacaoPDF(billing: BungeBilling, items: BungeBillingItem[]) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  let curY = drawHeader(doc, formatDate());

  // Título
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Fechamento', pageWidth / 2, curY, { align: 'center' });
  curY += 16;

  const mesAno = formatMonthYear(billing.reference_month);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fechamento referente a locação dos equipamentos abaixo descritos para Bunge em ${mesAno}.`, 30, curY);
  curY += 14;

  // Tabela de itens
  const tableData = items.map(item => [
    item.equipment_description,
    `${item.quantity}`,
    item.unit_label,
    formatCurrency(item.unit_value),
    formatCurrency(item.total_value),
  ]);

  // Linha total
  tableData.push(['', '', '', 'Total a faturar', formatCurrency(billing.total)]);

  autoTable(doc, {
    startY: curY,
    margin: { left: 30, right: 30 },
    head: [['Equipamento', 'Qtd', 'Unidade', 'Valor Unit.', 'Valor Total (R$)']],
    body: tableData,
    headStyles: {
      fillColor: [...HEADER_BG],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [...BLACK],
      cellPadding: 6,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 55 },
      3: { halign: 'right', cellWidth: 80 },
      4: { halign: 'right', cellWidth: 90 },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    alternateRowStyles: {
      fillColor: [...LIGHT_GRAY],
    },
  });

  drawFooterContact(doc);

  const filename = `Transportadora e Terraplanagem Terra (BAL-${billing.reference_month.split('-')[1]}-${billing.reference_month.split('-')[0].slice(-2)}).pdf`;
  doc.save(filename);
  return filename;
}

// ============================================================
// EXPORTAR FECHAMENTO GERAL (resumo consolidado)
// ============================================================

export function exportFechamentoGeralPDF(
  refMonth: string,
  mensalidade: { billing: BungeBilling; items: BungeBillingItem[] } | null,
  he: { billing: BungeBilling; items: BungeBillingItem[] } | null,
  locacao: { billing: BungeBilling; items: BungeBillingItem[] } | null,
) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  let curY = drawHeader(doc, formatDate());

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Fechamento', pageWidth / 2, curY, { align: 'center' });
  curY += 16;

  const mesAno = formatMonthYear(refMonth);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fechamento referente a locação dos equipamentos abaixo descritos para Bunge em ${mesAno}.`, 30, curY);
  curY += 14;

  // Montar linhas do resumo
  const rows: string[][] = [];

  if (mensalidade) {
    rows.push([
      'Mensalidade',
      formatCurrency(mensalidade.billing.total),
      'R$0,00',
      formatCurrency(mensalidade.billing.total),
    ]);
  }

  if (locacao) {
    // Agrupar itens de locação por categoria
    for (const item of locacao.items) {
      rows.push([
        item.equipment_description,
        formatCurrency(item.total_value),
        formatCurrency(item.total_value * 0.25), // Nota de Serviço (estimativa 25%)
        formatCurrency(item.total_value * 0.75), // Nota de Locação (estimativa 75%)
      ]);
    }
  }

  if (he) {
    rows.push([
      'HE Farelo',
      formatCurrency(he.billing.total),
      formatCurrency(he.billing.total),
      'R$0,00',
    ]);
  }

  autoTable(doc, {
    startY: curY,
    margin: { left: 30, right: 30 },
    head: [['Equipamento', 'Total', 'Nota de Serviço', 'Nota de Locação']],
    body: rows,
    headStyles: {
      fillColor: [...HEADER_BG],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [...BLACK],
      cellPadding: 6,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [...LIGHT_GRAY],
    },
  });

  drawFooterContact(doc);

  const filename = `Transportadora e Terraplanagem Terra (BAL-${refMonth.split('-')[1]}-${refMonth.split('-')[0].slice(-2)}).pdf`;
  doc.save(filename);
  return filename;
}

// ============================================================
// EXPORTAR XLS (compatibilidade)
// ============================================================

export async function exportBillingXLS(billing: BungeBilling, items: BungeBillingItem[]) {
  // Importar xlsx dinamicamente
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const mesAno = formatMonthYear(billing.reference_month);
  const header = [
    [COMPANY_NAME],
    [COMPANY_CNPJ],
    [''],
    [`Faturamento: ${billing.billing_type} - ${mesAno}`],
    [`Número: ${billing.billing_number}`],
    [`Status: ${billing.status}`],
    [''],
  ];

  let tableData: any[][];

  if (billing.billing_type === 'HE') {
    tableData = [
      ['Equipamento', 'Hora Extra', 'Valor H.E. (R$)'],
      ...items.map(i => [
        i.equipment_description,
        i.he_total_hours_display || '-',
        i.total_value,
      ]),
      ['', 'Total a receber (R$)', billing.total],
    ];
  } else if (billing.billing_type === 'LOCACAO') {
    tableData = [
      ['Equipamento', 'Qtd', 'Unidade', 'Valor Unit.', 'Valor Total (R$)'],
      ...items.map(i => [
        i.equipment_description,
        i.quantity,
        i.unit_label,
        i.unit_value,
        i.total_value,
      ]),
      ['', '', '', 'Total', billing.total],
    ];
  } else {
    // MENSALIDADE
    tableData = [
      ['Descrição', 'Valor Total (R$)'],
      ...items.map(i => [i.equipment_description, i.total_value]),
      ['Valor à faturar', billing.total],
    ];
  }

  const wsData = [...header, ...tableData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajustar larguras
  ws['!cols'] = [
    { wch: 60 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, billing.billing_type);

  // Se HE, adicionar aba de detalhamento
  if (billing.billing_type === 'HE' && items[0]?.he_details) {
    const details = items[0].he_details as HEDayDetail[];
    const detailHeader = [
      [`Detalhamento HE Farelo - ${mesAno}`],
      [''],
      ['Data', 'Dia', 'Entr. Op1', 'Saída Op2', 'Iníc. Máq', 'Fim Máq', 'Hrs Máq', 'HE'],
    ];
    const detailRows = details
      .filter(d => d.machine_minutes > 0)
      .map(d => [
        d.date.split('-').reverse().join('/'),
        d.dayOfWeek + (d.isHoliday ? ' *' : ''),
        fmtTime(d.op1_entry),
        fmtTime(d.op2_exit),
        fmtTime(d.machine_start),
        fmtTime(d.machine_end),
        fmtHM(d.machine_minutes),
        d.overtime_minutes > 0 ? fmtHM(d.overtime_minutes) : '-',
      ]);

    const detailData = [...detailHeader, ...detailRows];
    const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
    wsDetail['!cols'] = Array(8).fill({ wch: 14 });
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalhamento');
  }

  const filename = `${billing.billing_number}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}
