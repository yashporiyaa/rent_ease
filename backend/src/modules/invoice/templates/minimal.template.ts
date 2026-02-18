import PDFDocument from 'pdfkit';

export function generateMinimalTemplate(doc: PDFDocument, data: any) {
  const margin = 60;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;

  doc.lineWidth(1);

  /* ---------------- OUTER BORDER ---------------- */
  doc
    .rect(margin / 2, margin / 2, pageWidth - margin, doc.page.height - margin)
    .stroke();

  /* ---------------- HEADER ---------------- */
  doc.fontSize(20).font('Helvetica-Bold').text('RENT-EASE', margin, margin);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Official Rental Invoice', margin, margin + 25);

  // Right side
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`STATUS: ${data.status}`, pageWidth - 200, margin);

  doc
    .fontSize(12)
    .font('Helvetica')
    .text(`Invoice No: ${data.invoiceNo}`, pageWidth - 220, margin + 20);

  doc.text(
    `Issue Date: ${data.issueDate.toDateString()}`,
    pageWidth - 220,
    margin + 40,
  );

  doc
    .moveTo(margin, margin + 70)
    .lineTo(pageWidth - margin, margin + 70)
    .stroke();

  /* ---------------- BILL + RENTAL PERIOD ---------------- */

  const sectionTop = margin + 100;

  doc.font('Helvetica-Bold').fontSize(10).text('BILL TO', margin, sectionTop);

  doc
    .font('Helvetica')
    .fontSize(12)
    .text(data.customer.name, margin, sectionTop + 20);

  if (data.customer.phone) {
    doc
      .fontSize(10)
      .text(`Phone: ${data.customer.phone}`, margin, sectionTop + 40);
  }

  const rightX = pageWidth - 220;

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('RENTAL PERIOD', rightX, sectionTop);

  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      `${data.rentalPeriod.start.toDateString()} - ${data.rentalPeriod.end.toDateString()}`,
      rightX,
      sectionTop + 20,
    );

  /* ---------------- TABLE ---------------- */

  const tableTop = sectionTop + 90;

  const itemX = margin;
  const qtyX = margin + contentWidth * 0.55;
  const unitX = margin + contentWidth * 0.7;
  const totalX = margin + contentWidth * 0.85;

  // Header
  doc.font('Helvetica-Bold').fontSize(10);

  doc.text('ITEM DESCRIPTION', itemX, tableTop);
  doc.text('QTY', qtyX, tableTop, { width: 40, align: 'right' });
  doc.text('UNIT PRICE', unitX, tableTop, { width: 70, align: 'right' });
  doc.text('TOTAL', totalX, tableTop, { width: 70, align: 'right' });

  doc
    .moveTo(margin, tableTop + 15)
    .lineTo(pageWidth - margin, tableTop + 15)
    .stroke();

  let rowY = tableTop + 30;

  doc.font('Helvetica').fontSize(11);

  data.items.forEach((item: any) => {
    doc.text(item.name, itemX, rowY);
    doc.text(item.quantity.toString(), qtyX, rowY, {
      width: 40,
      align: 'right',
    });
    doc.text(`Rs. ${item.unitPrice}`, unitX, rowY, {
      width: 70,
      align: 'right',
    });
    doc.text(`Rs. ${item.total}`, totalX, rowY, {
      width: 70,
      align: 'right',
    });

    rowY += 25;
  });

  /* ---------------- TOTALS ---------------- */

  const totalsTop = rowY + 40;

  doc
    .moveTo(unitX, totalsTop - 10)
    .lineTo(pageWidth - margin, totalsTop - 10)
    .stroke();

  doc.font('Helvetica').fontSize(11);

  doc.text(`Subtotal:`, unitX, totalsTop);
  doc.text(`Rs. ${data.totals.subtotal}`, totalX, totalsTop, {
    width: 70,
    align: 'right',
  });

  doc.text(`Tax (${data.totals.taxRate}%):`, unitX, totalsTop + 20);

  doc.text(`Rs. ${data.totals.tax}`, totalX, totalsTop + 20, {
    width: 70,
    align: 'right',
  });

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('GRAND TOTAL:', unitX, totalsTop + 50);

  doc.text(`Rs. ${data.totals.grandTotal}`, totalX, totalsTop + 50, {
    width: 70,
    align: 'right',
  });

  doc
    .moveTo(unitX, totalsTop + 70)
    .lineTo(pageWidth - margin, totalsTop + 70)
    .stroke();

  /* ---------------- FOOTER ---------------- */

  doc.moveDown(5);

  doc
    .font('Helvetica-Oblique')
    .fontSize(10)
    .text('Thank you for your business.', {
      align: 'center',
    });
}
