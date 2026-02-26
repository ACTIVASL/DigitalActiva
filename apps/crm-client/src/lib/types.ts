import {
  Patient as SharedPatient,
  Session,
  ClinicalFormulation,
  CognitiveScores,
  ClinicalSafetyProfile,
  MusicalIdentity,
  PsychosocialContext,
  ForensicMetadata,
  DocumentCategoryEnum,
  GroupSession,
} from '@monorepo/shared';

// Local definition if not in shared
export interface ClinicalReport {
  id: string;
  patientId: string;
  patientName?: string; // Added for frontend display compatibility
  date: string;
  type: string;
  content: string;
  status: 'draft' | 'final';
  createdBy: string;
  generatedBy?: string; // Legacy field
  createdAt: string;
}

export interface ClinicalGuide {
  title: string;
  objectives: string[];
  techniques: string[];
  precautions: string[];
  focus: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientMeta?: string;
  clientNif?: string;
  clientAddress?: string;
  date?: string; // Optional as template might generate it
  sessions: Session[];
}

// --- ACTIVA DIGITAL OS: HYBRID AGENT NODE ---
// Replacing 'Patient' with 'AgentNode' for Corporate Context

export interface AgentNodeProfile {
  id: string;
  human: {
    fullName: string;
    role: string; // e.g., 'Senior Engineer', 'Financial Analyst'
    department: 'ENGINEERING' | 'OPERATIONS' | 'FINANCE' | 'LEGAL' | 'HR';
    location: string;
    avatarUrl?: string; // B/N Professional Photo
    email: string; // @activasl.com (Google Workspace)
    status: 'DEEP_WORK' | 'MEETING' | 'OFFLINE' | 'AVAILABLE';
  };
  synthetic: {
    model: 'Gemini 3.0 Pro';
    contextWindow: number; // e.g., 1500000
    uptime: number; // Percentage
    notebookLmId: string; // Link to Employee's Knowledge Base
    workspaceSync: boolean; // G-Suite Connection Status
    nativeTools: string[]; // e.g., ['firestore', 'cloud_functions']
  };
  metrics: {
    tasksCompleted: number;
    agentEfficiency: number; // 0-100%
    knowledgeGraphContribution: number; // 0-100%
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: number;
  image: string;
  bio: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEEP_WORK' | 'IDLE';
  department: string;
}

// --- LEGACY CLINICAL TYPES (Restored for Build Compatibility) ---
export interface EvaluationRecord {
  id: string;
  date: string;
  results: {
    moca: string;
    mmse: string;
    gds: string;
  };
  notes?: string;
  pdfUrl?: string;
}

export interface ExtendedCognitiveScores extends CognitiveScores {
  childProfile?: Record<string, Record<string, number>>;
  childObs?: string;
  functionalScores?: number[];
  date?: string;
  admissionChecks?: { safety: string[]; prep: string[] };
}

// Keeping Legacy Adapter for 'Patient' to prevent breaking shared libs initially
export interface Patient extends SharedPatient {
  evaluationHistory?: EvaluationRecord[];
  cognitiveScores?: ExtendedCognitiveScores;
  currentEval?: number[];
  _isAgentNode?: boolean; // Brand for type safety
}

// TITANIUM NAVIGATION
export interface NavigationOptions {
  mode?: 'new' | 'edit';
  id?: string | number;
  action?: string;
  section?: 'strategy' | 'operations' | 'knowledge'; // for Executive Stack
}

export type NavigationPayload = AgentNodeProfile | Patient | string | number | NavigationOptions | undefined;

export interface CalendarEvent {
  date: string;
  time: string;
  type: 'deployment' | 'audit' | 'sync'; // Corporate terms
  title?: string;
  agentName?: string;
}

// --- FRONTEND SPECIFIC TYPES ---

export interface ClinicSettings {
  name?: string;
  cif?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  legalText?: string;
  notificationsEnabled?: boolean;
  billing?: {
    legalName: string;
    nif: string;
    address: string;
    logoUrl: string;
    email?: string;
    phone?: string;
  };
}

export { DocumentCategoryEnum };

export interface FormulationData {
  selected: string[];
  text: string;
}

export type {
  Session,
  ClinicalFormulation,
  CognitiveScores,
  ClinicalSafetyProfile,
  MusicalIdentity,
  PsychosocialContext,
  ForensicMetadata,
  GroupSession,
};
