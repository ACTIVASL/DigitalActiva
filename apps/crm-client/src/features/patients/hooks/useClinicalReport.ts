import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, Session } from '@/lib/types';
import logoAlpha from '@/assets/logo-alpha.png'; // Direct Import

export const useClinicalReport = () => {
  const generateReport = async (patient: Patient) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // --- HEADER ---
      // Background Header
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Logo (We need to convert base64 or Use Image Data)
      // Ideally logoAlpha is a URL string. We handle both cases.
      try {
        // TITANIUM: Handle image async if needed, or fallback
        if (logoAlpha) {
          doc.addImage(logoAlpha, 'PNG', 15, 5, 30, 30);
        }
      } catch {
        // Logo load failed — continue PDF generation without logo
      }

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(236, 0, 140); // Activa Pink
      doc.text('ACTIVA S.L.', 50, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Informe Clínico Oficial', 50, 26);
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth - 15, 10, {
        align: 'right',
      });

      // --- PATIENT INFO ---
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Paciente: ${patient.name}`, 15, 50);
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`ID: ${patient.id || 'N/A'}`, 15, 56);
      doc.text(`Edad: ${patient.age || 'N/A'} años`, 15, 62);
      doc.text(`Diagnóstico: ${patient.diagnosis || 'No especificado'}`, 15, 68);

      // --- SESSIONS TABLE ---
      const sessions = patient.sessions || [];
      if (sessions.length > 0) {
        const tableData = sessions.map((s: Session) => [
          formatDateForDisplay(s.date), // Use helper if available, or raw s.date
          s.type === 'group' ? 'Grupal' : 'Individual',
          s.activities?.join(', ') || '-',
          (s.notes || '').substring(0, 100) + ((s.notes || '').length > 100 ? '...' : ''),
        ]);

        autoTable(doc, {
          startY: 80,
          head: [['Fecha', 'Tipo', 'Actividades', 'Observaciones']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [236, 0, 140], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            3: { cellWidth: 'auto' }, // Notes column gets remaining space
          },
          didDrawPage: (_data) => {
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, {
              align: 'center',
            });
          },
        });
      } else {
        doc.text('Sin sesiones registradas.', 15, 90);
      }

      // --- SAVE ---
      const filename = `Historia_Clinica_${patient.name.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
      // alert(`Informe generado correctamente: ${filename}`); // Optional: Too intrusive?
    } catch (err) {
      alert('Error al generar el PDF. Por favor contacte soporte.');
    }
  };

  // Helper for local usage if import fails
  const formatDateForDisplay = (isoDate?: string) => {
    if (!isoDate) return new Date().toLocaleDateString('es-ES');
    if (isoDate.includes('/')) return isoDate;
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  return { generateReport };
};
