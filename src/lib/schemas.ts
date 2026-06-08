import { z } from "zod";

/* =============================================================================
 * Invoice invoke payloads
 *
 * Zod schemas validate at runtime and derive TypeScript types.
 * Amounts are whole numbers in minor units (e.g. cents).
 * ============================================================================= */

export const InvoiceInputSchema = z.object({
  vendor: z.string().min(1),
  amount: z.number().int(),
  currency: z.string().length(3),
  description: z.string().optional(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  description: z.string().optional(),
  status: z.enum(["draft", "sent"]),
  subject: z.string(),
  createdAt: z.string(),
});

export const ReadInputSchema = z.object({
  id: z.string(),
});

export const ListInputSchema = z.object({});

export const ListOutputSchema = z.object({
  invoices: z.array(InvoiceSchema),
});

export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type ReadInput = z.infer<typeof ReadInputSchema>;
export type ListInput = z.infer<typeof ListInputSchema>;
export type ListOutput = z.infer<typeof ListOutputSchema>;
