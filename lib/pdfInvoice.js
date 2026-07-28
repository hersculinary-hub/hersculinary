// lib/pdfInvoice.js
// Generates and downloads a PDF invoice entirely in the browser.
// Dynamically imports jsPDF so this file is safe to import from a
// server-rendered client component without breaking SSR.

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

// Brand palette
const BRAND_RED = [196, 30, 30];
const BRAND_RED_DARK = [140, 18, 18];
const BRAND_GOLD = [230, 200, 160];
const BRAND_CREAM = [255, 248, 234];
const BRAND_BROWN = [90, 60, 40];
const BRAND_BROWN_DARK = [59, 36, 23];
const WHITE = [255, 255, 255];

export async function generateInvoicePdf(invoice) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const contentRight = pageWidth - marginX;

  // ---------- HEADER BAND ----------
  const headerHeight = 90;
  doc.setFillColor(...BRAND_RED);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  // subtle darker strip at the very bottom of the band for depth
  doc.setFillColor(...BRAND_RED_DARK);
  doc.rect(0, headerHeight - 4, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text('HerS Culinary', marginX, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Frozen Food & Kopi Pilihan', marginX, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE', contentRight, 42, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, contentRight, 60, { align: 'right' });

  let y = headerHeight + 36;

  // ---------- INFO CARDS (two columns) ----------
  const cardWidth = (contentRight - marginX - 16) / 2;
  const cardHeight = 78;
  const cardY = y;

  // Left card: Pelanggan
  doc.setFillColor(...BRAND_CREAM);
  doc.setDrawColor(...BRAND_GOLD);
  doc.roundedRect(marginX, cardY, cardWidth, cardHeight, 6, 6, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_RED);
  doc.text('PELANGGAN', marginX + 14, cardY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_BROWN_DARK);
  doc.text(invoice.customerName || 'Pelanggan Umum', marginX + 14, cardY + 40);
  if (invoice.customerPhone) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND_BROWN);
    doc.text(invoice.customerPhone, marginX + 14, cardY + 56);
  }

  // Right card: Detail Invoice
  const rightCardX = marginX + cardWidth + 16;
  doc.setFillColor(...BRAND_CREAM);
  doc.setDrawColor(...BRAND_GOLD);
  doc.roundedRect(rightCardX, cardY, cardWidth, cardHeight, 6, 6, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_RED);
  doc.text('DETAIL INVOICE', rightCardX + 14, cardY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_BROWN_DARK);
  doc.text(`Tanggal : ${new Date(invoice.createdAt).toLocaleString('id-ID')}`, rightCardX + 14, cardY + 40);
  doc.text(`Bayar   : ${invoice.paymentMethod}`, rightCardX + 14, cardY + 56);
  if (invoice.cashierName) {
    doc.text(`Kasir   : ${invoice.cashierName}`, rightCardX + 14, cardY + 72);
  }

  y = cardY + cardHeight + 30;

  // ---------- ITEMS TABLE ----------
  const rows = invoice.items.map((item) => [
    item.productName,
    String(item.qty),
    formatIDR(item.price),
    formatIDR(item.price * item.qty)
  ]);

  doc.autoTable({
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['Produk', 'Qty', 'Harga', 'Subtotal']],
    body: rows,
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: BRAND_BROWN_DARK,
      cellPadding: { top: 8, bottom: 8, left: 10, right: 10 }
    },
    headStyles: {
      fillColor: BRAND_RED,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    alternateRowStyles: { fillColor: BRAND_CREAM },
    theme: 'grid',
    tableLineColor: BRAND_GOLD,
    tableLineWidth: 0.5
  });

  let finalY = doc.lastAutoTable.finalY + 24;

  // ---------- TOTAL BOX ----------
  const boxWidth = 230;
  const boxX = contentRight - boxWidth;
  const lineHeight = 18;
  let boxLines = 1; // subtotal always shown
  if (invoice.discount) boxLines += 1;
  const boxHeight = boxLines * lineHeight + 46;

  doc.setFillColor(...BRAND_CREAM);
  doc.setDrawColor(...BRAND_GOLD);
  doc.roundedRect(boxX, finalY, boxWidth, boxHeight, 6, 6, 'FD');

  let rowY = finalY + 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_BROWN_DARK);
  doc.text('Subtotal', boxX + 16, rowY);
  doc.text(formatIDR(invoice.subtotal), boxX + boxWidth - 16, rowY, { align: 'right' });

  if (invoice.discount) {
    rowY += lineHeight;
    doc.text('Diskon', boxX + 16, rowY);
    doc.text(`- ${formatIDR(invoice.discount)}`, boxX + boxWidth - 16, rowY, { align: 'right' });
  }

  rowY += lineHeight + 6;
  doc.setDrawColor(...BRAND_GOLD);
  doc.line(boxX + 16, rowY - 12, boxX + boxWidth - 16, rowY - 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_RED);
  doc.text('TOTAL', boxX + 16, rowY + 8);
  doc.text(formatIDR(invoice.total), boxX + boxWidth - 16, rowY + 8, { align: 'right' });

  finalY = finalY + boxHeight + 40;

  // ---------- FOOTER ----------
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = Math.max(finalY, pageHeight - 80);

  doc.setDrawColor(...BRAND_GOLD);
  doc.line(marginX, footerY - 20, contentRight, footerY - 20);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_RED);
  doc.text('Terima kasih telah berbelanja di HerS Culinary!', marginX, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_BROWN);
  doc.text('Frozen Food & Kopi Pilihan  •  Dibuat dengan cinta untuk rasa terbaik', marginX, footerY + 14);

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
