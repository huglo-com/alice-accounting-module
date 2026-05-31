import type { ProtectedCtx } from "@huglo/module-sdk";
import type { Invoice, ReadInput } from "../lib/schemas.js";
import { getInvoice } from "../services/invoice.js";

// Handler for the `invoices:read` scope: fetch one invoice by id.
export async function readInvoice(
  ctx: ProtectedCtx<ReadInput>,
): Promise<Invoice> {
  return getInvoice(ctx.input.id, ctx.subject);
}
