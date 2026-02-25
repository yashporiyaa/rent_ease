import PDFDocument from 'pdfkit';
import { getStatusStyles } from '../../../common/utils/status-color.util.js';
import { ClassicInvoicePdfData } from 'src/interfaces/invoice.interface.js';

export function generateClassicTemplate(doc: PDFDocument, data: ClassicInvoicePdfData) {
  const formatDateTime = (value: Date) =>
    new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

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
  const companyName = data?.company?.name || 'RENT-EASE';
  const companyLogoDataUrl = data?.company?.logo;
  const headerTopY = y;
  const logoSize = 42;
  const logoY = headerTopY - 5;
  let titleX = innerX;
  let leftHeaderBottomY = headerTopY;

  if (
    typeof companyLogoDataUrl === 'string' &&
    companyLogoDataUrl.startsWith('data:image/')
  ) {
    const base64 = companyLogoDataUrl.split(',')[1];
    if (base64) {
      try {
        const logoBuffer = Buffer.from(base64, 'base64');
        doc.image(logoBuffer, innerX, logoY, {
          fit: [logoSize, logoSize],
          align: 'left',
          valign: 'center',
        });
        titleX = innerX + 50;
        leftHeaderBottomY = Math.max(leftHeaderBottomY, logoY + logoSize);
      } catch {
        titleX = innerX;
      }
    }
  }

  const companyNameY = headerTopY + 8;
  doc.fontSize(16).font('Helvetica-Bold').text(companyName, titleX, companyNameY, {
    width: innerWidth - (titleX - innerX) - 240,
    lineBreak: false,
  });
  const companyNameHeight = doc.heightOfString(companyName, {
    width: innerWidth - (titleX - innerX) - 240,
    lineBreak: false,
  });
  leftHeaderBottomY = Math.max(leftHeaderBottomY, companyNameY + companyNameHeight);

  const rightColWidth = 220;
  const rightColX = innerRight - rightColWidth;

  doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', rightColX, y, {
    width: rightColWidth,
    align: 'right',
  });

  y = leftHeaderBottomY + 18;

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

  const rentalPeriodWidth = rightColWidth;
  doc
    .font('Helvetica')
    .fontSize(11)
    .text(
      `From: ${formatDateTime(data.rentalPeriod.start)}`,
      rightSectionX,
      y + 15,
      {
        width: rentalPeriodWidth,
      },
    )
    .text(
      `To: ${formatDateTime(data.rentalPeriod.end)}`,
      rightSectionX,
      y + 32,
      {
        width: rentalPeriodWidth,
      },
    );

  y += 92;

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

  data.items.forEach((item) => {
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
  const advance = Number(data?.totals?.advance ?? 0);
  const deposit = Number(data?.totals?.deposit ?? 0);
  const outstanding = Number(
    data?.totals?.outstanding ?? data.totals.grandTotal - advance - deposit,
  );

  doc.fillColor('#64748b').fontSize(10);

  doc.text('Subtotal', totalsX, y);
  doc.text(`Rs. ${data.totals.subtotal}`, amountX, y, {
    width: amountWidth,
    align: 'right',
  });

  const discount = Number(data?.totals?.discount ?? 0);
  if (discount > 0) {
    y += 20;
    doc.text('Discount', totalsX, y);
    doc.text(`Rs. ${discount}`, amountX, y, {
      width: amountWidth,
      align: 'right',
    });
  }

  y += 20;

  doc.text(`Tax (${data.totals.taxRate}%)`, totalsX, y);
  doc.text(`Rs. ${data.totals.tax}`, amountX, y, {
    width: amountWidth,
    align: 'right',
  });

  if (advance > 0) {
    y += 20;
    doc.text('Advance', totalsX, y);
    doc.text(`Rs. ${advance}`, amountX, y, {
      width: amountWidth,
      align: 'right',
    });
  }

  if (deposit > 0) {
    y += 20;
    doc.text('Deposit', totalsX, y);
    doc.text(`Rs. ${deposit}`, amountX, y, {
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
    .text(
      data?.company?.email || data?.company?.phone
        ? `Thank you for your business. ${data?.company?.email ? `| ${data.company.email}` : ''} ${data?.company?.phone ? `| ${data.company.phone}` : ''}`.trim()
        : 'Thank you for your business.',
      innerX,
      footerY,
      {
      width: footerWidth,
      align: 'right',
      lineBreak: false,
      },
    );
}
