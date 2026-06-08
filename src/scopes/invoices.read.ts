import type { ProtectedCtx } from "@huglo/module-sdk";
import type { Invoice, ReadInput } from "../lib/schemas.js";
import { getInvoice } from "../services/invoice.js";

/* =============================================================================
 * invoices:read handler
 *
 * Registered in index.ts with ReadInputSchema / InvoiceSchema.
 * ============================================================================= */

export async function readInvoice(
  ctx: ProtectedCtx<ReadInput>,
): Promise<Invoice> {
  return getInvoice(ctx.input.id, ctx.subject);
}
