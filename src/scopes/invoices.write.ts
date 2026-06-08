import type { ProtectedCtx } from "@huglo/module-sdk";
import type { Invoice, InvoiceInput } from "../lib/schemas.js";
import { createInvoice, previewInvoice } from "../services/invoice.js";

/* =============================================================================
 * invoices:write handler
 *
 * Registered in index.ts with InvoiceInputSchema / InvoiceSchema.
 *
 * dryRun → preview without saving. Otherwise → createInvoice.
 * ============================================================================= */

export async function writeInvoice(
  ctx: ProtectedCtx<InvoiceInput>,
): Promise<Invoice> {
  if (ctx.dryRun) {
    return previewInvoice(ctx.input, ctx.subject);
  }

  return createInvoice(ctx.input, ctx.subject);
}
