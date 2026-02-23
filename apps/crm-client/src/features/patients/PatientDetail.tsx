import React from 'react';
import { Patient, ClinicSettings, Session } from '../../lib/types';
import type { ForensicMetadata } from '@monorepo/shared';
import { usePatientController } from './hooks/usePatientController';
import { PatientHeader } from './components/PatientHeader';
import { Toast } from '@monorepo/ui-system';
import { PaywallModal } from '@monorepo/ui-system';
import jsPDF from 'jspdf';

// Tabs
import { TreatmentTab } from './components/tabs/TreatmentTab';
import { EvaluationTab } from './components/tabs/EvaluationTab';
import { ClinicalHistoryTab } from './components/tabs/ClinicalHistoryTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { BillingTab } from './components/tabs/BillingTab';
import { LifecycleTab } from './components/tabs/LifecycleTab';

// Modals
import { SessionModal } from './modals/SessionModal';
import { QuickAppointmentModal } from '../sessions/modals/QuickAppointmentModal'; // TITANIUM FIX
import { CognitiveModal } from './modals/CognitiveModal';
import { ClinicalGuideModal } from './modals/ClinicalGuideModal';
import { EditProfileModal } from './modals/EditProfileModal';
import { ReportModal } from './modals/ReportModal';

// Alert Banner Components (Still local as it's just a view part)
import { ShieldCheck } from 'lucide-react';
import { useSettingsController } from '../../hooks/controllers/useSettingsController';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onUpdate: (updated: Patient) => void;
}

import { SignatureModal } from './modals/SignatureModal';
import { useDocumentController } from '../../hooks/controllers/useDocumentController';
import { useClinicalReport } from './hooks/useClinicalReport';

import { RecycleBinModal } from './modals/RecycleBinModal';

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUpdate }) => {
  const { generateReport } = useClinicalReport();
  const { settings: clinicSettings } = useSettingsController(); // Need settings for Reports/Billing
  const { uploadDocument } = useDocumentController(String(patient.id)); // Signature Upload
  const [showSignatureModal, setShowSignatureModal] = React.useState(false); // Signature State
  const [showRecycleBin, setShowRecycleBin] = React.useState(false); // Recycle Bin State
  const [showQuickApptModal, setShowQuickApptModal] = React.useState(false); // TITANIUM FIX: Separate modal

  const handleSaveSignature = async (
    signature: { dataUrl: string; metadata?: ForensicMetadata } | string,
  ) => {
    try {
      // Support both old string format and new object format
      const dataUrl = typeof signature === 'string' ? signature : signature.dataUrl;
      const metadata = typeof signature === 'object' ? signature.metadata : undefined;

      // TITANIUM UPGRADE: Generate PDF instead of PNG
      const doc = new jsPDF();
      doc.text('Consentimiento Informado - ACTIVA', 20, 20);
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text('Este documento certifica la aceptación del tratamiento.', 20, 40);

      // Embed Signature Image
      doc.addImage(dataUrl, 'PNG', 20, 60, 100, 50);

      const pdfBlob = doc.output('blob');
      const file = new File(
        [pdfBlob],
        `Consentimiento_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`,
        { type: 'application/pdf' },
      );

      await uploadDocument(file, 'consent', metadata); // Pass metadata to repo
      showToast('Firma forense guardada correctamente', 'success');
    } catch {
      showToast('Error al guardar firma', 'error');
    }
  };

  const {
    activeTab,
    setActiveTab,
    tabs,
    showSessionModal,
    setShowSessionModal,
    selectedSession,
    setSelectedSession,
    showCognitiveModal,
    setShowCognitiveModal,
    cognitiveInitialTab,
    setCognitiveInitialTab,
    showGuideModal,
    setShowGuideModal,
    showEditProfile,
    setShowEditProfile,
    showReportModal,
    setShowReportModal,
    showPaywall,
    setShowPaywall,
    isDeleting,
    canDelete,
    isPremium,
    activeSessions,
    deletedSessions,
    notification,
    handleDeletePatient,
    handleDeleteSession,
    handleRestoreSession,
    handleSaveSession,
    handleUpdateCognitive,
    showToast,
  } = usePatientController({ patient, onUpdate, onBack });

  // Critical Alerts Logic (View Logic)
  const highRisks = patient.safetyProfile
    ? Object.entries(patient.safetyProfile)
      .filter(
        ([k, v]) =>
          v === true &&
          [
            'epilepsy',
            'dysphagia',
            'flightRisk',
            'psychomotorAgitation',
            'chokingHazard',
          ].includes(k),
      )
      .map(([k]) => k)
    : [];
  const isoNocivo = patient.musicalIdentity?.dislikes?.length || 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-7xl mx-auto">
      {notification && (
        <Toast
          message={notification.msg}
          type={notification.type}
          onClose={() => {
            /* Handled by hook timeout */
          }}
        />
      )}

      {/* --- CRITICAL ALERTS BANNER --- */}
      {(highRisks.length > 0 || isoNocivo > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-4 w-full md:w-auto">
            <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 flex items-center gap-2 text-sm md:text-base">
                ALERTA DE SEGURIDAD CLÍNICA
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {highRisks.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 bg-red-200 text-red-800 text-[10px] md:text-xs font-bold rounded uppercase"
                  >
                    {r}
                  </span>
                ))}
                {isoNocivo > 0 && (
                  <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-[10px] md:text-xs font-bold rounded">
                    ISO NOCIVO ACTIVO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <PatientHeader
        patient={patient}
        onBack={onBack}
        onEdit={() => setShowEditProfile(true)}
        onDelete={handleDeletePatient}
        isDeleting={isDeleting}
        canDelete={canDelete}
        onNewSession={() => setShowQuickApptModal(true)}
        onShowReport={() => setShowReportModal(true)}
        onShowGuide={() => setShowGuideModal(true)}
        onExport={() => generateReport(patient)}
        onSign={() => setShowSignatureModal(true)}
        onShowRecycleBin={() => setShowRecycleBin(true)}
        recycleBinCount={deletedSessions?.length || 0}
      />

      {showSignatureModal && (
        <SignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSave={handleSaveSignature}
        />
      )}

      <RecycleBinModal
        isOpen={showRecycleBin}
        onClose={() => setShowRecycleBin(false)}
        deletedSessions={deletedSessions}
        onRestore={handleRestoreSession}
      />
      {/* --- TABS NAV --- */}
      <div className="border-b border-slate-200 sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-sm z-10 pt-2 md:pt-4">
        <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar px-4 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-pink-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <tab.icon size={18} /> {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="min-h-[400px]">
        {activeTab === 'treatment' && <TreatmentTab patient={patient} onUpdate={onUpdate} />}
        {activeTab === 'evaluation' && (
          <EvaluationTab
            patient={patient}
            onOpenCognitive={() => setShowCognitiveModal(true)}
            onUpdate={onUpdate}
            clinicSettings={clinicSettings || ({} as ClinicSettings)}
            showToast={showToast}
          />
        )}
        {activeTab === 'sessions' && (
          <ClinicalHistoryTab
            patient={patient}
            activeSessions={activeSessions}
            isPremium={isPremium}
            onShowPaywall={() => setShowPaywall(true)}
            onNewSession={() => {
              // TITANIUM DEMO LOGIC: "A la segunda sale la pestaña"
              // Check how many "User Created" sessions exist (ID > 10000) vs Seeds (ID < 1000)
              const userCreatedCount = activeSessions.filter((s) => Number(s.id) > 10000).length;
              const DEMO_SESSION_LIMIT = 1;

              // Check hook props. We need demoMode.
              // Using isPremium as proxy? No, isPremium is false in Demo now.
              // We need to access demoMode. Since we can't easily add hook here without refactor,
              // we use the fact that !isPremium means it's Regular or Demo Trial.
              // In both cases, we want to limit.

              if (!isPremium && userCreatedCount >= DEMO_SESSION_LIMIT) {
                setShowPaywall(true);
              } else {
                setSelectedSession(undefined);
                setShowSessionModal(true);
              }
            }}
            onEditSession={(s) => {
              setSelectedSession(s);
              setShowSessionModal(true);
            }}
            onDeleteSession={handleDeleteSession}
            onCloneSession={(s) => {
              const cloned = {
                ...s,
                id: 'new_clone',
                date: new Date().toISOString(),
                paid: false,
                isAbsent: false,
              };
              setSelectedSession(cloned as unknown as Session);
              setShowSessionModal(true);
              showToast('Sesión duplicada (modo edición)', 'success');
            }}
          />
        )}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'billing' && (
          <BillingTab
            patient={patient}
            activeSessions={activeSessions}
            onUpdate={onUpdate}
            clinicSettings={clinicSettings || ({} as ClinicSettings)}
          />
        )}
        {activeTab === 'lifecycle' && (
          <LifecycleTab patient={patient} activeSessions={activeSessions} onUpdate={onUpdate} />
        )}
      </div>

      {/* --- MODALS --- */}
      {showQuickApptModal && (
        <QuickAppointmentModal
          mode="existing"
          patients={[patient]} // Context locked to this patient
          initialPatientId={String(patient.id)}
          onClose={() => setShowQuickApptModal(false)}
          onSave={async (data) => {
            // Bridge manual QuickAppt output to Session logic
            // Reuse handleSaveSession but adapt input
            const newSessionData: Partial<Session> = {
              date: data.date,
              time: data.time || '10:00',
              type: 'individual', // Remove 'as const' if it causes mismatch, or keep if matches
              notes: 'Cita agendada desde Ficha',
              price: 50,
              paid: false,
              isAbsent: false,
              billable: true,
              activities: [],
            };
            // We need to cast to the expected input of handleSaveSession which is ExtendedSession usually or Session
            // handleSaveSession expects Session? Let's check hook.
            // usePatientController defines handleSaveSession: (session: Session) => Promise<void>
            // So we need to match Session type.
            await handleSaveSession({ ...newSessionData } as Session);
            setShowQuickApptModal(false);
          }}
        />
      )}
      {showSessionModal && (
        <SessionModal
          initialData={selectedSession}
          patientType={patient.pathologyType || 'other'}
          onClose={() => setShowSessionModal(false)}
          onSave={async (data) => {
            await handleSaveSession(data);
          }}
          onDelete={handleDeleteSession}
        />
      )}
      {showCognitiveModal && (
        <CognitiveModal
          onClose={() => {
            setShowCognitiveModal(false);
            setCognitiveInitialTab('general');
          }}
          onSave={handleUpdateCognitive}
          initialData={patient.cognitiveScores}
          initialScores={patient.currentEval}
          initialTab={cognitiveInitialTab}
          isChild={patient.age < 15}
          isGeriatric={patient.age >= 60}
        />
      )}
      {showGuideModal && <ClinicalGuideModal onClose={() => setShowGuideModal(false)} />}
      {showEditProfile && (
        <EditProfileModal
          onClose={() => setShowEditProfile(false)}
          onSave={(data) => {
            onUpdate({ ...patient, ...data });
            setShowEditProfile(false);
            showToast('Perfil actualizado', 'success');
          }}
          initialData={patient}
        />
      )}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          patient={patient}
          clinicSettings={clinicSettings || {}}
        />
      )}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        limitType="session"
      />

      {showSignatureModal && (
        <SignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
};
