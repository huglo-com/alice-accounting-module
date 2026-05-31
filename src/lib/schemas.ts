import { z } from "zod";

// Shared data contracts for the module.
//
// We describe every shape with a Zod schema. Zod does two jobs at once:
//   1. It validates data at runtime (e.g. rejecting a request with no vendor).
//   2. It lets us derive TypeScript types, so the schema is the single source
//      of truth and the types can never drift out of sync.

// What a caller must send to create an invoice.
export const InvoiceInputSchema = z.object({
  vendor: z.string().min(1),
  // Amounts are whole numbers in minor units (e.g. cents), never floats.
  amount: z.number().int(),
  currency: z.string().length(3),
  description: z.string().optional(),
});

// A full invoice record as it is stored and returned.
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

// Input for reading a single invoice by its id.
export const ReadInputSchema = z.object({
  id: z.string(),
});

// Listing takes no arguments; the subject comes from the verified grant.
export const ListInputSchema = z.object({});

// Listing returns an array of invoices wrapped in an object.
export const ListOutputSchema = z.object({
  invoices: z.array(InvoiceSchema),
});

// Types derived from the schemas above.
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type ReadInput = z.infer<typeof ReadInputSchema>;
export type ListInput = z.infer<typeof ListInputSchema>;
export type ListOutput = z.infer<typeof ListOutputSchema>;
