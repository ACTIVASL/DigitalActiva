import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Printer, Wand2, Cloud } from 'lucide-react';
import { Button } from '@monorepo/ui-system';
import { Patient, ClinicSettings } from '../../../lib/types';
import logoCircular from '../../../assets/logo-alpha.png';
import { useActivityLog } from '../../../hooks/useActivityLog';
import { useReportController } from '../../../hooks/controllers/useReportController'; // TITANIUM
import { PATHOLOGY_MAP } from '../../../lib/patientUtils';
import { EVALUATION_AREAS_CHILD, EVALUATION_AREAS_ADULT } from '../../../lib/constants';
import { useReactToPrint, UseReactToPrintOptions } from 'react-to-print';
import { useAuth } from '../../../context/AuthContext';
import { Toast } from '@monorepo/ui-system';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  clinicSettings: ClinicSettings;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  clinicSettings,
}) => {
  const { user } = useAuth();
  const [reportText, setReportText] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showContext, setShowContext] = useState(false); // Mobile Toggle State

  const { logActivity } = useActivityLog();
  const { createReport, isCreating } = useReportController(
    patient.id ? String(patient.id) : undefined,
  );

  // PRINT REF
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Informe_Clinico_${patient.name.replace(/\s+/g, '_')}`,
    removeAfterPrint: true,
    onAfterPrint: () => logActivity('report', `Informe clínico impreso para: ${patient.name}`),
  } as UseReactToPrintOptions);

  const handleSave = async () => {
    try {
      await createReport({
        patientId: String(patient.id),
        patientName: patient.name,
        type: 'evolution', // Default type, could be selectable
        date: new Date().toISOString(),
        content: reportText,
        status: 'final',
        generatedBy: user?.email || 'Sistema',
      });
      setToast({ msg: 'Informe guardado correctamente en la Historia Clínica', type: 'success' });
      logActivity('report', `Informe guardado: ${patient.name}`);
      // Close after delay or just let user chose
      setTimeout(onClose, 1500);
    } catch (error) {
      setToast({ msg: 'Error al guardar el informe', type: 'error' });
    }
  };

  // Smart Template Logic (Refactored: Robust & Instant)
  useEffect(() => {
    if (isOpen && patient && !reportText) {
      // Determine Type and Mapping
      const isChild = patient.age < 18;
      const labels = isChild ? EVALUATION_AREAS_CHILD : EVALUATION_AREAS_ADULT;
      const scores = patient.currentEval || [];

      const functionalText =
        scores.length > 0
          ? labels
            .map((label: string, idx: number) => {
              const score = scores[idx] || 0;
              const level =
                score === 0
                  ? 'Nulo/No Evaluado'
                  : score === 1
                    ? 'Bajo/Emergente'
                    : score === 2
                      ? 'Medio/En Proceso'
                      : 'Alto/Consolidado';
              if (score === 0) return null; // Skip empty
              return `- ${label}: ${level}`;
            })
            .filter(Boolean)
            .join('\n')
          : 'Sin registro funcional detallado.';

      const today = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const sessionsCount = patient.sessions?.filter((s) => !s.isAbsent).length || 0;
      const lastEval = patient.cognitiveScores || {};
      const mocaScore = lastEval.moca || 'Pendiente';
      const gdsScore = lastEval.gds || 'No registrado';

      const synthesisText =
        typeof patient.clinicalFormulation?.synthesis === 'string'
          ? patient.clinicalFormulation.synthesis
          : patient.clinicalFormulation?.synthesis?.text;

      const draft = `INFORME CLÍNICO DE MUSICOTERAPIA
Fecha de emisión: ${today}

1. DATOS DE FILIACIÓN
Paciente: ${patient.name}
Edad: ${patient.age} años
Diagnóstico: ${patient.diagnosis}
Referencia HC: ${patient.reference || 'N/A'}

2. RESUMEN DE INTERVENCIÓN
El paciente inició el tratamiento el ${patient.joinedDate}. A fecha de hoy, ha completado un total de ${sessionsCount} sesiones de musicoterapia.
Actualmente se encuentra en una fase de mantenimiento y estimulación cognitiva activa.

3. EVALUACIÓN Y EVOLUCIÓN
En la última valoración psicométrica y funcional realizada, se obtuvieron los siguientes resultados:

PERFIL COGNITIVO / SCREENING:
- MOCA (Montreal Cognitive Assessment): ${mocaScore}
- Escala GDS (Reisberg): Estadio ${gdsScore}

PERFIL FUNCIONAL Y MUSICAL:
${functionalText}

EVOLUCIÓN RECIENTE (Últimas 5 Sesiones):
${patient.sessions
          ?.slice(0, 5)
          .map((s) => {
            const status = s.isAbsent ? '[AUSENCIA]' : '';
            return `- ${s.date} ${status}: ${s.notes || (s.computedPhase ? 'Fase ' + s.computedPhase : 'Sesión Estándar')}`;
          })
          .join('\n') || 'Sin sesiones recientes.'
        }

Observaciones cualitativas:
${synthesisText || (patient.cognitiveScores as unknown as { childObs?: string })?.childObs || 'No se han registrado observaciones específicas.'}

4. OBJETIVOS TRABAJADOS
- Estimulación de la memoria autobiográfica a través de la reminiscencia musical.
- Fomento de la iniciativa y la comunicación verbal.
- Mantenimiento de las capacidades atencionales y funciones ejecutivas.

5. CONCLUSIONES Y RECOMENDACIONES
Se observa una respuesta favorable a la intervención musical...[Espacio para que el terapeuta complete]

Se recomienda la continuidad del tratamiento con una frecuencia de...`;

      setReportText(draft);

      setIsGenerating(false);
    }
  }, [isOpen, patient, reportText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <FileText className="text-pink-600" /> Generador de Informe Clínico
            </h2>
            <p className="text-sm text-slate-500">Generador de Plantillas Clínicas v5.0</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left Panel: Context & Template (Collapsible on Mobile) */}
          <div
            className={`w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto ${!showContext ? 'hidden md:block' : 'block absolute inset-0 z-20'}`}
          >
            <div className="md:hidden flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Contexto Clínico</h3>
              <button
                onClick={() => setShowContext(false)}
                className="p-1 bg-white rounded-full shadow-sm text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-pink-700 text-sm mb-2 flex items-center gap-2">
                <Wand2 size={16} /> Smart Template Activo
              </h4>
              <p className="text-xs text-pink-600 leading-relaxed">
                El sistema ha detectado {patient.sessions?.length || 0} sesiones y una evaluación
                reciente. Se ha generado un borrador basado en la fase "
                {PATHOLOGY_MAP[patient.pathologyType] || patient.pathologyType}" del paciente.
              </p>
            </div>

            <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">
              Variables Inyectadas
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500">Paciente</span>
                <span className="font-bold text-slate-800">{patient.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500">Edad</span>
                <span className="font-bold text-slate-800">{patient.age}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500">MOCA</span>
                <span className="font-bold text-slate-800">
                  {patient.cognitiveScores?.moca || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Editor */}
          <div className="flex-1 flex flex-col relative">
            {/* Mobile Context Toggle */}
            <div className="md:hidden p-2 bg-slate-50 border-b border-slate-100 flex justify-end">
              <button
                onClick={() => setShowContext(!showContext)}
                className="text-xs font-bold text-pink-600 flex items-center gap-1"
              >
                <Wand2 size={12} /> {showContext ? 'Ocultar Datos' : 'Ver Datos Paciente'}
              </button>
            </div>

            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center flex-col gap-3">
                <Wand2 className="animate-spin text-pink-500" size={32} />
                <span className="text-sm font-bold text-slate-500">
                  Redactando borrador clínico...
                </span>
              </div>
            )}
            <textarea
              className="flex-1 p-8 resize-none focus:outline-none font-serif text-slate-800 leading-relaxed"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            icon={Cloud}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
            disabled={isCreating}
          >
            {isCreating ? 'Guardando...' : 'Guardar en Historial'}
          </Button>
          <Button onClick={handlePrint} icon={Printer} variant="secondary">
            Solo Imprimir
          </Button>
        </div>
      </div>

      {/* HIDDEN PRINT TEMPLATE - RENDERED IN DOM BUT HIDDEN */}
      <div style={{ display: 'none' }}>
        <div
          ref={reportRef}
          className="print-container p-10 font-serif text-slate-800 leading-relaxed"
          style={{ padding: '40px', fontFamily: '"Times New Roman", serif', color: '#333' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '2px solid #EC008C',
              paddingBottom: '20px',
              marginBottom: '40px',
            }}
          >
            <img src={logoCircular} style={{ height: '60px' }} alt="Logo" />
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
              <strong>{clinicSettings.name || 'Clínica Método Activa'}</strong>
              <br />
              {clinicSettings.address || ''}
              <br />
              {clinicSettings.email || ''} | {clinicSettings.phone || ''}
            </div>
          </div>

          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px' }}>
            {reportText}
          </pre>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ width: '200px', borderTop: '1px solid #000', marginBottom: '5px' }}
              ></div>
              Fdo. El Terapeuta
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ width: '200px', borderTop: '1px solid #000', marginBottom: '5px' }}
              ></div>
              VºBº Dirección
            </div>
          </div>

          <div
            style={{
              marginTop: '50px',
              borderTop: '1px solid #ccc',
              paddingTop: '20px',
              textAlign: 'center',
              fontSize: '10px',
              color: '#999',
            }}
          >
            Documento generado automáticamente por Método Activa Clinical OS v5.0
            <br />
            {clinicSettings.legalText || ''}
          </div>
        </div>
      </div>
    </div>
  );
};
