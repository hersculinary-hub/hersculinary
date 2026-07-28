// lib/pdfInvoice.js
// Generates and downloads a PDF invoice entirely in the browser.
// Dynamically imports jsPDF so this file is safe to import from a
// server-rendered client component without breaking SSR.

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export async function generateInvoicePdf(invoice) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(196, 30, 30);
  doc.text('HerS Culinary', marginX, y);

  doc.setFontSize(10);
  doc.setTextColor(90, 60, 40);
  doc.setFont('helvetica', 'normal');
  y += 16;
  doc.text('Frozen Food & Kopi Pilihan', marginX, y);

  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 555 - marginX - 90, 50, { align: 'left' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Invoice : ${invoice.invoiceNumber}`, 555 - marginX - 150, 70);
  doc.text(`Tanggal     : ${new Date(invoice.createdAt).toLocaleString('id-ID')}`, 555 - marginX - 150, 84);

  y += 30;
  doc.setDrawColor(230, 200, 160);
  doc.line(marginX, y, 555 - marginX, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.text('Pelanggan', marginX, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName || 'Pelanggan Umum', marginX, y);
  if (invoice.customerPhone) {
    y += 14;
    doc.text(invoice.customerPhone, marginX, y);
  }

  y += 24;

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
    styles: { font: 'helvetica', fontSize: 10, textColor: [59, 36, 23] },
    headStyles: { fillColor: [196, 30, 30], textColor: 255 },
    alternateRowStyles: { fillColor: [255, 248, 234] }
  });

  let finalY = doc.lastAutoTable.finalY + 20;

  const summaryX = 555 - marginX - 200;
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', summaryX, finalY);
  doc.text(formatIDR(invoice.subtotal), 555 - marginX, finalY, { align: 'right' });

  if (invoice.discount) {
    finalY += 16;
    doc.text('Diskon', summaryX, finalY);
    doc.text(`- ${formatIDR(invoice.discount)}`, 555 - marginX, finalY, { align: 'right' });
  }

  finalY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(196, 30, 30);
  doc.text('TOTAL', summaryX, finalY);
  doc.text(formatIDR(invoice.total), 555 - marginX, finalY, { align: 'right' });

  finalY += 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 60, 40);
  doc.text(`Metode pembayaran: ${invoice.paymentMethod}`, marginX, finalY);
  if (invoice.cashierName) {
    finalY += 14;
    doc.text(`Kasir: ${invoice.cashierName}`, marginX, finalY);
  }

  finalY += 30;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(140, 110, 90);
  doc.text('Terima kasih telah berbelanja di HerS Culinary!', marginX, finalY);

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
