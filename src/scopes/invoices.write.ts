import type { ProtectedCtx } from "@huglo/module-sdk";
import type { Invoice, InvoiceInput } from "../lib/schemas.js";
import { createInvoice, previewInvoice } from "../services/invoice.js";

// Handler for the `invoices:write` scope.
//
// It is a plain function that takes the request context and returns an
// invoice. The scope name and validation schemas are wired to it in index.ts,
// the same way an Express route handler is attached to a path.
export async function writeInvoice(
  ctx: ProtectedCtx<InvoiceInput>,
): Promise<Invoice> {
  // A dry run validates the input and returns a preview without saving.
  if (ctx.dryRun) {
    return previewInvoice(ctx.input, ctx.subject);
  }

  return createInvoice(ctx.input, ctx.subject);
}
