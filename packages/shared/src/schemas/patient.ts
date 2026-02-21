import { z } from 'zod';

// --- ENUMS & CONSTANTS ---
export const SessionTypeEnum = z.enum(['individual', 'group']);
export const PathologyTypeEnum = z.enum(['dementia', 'neuro', 'mood', 'other']);
export const EvaluationStatusEnum = z.enum(['draft', 'final']);
export const MobilityAidEnum = z.enum(['none', 'cane', 'walker', 'wheelchair']);
export const SensitivityLevelEnum = z.enum(['low', 'medium', 'high']);
export const RecurrenceFrequencyEnum = z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']);
export const WaitlistPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
// TITANIUM MEMORY CORE
export const DocumentCategoryEnum = z.enum([
  'invoice',
  'consent',
  'report',
  'lab',
  'general',
  'other',
]);

// --- RECURRENCE ENGINE ---
export const RecurrenceRuleSchema = z.object({
  frequency: RecurrenceFrequencyEnum,
  daysOfWeek: z.array(z.number().min(1).max(7)), // 1=Mon, 7=Sun
  endDate: z.string().optional(),
  occurrences: z.number().int().positive().optional(),
});

// --- SESSION ENGINE ---
export const SessionSelfReflectionSchema = z.object({
  positive: z.string(),
  improve: z.string(),
});

export const QualitativeEvalSchema = z.object({
  musical: z.string().optional(),
  emotional: z.string().optional(),
  cognitive: z.string().optional(),
  physical: z.string().optional(),
});

export const SessionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  date: z.string(), // Relaxed to allow ISO YYYY-MM-DD or DD/MM/YYYY
  time: z.string().optional(), // New: HH:MM
  type: SessionTypeEnum,
  price: z.number().min(0).optional(),
  billable: z.boolean().default(true), // New: Allows "Excused Absence" vs "Paid Absence"
  paid: z.boolean().default(false),
  isAbsent: z.boolean().default(false),
  notes: z.string().optional(),
  phase: z.number().int().min(1).optional(),

  // Activity Data
  activityDetails: z.record(z.string(), z.string()).optional(), // Map<ActivityID, Note>
  activities: z.array(z.string()).default([]), // Array of Activity IDs

  // Group Specifics
  location: z.string().optional(),
  participantNames: z.array(z.string()).optional(),
  groupAnalysis: z.string().nullable().optional(),
  groupId: z.string().optional(), // Link to Master Group Session
  groupName: z.string().optional(), // Denormalized name for display

  // Computed / UI State
  computedPhase: z.number().nullable().optional(),
  recurrence: RecurrenceRuleSchema.optional(),

  // Clinical Data
  selfReflection: SessionSelfReflectionSchema.optional(),
  qualitative: QualitativeEvalSchema.optional(),
  scores: z.array(z.number().min(0).max(3)).optional(), // 0-3 Scale
  deletedAt: z.string().optional(), // TITANIUM: Soft Delete
});

// --- CLINICAL MODULES ---

export const FormulationDataSchema = z.object({
  selected: z.array(z.string()),
  text: z.string(),
});

export const ClinicalFormulationSchema = z
  .object({
    synthesis: z.union([FormulationDataSchema, z.string()]).optional(),
    preserved: z.union([FormulationDataSchema, z.string()]).optional(),
    difficulties: z.union([FormulationDataSchema, z.string()]).optional(),
    regulators: z.union([FormulationDataSchema, z.string()]).optional(),
    hypothesis: z.union([FormulationDataSchema, z.string()]).optional(),
  })
  .catchall(z.unknown()); // Allow unknown legacy fields but type them as unknown

export const ClinicalSafetyProfileSchema = z.object({
  // Red Lights (Risks)
  epilepsy: z.boolean().default(false),
  dysphagia: z.boolean().default(false),
  flightRisk: z.boolean().default(false),
  psychomotorAgitation: z.boolean().default(false),
  hyperacusis: z.boolean().default(false),
  chokingHazard: z.boolean().default(false),
  disruptiveBehavior: z.boolean().default(false),

  // Context
  alerts: z.array(z.string()).default([]),
  mobilityAid: MobilityAidEnum.default('none'),
  allergies: z.string().default(''),
});

export const MusicalIdentitySchema = z.object({
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]), // ISO Nocivo
  biographicalSongs: z.array(z.string()).default([]),
  instrumentsOfInterest: z.array(z.string()).default([]),
  musicalTraining: z.boolean().default(false),
  sensitivityLevel: SensitivityLevelEnum.default('medium'),
});

export const PsychosocialContextSchema = z.object({
  livingSituation: z.string().default(''),
  caregiverNetwork: z.string().default(''),
  recentLifeEvents: z.array(z.string()).default([]),
  occupation: z.string().optional(),
});

export const CognitiveScoresSchema = z
  .object({
    moca: z.union([z.string(), z.number()]).optional(), // Allow flexible input, sanitize later
    mmse: z.union([z.string(), z.number()]).optional(),
    gds: z.union([z.string(), z.number()]).optional(),
    date: z.string().optional(),
    lastEvalDate: z.string().optional(), // TITANIUM LIFECYCLE
    mocaDetails: z.record(z.string(), z.number()).optional(), // Details are code:score
    mmseDetails: z.record(z.string(), z.number()).optional(),
    admissionChecks: z
      .object({
        safety: z.array(z.string()),
        prep: z.array(z.string()),
      })
      .optional(),
    functionalScores: z.array(z.number()).optional(),
    childProfile: z.record(z.string(), z.unknown()).optional(),
    childObs: z.string().optional(),
  })
  .catchall(z.unknown());

export const ForensicMetadataSchema = z
  .object({
    timestamp: z.string().optional(),
    userAgent: z.string().optional(),
    screenResolution: z.string().optional(),
    devicePixelRatio: z.number().optional().or(z.string().optional()), // Allow string "1" or number 1
    platform: z.string().optional(),
    category: DocumentCategoryEnum.optional(), // TITANIUM: Added for Metadata persistence
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]));

export const DocumentSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1),
  url: z.string().url(),
  type: z.string(),
  size: z.number().int().min(0),
  category: DocumentCategoryEnum.default('general'), // TITANIUM MEMORY CORE: Strict Categorization
  uploadedBy: z.string().optional(),
  createdAt: z.string().datetime().or(z.string()), // Flexible ISO check
  path: z.string(), // Storage path
  metadata: ForensicMetadataSchema.optional(), // Forensic Metadata (Titanium)
});

// --- MASTER PATIENT ENTITY ---

export const PatientSchema = z.object({
  // Identity
  id: z.union([z.string(), z.number()]),
  userId: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  age: z.number().int().min(0).max(120),
  diagnosis: z.string().default('Sin diagnosticar'),
  pathologyType: z.union([PathologyTypeEnum, z.string()]).default('other'),
  status: z.enum(['active', 'paused', 'archived']).default('active'), // TITANIUM LIFECYCLE
  createdAt: z.string().optional(),
  dischargeDate: z.string().optional(),
  photo: z.string().url().optional().or(z.literal('')),

  // Contact
  contact: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  reference: z.string().optional(),

  // Metrics
  joinedDate: z.string().optional(), // Should be ISO, but keeping flexible for legacy
  sessionsCompleted: z.number().int().default(0),
  initialEval: z.array(z.number()).optional(),
  currentEval: z.array(z.number()).optional(),

  // Clinical Modules (Lazy Loaded usually, but schema defines structure)
  cognitiveScores: CognitiveScoresSchema.optional(),
  clinicalFormulation: ClinicalFormulationSchema.optional(),
  sessions: z.array(SessionSchema).default([]),

  // V2 Profiles (Strict but Null-Safe)
  safetyProfile: ClinicalSafetyProfileSchema.nullable().optional(),
  musicalIdentity: MusicalIdentitySchema.nullable().optional(),
  socialContext: PsychosocialContextSchema.nullable().optional(),

  // Legacy Fields (Deprecated but Preserved for Migration)
  caregiverName: z.string().optional(),
  caregiverPhone: z.string().optional(),
  livingSituation: z.string().optional(),
  supportLevel: z.string().optional(),
  lifeEvents: z.string().optional(),
  musicStyles: z.string().optional(),
  dislikedSounds: z.string().optional(),
  isoSongs: z.string().optional(),
  initialGoals: z.string().optional(),
  hasConsent: z.boolean().optional(),
  birthDate: z.string().optional(),
  childProfile: z.record(z.unknown()).optional(),
  childObs: z.string().optional(),
});

// --- INFERRED TYPES ---
export type Patient = z.infer<typeof PatientSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type ClinicalDocument = z.infer<typeof DocumentSchema>;
export type ClinicalSafetyProfile = z.infer<typeof ClinicalSafetyProfileSchema>;
export type MusicalIdentity = z.infer<typeof MusicalIdentitySchema>;
export type PsychosocialContext = z.infer<typeof PsychosocialContextSchema>;
export type SessionType = z.infer<typeof SessionTypeEnum>;
export type PathologyType = z.infer<typeof PathologyTypeEnum>;
export type ClinicalFormulation = z.infer<typeof ClinicalFormulationSchema>;
export type CognitiveScores = z.infer<typeof CognitiveScoresSchema>;
export type ForensicMetadata = z.infer<typeof ForensicMetadataSchema>;
