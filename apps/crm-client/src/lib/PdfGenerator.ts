import jsPDF from 'jspdf';
import { Invoice } from '@monorepo/shared';
import { ClinicSettings } from './types';
import { AuditRepository } from '../data/repositories/AuditRepository';

export const PdfGenerator = {
  generateInvoice: async (invoice: Invoice, settings: ClinicSettings, logoUrl?: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- COLORES BRANDING (Premium Indigo) ---
    const primaryColor = [236, 72, 153]; // Pink-500
    const darkColor = [15, 23, 42]; // Slate 900
    const grayColor = [100, 116, 139]; // Slate 500
    const lightGray = [248, 250, 252]; // Slate 50

    // --- BACKGROUND ACCENT ---
    // Top Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // --- HEADER ---
    const headerY = 20;

    // LOGO (Left)
    if (logoUrl) {
      try {
        // Add Image
        // Simulating Circular Frame: Draw White Circle Mask over corners? Too complex.
        // Better: Draw a thin accent circle around it.
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.circle(27, headerY + 12, 13); // Circle frame CENTER at x=27, y=32, r=13
        // Clip? no easy clip. Just draw image inside.
        // We assume image is square.
        doc.addImage(logoUrl, 'JPEG', 16, headerY + 1, 22, 22);
      } catch (e) {
        console.error('Error adding logo PDF', e);
      }
    } else {
      // Fallback Icon
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.circle(27, headerY + 12, 12, 'F');
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('C', 24, headerY + 19);
    }

    // CLINIC INFO (Left, below Logo or next to it? Let's do header style)
    // Let's put Clinic Info on the RIGHT for standard Invoice feel
    doc.setFontSize(24);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', pageWidth - 15, headerY + 8, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(
      settings.billing?.legalName || settings.name || 'Mi Clínica',
      pageWidth - 15,
      headerY + 16,
      { align: 'right' },
    );

    doc.setFont('helvetica', 'normal');
    doc.text(settings.billing?.nif || settings.cif || '', pageWidth - 15, headerY + 21, {
      align: 'right',
    });
    doc.text(settings.billing?.address || settings.address || '', pageWidth - 15, headerY + 26, {
      align: 'right',
    });
    doc.text(settings.billing?.email || settings.email || '', pageWidth - 15, headerY + 31, {
      align: 'right',
    });

    // --- SEPARATOR ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, headerY + 40, pageWidth - 15, headerY + 40);

    // --- INVOICE META (Grid Layout) ---
    const metaY = headerY + 55;

    // BOX 1: CLIENTE (Left)
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(15, metaY, 80, 25, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURAR A:', 20, metaY + 6);

    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.patientName, 20, metaY + 13);

    // BOX 2: DETALLES (Right)
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(pageWidth - 95, metaY, 80, 25, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Nº FACTURA', pageWidth - 90, metaY + 6);
    doc.text('FECHA', pageWidth - 40, metaY + 6);

    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.number, pageWidth - 90, metaY + 13);
    doc.text(new Date(invoice.date).toLocaleDateString(), pageWidth - 40, metaY + 13);

    // --- ITEMS TABLE ---
    let currentY = metaY + 40;

    // Header
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(15, currentY, pageWidth - 30, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CONCEPTO / SERVICIO', 20, currentY + 5);
    doc.text('PRECIO', pageWidth - 50, currentY + 5, { align: 'right' });
    doc.text('TOTAL', pageWidth - 20, currentY + 5, { align: 'right' });

    currentY += 12;

    // Items logic...
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    invoice.items.forEach((item, index) => {
      const description = item.description;
      const splitDesc = doc.splitTextToSize(description, pageWidth - 100);

      // Alternating Row Background
      if (index % 2 === 1) {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(15, currentY - 4, pageWidth - 30, splitDesc.length * 5 + 4, 'F');
      }

      doc.text(splitDesc, 20, currentY);
      doc.text(`${item.unitPrice.toFixed(2)} €`, pageWidth - 50, currentY, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.total.toFixed(2)} €`, pageWidth - 20, currentY, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += splitDesc.length * 5 + 6;
    });

    // --- TOTALS SECTION ---
    currentY += 5;
    const totalBoxY = currentY;

    // Draw Accent Line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.line(pageWidth - 85, totalBoxY, pageWidth - 15, totalBoxY);

    currentY += 10;

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Subtotal', pageWidth - 50, currentY, { align: 'right' });
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`${invoice.total.toFixed(2)} €`, pageWidth - 20, currentY, { align: 'right' });

    currentY += 7;
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Impuestos (0%)', pageWidth - 50, currentY, { align: 'right' });
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('0.00 €', pageWidth - 20, currentY, { align: 'right' });

    currentY += 10;
    // GRAND TOTAL
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    // Widened box (from -85 to -95) to ensure "TOTAL A PAGAR" fits with white text
    doc.roundedRect(pageWidth - 95, currentY - 6, 80, 12, 1, 1, 'F');

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL A PAGAR', pageWidth - 55, currentY + 2, { align: 'right' });
    doc.text(`${invoice.total.toFixed(2)} €`, pageWidth - 20, currentY + 2, { align: 'right' });

    // --- FOOTER ---
    const footerY = pageHeight - 20;
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'normal');

    const legalText =
      settings.legalText ||
      'Condiciones de pago: A la recepción de la factura. Gracias por su confianza.';
    const splitLegal = doc.splitTextToSize(legalText, pageWidth - 30);
    doc.text(splitLegal, pageWidth / 2, footerY, { align: 'center' });

    // Brand Note
    doc.setFontSize(6);
    doc.setTextColor(203, 213, 225); // Slate 300
    doc.text('Generado por Activa S.L. CRM', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    // Sanitize filename
    const safeNumber = invoice.number.replace(/[^a-zA-Z0-9-_]/g, '-');
    doc.save(`Factura_${safeNumber}.pdf`);

    try {
      await AuditRepository.log('report', `Documento generado: Factura ${invoice.number}`, {
        type: 'report',
        documentId: invoice.number,
        format: 'pdf',
      });
    } catch (e) {
      console.warn('Audit Log Failed', e);
    }
  },
};
