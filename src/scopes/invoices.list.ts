import type { ProtectedCtx } from "@huglo/module-sdk";
import type { ListInput, ListOutput } from "../lib/schemas.js";
import { listInvoices } from "../services/invoice.js";

/* =============================================================================
 * invoices:list handler
 *
 * Registered in index.ts with ListInputSchema / ListOutputSchema.
 * Subject comes from the verified grant, not from input.
 * ============================================================================= */

export async function listInvoicesHandler(
  ctx: ProtectedCtx<ListInput>,
): Promise<ListOutput> {
  const invoices = await listInvoices(ctx.subject);
  return { invoices };
}
