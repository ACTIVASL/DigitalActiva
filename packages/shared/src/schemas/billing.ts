import { z } from 'zod';

export const InvoiceStatusEnum = z.enum(['DRAFT', 'PENDING', 'PAID', 'CANCELLED']);
export const PaymentMethodEnum = z.enum(['CASH', 'TRANSFER', 'BIZUM', 'CARD', 'OTHER']);

export const InvoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
  sessionId: z.string().optional(), // Link to session if applicable
});

export const InvoiceSchema = z.object({
  id: z.string(),
  userId: z.string(), // Owner for Firestore security rules
  number: z.string(), // Sequence number like "INV-2024-001"
  date: z.string(), // ISO Date
  dueDate: z.string().optional(),

  // Client Info Snapshot (Immutable)
  patientId: z.string(),
  patientName: z.string(),
  patientNif: z.string().optional(),
  patientAddress: z.string().optional(),

  // Financials
  items: z.array(InvoiceItemSchema),
  subtotal: z.number().min(0),
  taxRate: z.number().min(0).default(0), // % (e.g., 21)
  taxAmount: z.number().min(0).default(0),
  total: z.number().min(0),

  // Status & Meta
  status: InvoiceStatusEnum.default('DRAFT'),
  paymentMethod: PaymentMethodEnum.optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  paidAt: z.string().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
