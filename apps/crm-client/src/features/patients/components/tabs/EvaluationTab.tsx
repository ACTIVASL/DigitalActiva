import React, { useState } from 'react';
import { Card, Button } from '@monorepo/ui-system';
import { BarChart3, PenTool, Printer, Trash2, Download, Save, Loader2 } from 'lucide-react';
import { CognitiveChart } from '../../../analytics/CognitiveChart';
import { Patient, ClinicSettings, EvaluationRecord } from '../../../../lib/types';
import {
  EVALUATION_AREAS_ADULT,
  ADULT_DEV_DOMAINS,
  CHILD_DEV_DOMAINS,
  CHILD_MUSICAL_PROFILE,
} from '../../../../lib/constants';
import jsPDF from 'jspdf';
import { DocumentRepository } from '../../../../data/repositories/DocumentRepository';

interface EvaluationTabProps {
  patient: Patient;
  onOpenCognitive: () => void;
  onUpdate: (updated: Patient) => void;
  clinicSettings: ClinicSettings;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export const EvaluationTab: React.FC<EvaluationTabProps> = ({
  patient,
  onOpenCognitive,
  onUpdate,
  clinicSettings,
  showToast,
}) => {
  const [uploading, setUploading] = useState(false);

  // --- PDF GENERATION & STORAGE ---
  const generateAndUploadPDF = async () => {
    if (!patient.cognitiveScores) {
      showToast?.('No hay evaluación actual para archivar.', 'error');
      return;
    }

    setUploading(true);
    try {
      const dateStr = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const scores = patient.cognitiveScores;
      const moca = String(scores.moca || '-');
      const mmse = String(scores.mmse || '-');
      const gds = String(scores.gds || '-');

      // Determine Context (Child vs Adult)
      const isChild = patient.age < 18; // Simple heuristic, ideally passed from prop or patient type

      // 1. Generate PDF (Programmatic, matching V3 Design)
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;

      // --- HELPER: HEADER ---
      const printHeader = () => {
        doc.setDrawColor(236, 0, 140); // Brand Pink
        doc.setLineWidth(1.5);
        doc.line(20, 25, pageWidth - 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(clinicSettings.name || 'Clínica Método Activa', pageWidth - 20, 15, {
          align: 'right',
        });
        doc.text(
          `${clinicSettings.address || ''} | ${clinicSettings.phone || ''}`,
          pageWidth - 20,
          20,
          { align: 'right' },
        );
      };

      // --- PAGE 1: SUMMARY ---
      printHeader();

      // Title
      doc.setFontSize(22);
      doc.setTextColor(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORME DE EVALUACIÓN CLÍNICA', 20, 45);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Fecha de Registro: ${dateStr}`, 20, 52);

      // Patient Info Box
      const boxY = 65;
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.rect(20, boxY, pageWidth - 40, 40, 'FD');

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('PACIENTE', 30, boxY + 12);
      doc.text('EDAD', 30, boxY + 22);
      doc.text('DIAGNÓSTICO', 30, boxY + 32);

      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.setFont('helvetica', 'bold');
      doc.text(patient.name, 70, boxY + 12);
      doc.text(`${patient.age} años`, 70, boxY + 22);
      doc.text(patient.diagnosis || 'No especificado', 70, boxY + 32);

      // SCORES (Only for Adults usually, but customizable)
      let currentY = 125;

      if (!isChild) {
        // MOCA
        doc.setDrawColor(230);
        doc.rect(20, currentY, 50, 40);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'bold');
        doc.text('MOCA', 45, currentY + 10, { align: 'center' });
        doc.setFontSize(24);
        doc.setTextColor(236, 0, 140);
        doc.text(moca, 45, currentY + 28, { align: 'center' });

        // MMSE
        doc.setDrawColor(230);
        doc.rect(80, currentY, 50, 40);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('MMSE', 105, currentY + 10, { align: 'center' });
        doc.setFontSize(24);
        doc.setTextColor(50);
        doc.text(mmse, 105, currentY + 28, { align: 'center' });

        // GDS
        doc.setDrawColor(230);
        doc.rect(140, currentY, 50, 40);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('GDS (Reisberg)', 165, currentY + 10, { align: 'center' });
        doc.setFontSize(24);
        doc.setTextColor(50);
        doc.text(gds, 165, currentY + 28, { align: 'center' });

        currentY += 60;
      } else {
        // For Child, maybe just Title "Perfil de Desarrollo"
        doc.setFontSize(16);
        doc.setTextColor(236, 0, 140);
        doc.text('PERFIL DE DESARROLLO INFANTIL', 20, currentY);
        currentY += 20;
      }

      // --- FUNCTIONAL PROFILE (The "Bajo/Medio/Alto" requested by user) ---
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.setFont('helvetica', 'bold');
      doc.text('Valoración Funcional por Áreas', 20, currentY);
      currentY += 10;

      // Determine domains array
      // Importing constants inside function is messy, assuming they are available or we use hardcoded structure logic
      // Since we can't easily import large arrays here without looking at imports, we might need to rely on what's available
      // Luckily `EVALUATION_AREAS_ADULT` and `ADULT_DEV_DOMAINS` are likely imported or can be imported.
      // Let's use `import { ADULT_DEV_DOMAINS, ... }` at top of file.

      // We need to access the imported constants.
      // NOTE: I added imports in previous steps? Wait, I need to check imports.
      // `ADULT_DEV_DOMAINS` is NOT imported in EvaluationTab currently. I must add it.

      // Placeholder for imports logic: assuming I will add them in next step or they exist.
      // Actually, I should use `any` here or logic to fetch from `lib/constants`.
      // But wait, the user wants "Low/Med/High".

      const functionalScores = scores.functionalScores || [];

      // I will assume global availability or Fix imports in a separate tool call.

      // ... (Continuing Logic assuming imports are present) ...

      // Need to define domains array based on isChild
      // Since I can't modify imports AND function body in one go easily without replacing whole file,
      // I will assume I'll fix imports.

      // LOGIC FOR TABLE
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const drawRow = (label: string, value: number, y: number) => {
        doc.setTextColor(80);
        doc.text(label, 25, y);

        // Value Box
        let text = 'Nulo';
        let color = [200, 200, 200]; // Grey
        if (value === 1) {
          text = 'BAJO';
          color = [234, 179, 8];
        } // Yellow
        if (value === 2) {
          text = 'MEDIO';
          color = [59, 130, 246];
        } // Blue
        if (value === 3) {
          text = 'ALTO';
          color = [16, 185, 129];
        } // Green

        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(140, y - 4, 30, 6, 1, 1, 'F');
        doc.setTextColor(255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(text, 155, y, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      // ADULT LOOP
      if (!isChild) {
        ADULT_DEV_DOMAINS.forEach((domain) => {
          // Check page break
          if (currentY > pageHeight - 40) {
            doc.addPage();
            printHeader();
            currentY = 40;
          }

          // Print Domain Header
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(236, 0, 140); // Pink Brand or specific color
          doc.text(domain.title.toUpperCase(), 20, currentY);
          currentY += 8;

          // Print Items
          domain.items.forEach((item) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              printHeader();
              currentY = 40;
            }

            // Find index in flat list to get score
            const idx = EVALUATION_AREAS_ADULT.indexOf(item);
            const val =
              idx !== -1 && functionalScores[idx] !== undefined ? functionalScores[idx] : 0;

            drawRow(item, val, currentY);
            currentY += 10;
          });
          currentY += 5; // Spacing between domains
        });
      }
      // CHILD LOOP
      else {
        // Flatten Child Profile
        const profile = scores.childProfile || {};
        // Iterate categories
        [
          ...CHILD_DEV_DOMAINS,
          {
            id: 'musical',
            title: 'Perfil Musical',
            items: CHILD_MUSICAL_PROFILE.flatMap((p) => p.items),
          },
        ].forEach((domain) => {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30);
          doc.text(domain.title.toUpperCase(), 20, currentY);
          currentY += 8;

          domain.items.forEach((item) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              printHeader();
              currentY = 40;
            }
            // Find value
            let val = 0;
            // Logic from CognitiveModal to find value
            if (domain.id === 'musical') {
              // Complex find
              const catId =
                CHILD_MUSICAL_PROFILE.find((c) => c.items.includes(item))?.id || 'rhythm';
              val = profile[catId]?.[item] ?? 0;
            } else {
              val = profile[domain.id]?.[item] ?? 0;
            }

            drawRow(item, val, currentY);
            currentY += 10;
          });
          currentY += 5;
        });
      }

      // Observations
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 40;
      } else {
        currentY += 10;
      }

      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVACIONES / SÍNTESIS', 20, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60);
      const obsText = scores.childObs || 'Sin observaciones registradas.';
      const splitObs = doc.splitTextToSize(obsText, pageWidth - 40);
      doc.text(splitObs, 20, currentY);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Documento generado por Método Activa Clinical OS', centerX, pageHeight - 10, {
        align: 'center',
      });

      // 2. Convert to Blob
      const pdfBlob = doc.output('blob');

      // 3. Upload using Repository (Ensures Metadata & Security Rules)
      const filename = `Evaluacion_${isChild ? 'Infantil' : 'Adulto'}_${dateStr.replace(/\//g, '-')}.pdf`;
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      // This ensures logic reuses the official app storage channel
      const uploadedDoc = await DocumentRepository.upload(String(patient.id), pdfFile, {
        category: 'report', // Will appear in Documents Tab too
        timestamp: new Date().toISOString(),
        type: 'evaluation_snapshot',
      });

      // 4. Update Patient History with Repository URL
      const newRecord: EvaluationRecord = {
        id: Date.now().toString(),
        date: dateStr,
        results: { moca, mmse, gds },
        notes: `Informe Completo PDF (${isChild ? 'Infantil' : 'Adulto'}).`,
        pdfUrl: uploadedDoc.url,
      };

      const updatedHistory = [...(patient.evaluationHistory || []), newRecord];
      onUpdate({ ...patient, evaluationHistory: updatedHistory });

      showToast?.('Informe completo generado y archivado.', 'success');
    } catch {
      showToast?.('Error al generar informe.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (!confirm('¿Eliminar este registro de evaluación?')) return;
    const updatedHistory = (patient.evaluationHistory || []).filter((r) => r.id !== id);
    onUpdate({ ...patient, evaluationHistory: updatedHistory });
    showToast?.('Registro eliminado.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. CURRENT STATUS CARD */}
      <Card className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-slate-800 text-lg">Evolución Clínica (Tiempo Real)</h3>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full" /> Línea Base
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full" /> Actual
            </span>
          </div>
        </div>

        <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-pink-600" /> Historial MOCA / MMSE
          </h4>
          <CognitiveChart history={patient.evaluationHistory || []} />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {patient.age >= 18 && (
            <>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  MOCA
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {patient.cognitiveScores?.moca || '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  MMSE
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {patient.cognitiveScores?.mmse || '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  GDS
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {patient.cognitiveScores?.gds || '-'}
                </span>
              </div>
            </>
          )}
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Fecha
            </span>
            <span className="text-sm font-medium text-slate-600">
              {patient.cognitiveScores?.date || '-'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end leading-none">
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenCognitive}
            icon={PenTool}
            disabled={uploading}
          >
            Actualizar Datos
          </Button>
          <Button
            size="sm"
            onClick={generateAndUploadPDF}
            icon={uploading ? Loader2 : Save}
            className="bg-slate-800 text-white"
            disabled={uploading}
          >
            {uploading ? 'Generando PDF...' : 'Archivar y Generar PDF'}
          </Button>
        </div>
      </Card>

      {/* 2. HISTORY REGISTRY (PDFs) */}
      <Card className="p-8">
        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
          <Printer size={20} className="text-slate-400" /> Registro de Evaluaciones
        </h3>

        {!patient.evaluationHistory || patient.evaluationHistory.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">No hay evaluaciones archivadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Fecha</th>
                  <th className="px-6 py-3">Resultados (MOCA/MMSE/GDS)</th>
                  <th className="px-6 py-3 text-right rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patient.evaluationHistory.map((record) => (
                  <tr key={record.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{record.date}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs font-bold mr-2">
                        MOCA: {record.results.moca}
                      </span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold mr-2">
                        MMSE: {record.results.mmse}
                      </span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">
                        GDS: {record.results.gds}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      {record.pdfUrl ? (
                        <button
                          onClick={() => window.open(record.pdfUrl, '_blank')}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic p-2">Sin PDF</span>
                      )}
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar Registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
