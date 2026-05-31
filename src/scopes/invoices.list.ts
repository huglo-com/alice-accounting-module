import type { ProtectedCtx } from "@huglo/module-sdk";
import type { ListInput, ListOutput } from "../lib/schemas.js";
import { listInvoices } from "../services/invoice.js";

// Handler for the `invoices:list` scope: list every invoice for the subject.
export async function listInvoicesHandler(
  ctx: ProtectedCtx<ListInput>,
): Promise<ListOutput> {
  const invoices = await listInvoices(ctx.subject);
  return { invoices };
}
