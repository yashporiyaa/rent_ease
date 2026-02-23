import PDFDocument from 'pdfkit';
import { getStatusStyles } from '../../../common/utils/status-color.util.js';

export function generateClassicTemplate(doc: PDFDocument, data: any) {
  const margin = 50;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;
  const innerPadding = 30;
  const innerWidth = contentWidth - innerPadding * 2;
  const innerRight = pageWidth - margin - innerPadding;

  /* ---------------- CARD BACKGROUND ---------------- */
  doc
    .roundedRect(margin, margin, contentWidth, doc.page.height - margin * 2, 10)
    .fillAndStroke('#f8fafc', '#e2e8f0');

  doc.fillColor('#1e293b');

  const innerX = margin + innerPadding;
  let y = margin + 30;

  /* ---------------- HEADER ---------------- */
  doc.fontSize(16).font('Helvetica-Bold').text('RENT-EASE', innerX, y);

  const rightColWidth = 220;
  const rightColX = innerRight - rightColWidth;

  doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', rightColX, y, {
    width: rightColWidth,
    align: 'right',
  });

  y += 30;

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(`INVOICE NUMBER`, innerX, y);

  doc
    .fontSize(12)
    .fillColor('#1e293b')
    .text(data.invoiceNo, innerX, y + 15);

  doc
    .fontSize(10)
    .fillColor('#64748b')
    .text(`ISSUE DATE`, rightColX, y + 15, {
      width: rightColWidth,
      align: 'right',
    });

  doc
    .fontSize(11)
    .fillColor('#1e293b')
    .text(data.issueDate.toDateString(), rightColX, y + 30, {
      width: rightColWidth,
      align: 'right',
    });

  /* STATUS BADGE */
  const { bg, text } = getStatusStyles(data.status);
  const statusText = String(data.status ?? '');
  const badgeFontSize = 9;
  const badgeHeight = 20;
  const badgePaddingX = 10;

  doc.font('Helvetica-Bold').fontSize(badgeFontSize);
  const badgeWidth = Math.max(
    60,
    doc.widthOfString(statusText) + badgePaddingX * 2,
  );
  const badgeX = innerRight - badgeWidth;
  const badgeY = y - 10;

  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 10).fill(bg);

  doc
    .fillColor(text)
    .font('Helvetica-Bold')
    .fontSize(badgeFontSize)
    .text(statusText, badgeX, badgeY + 6, {
      width: badgeWidth,
      align: 'center',
      lineBreak: false,
    });

  y += 70;

  /* ---------------- BILL TO + RENTAL ---------------- */

  doc.fillColor('#1e293b');

  doc.font('Helvetica-Bold').fontSize(10).text('BILL TO', innerX, y);

  doc
    .font('Helvetica')
    .fontSize(11)
    .text(data.customer.name, innerX, y + 15);

  if (data.customer.phone) {
    doc.text(data.customer.phone, innerX, y + 30);
  }

  const rightSectionX = rightColX;

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('RENTAL PERIOD', rightSectionX, y);

  doc
    .font('Helvetica')
    .fontSize(11)
    .text(
      `${data.rentalPeriod.start.toDateString()} - ${data.rentalPeriod.end.toDateString()}`,
      rightSectionX,
      y + 15,
    );

  y += 80;

  /* ---------------- TABLE HEADER ---------------- */

  const tableX = innerX;
  const qtyX = tableX + innerWidth * 0.6;
  const priceX = tableX + innerWidth * 0.76;
  const totalX = tableX + innerWidth * 0.9;

  doc
    .fillColor('#94a3b8')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('ITEM DESCRIPTION', tableX, y);

  doc.text('QTY', qtyX, y);
  doc.text('UNIT PRICE', priceX, y);
  doc.text('AMOUNT', totalX, y);

  y += 20;

  doc.moveTo(tableX, y).lineTo(innerRight, y).strokeColor('#e2e8f0').stroke();

  y += 15;

  /* ---------------- TABLE ROWS ---------------- */

  doc.fontSize(11).font('Helvetica').fillColor('#1e293b');

  data.items.forEach((item: any) => {
    doc.text(item.name, tableX, y);
    doc.text(item.quantity.toString(), qtyX, y);
    doc.text(`Rs. ${item.unitPrice}`, priceX, y);
    doc.text(`Rs. ${item.total}`, totalX, y);

    y += 30;
  });

  y += 20;

  /* ---------------- TOTAL SECTION ---------------- */

  const totalsWidth = 220;
  const totalsX = innerRight - totalsWidth;
  const amountX = totalsX + 120;
  const amountWidth = totalsWidth - 120;
  const amountPaid = Number(data?.totals?.amountPaid ?? 0);
  const outstanding = Number(
    data?.totals?.outstanding ?? data.totals.grandTotal - amountPaid,
  );

  doc.fillColor('#64748b').fontSize(10);

  doc.text('Subtotal', totalsX, y);
  doc.text(`Rs. ${data.totals.subtotal}`, amountX, y, {
    width: amountWidth,
    align: 'right',
  });

  y += 20;

  doc.text(`Tax (${data.totals.taxRate}%)`, totalsX, y);
  doc.text(`Rs. ${data.totals.tax}`, amountX, y, {
    width: amountWidth,
    align: 'right',
  });

  if (amountPaid > 0) {
    y += 20;
    doc.text('Paid', totalsX, y);
    doc.text(`Rs. ${amountPaid}`, amountX, y, {
      width: amountWidth,
      align: 'right',
    });
  }

  y += 20;

  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(11);
  doc.text('Grand Total', totalsX, y);
  doc.text(`Rs. ${Number(data.totals.grandTotal)}`, amountX, y, {
    width: amountWidth,
    align: 'right',
  });
  doc.fillColor('#64748b').font('Helvetica').fontSize(10);

  y += 16;

  const outstandingBoxX = totalsX;
  const outstandingBoxY = y;
  const outstandingBoxHeight = 36;
  const outstandingBoxPaddingX = 12;
  const outstandingText = `Rs. ${outstanding}`;

  doc
    .roundedRect(outstandingBoxX, outstandingBoxY, totalsWidth, outstandingBoxHeight, 10)
    .fill(bg);

  const outstandingLabelFontSize = 12;
  const outstandingAmountFontSize = 12;

  doc.fillColor(text).font('Helvetica-Bold').fontSize(outstandingAmountFontSize);
  const outstandingTextWidth = doc.widthOfString(outstandingText);
  const outstandingTextX =
    outstandingBoxX + totalsWidth - outstandingBoxPaddingX - outstandingTextWidth;
  const outstandingTextY =
    outstandingBoxY + (outstandingBoxHeight - outstandingAmountFontSize) / 2 - 1;
  const outstandingLabelX = outstandingBoxX + outstandingBoxPaddingX;
  const outstandingLabelWidth = Math.max(
    0,
    outstandingTextX - outstandingLabelX - 8,
  );

  doc.fontSize(outstandingLabelFontSize);
  doc.text('OUTSTANDING', outstandingLabelX - 35, outstandingTextY + 2, {
    width: outstandingLabelWidth,
    align: 'center',
    lineBreak: false,
  });
  doc.fontSize(outstandingAmountFontSize);
  doc.text(outstandingText, outstandingTextX, outstandingTextY + 2, {
    lineBreak: false,
    align: 'center',
  });

  y += outstandingBoxHeight + 12;

  /* ---------------- FOOTER ---------------- */

  const footerY = y + 10;
  const footerWidth = innerWidth;

  doc
    .fillColor('#94a3b8')
    .fontSize(9)
    .font('Helvetica')
    .text('Thank you for your business.', innerX, footerY, {
      width: footerWidth,
      align: 'right',
      lineBreak: false,
    });
}
