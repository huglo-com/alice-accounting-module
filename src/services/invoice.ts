import { randomUUID } from "node:crypto";
import { ModuleError } from "@huglo/module-sdk";
import { store } from "./store.js";
import type { Invoice, InvoiceInput } from "../lib/schemas.js";

/* =============================================================================
 * Invoice business logic
 *
 * previewInvoice — dry-run result without saving.
 * createInvoice    — persist new invoice; rejects duplicates.
 * getInvoice       — read by id; "not found" for wrong subject (no probing).
 * listInvoices     — all invoices for a subject.
 * ============================================================================= */

export function previewInvoice(input: InvoiceInput, subject: string): Invoice {
  return {
    id: "dry-run-preview",
    vendor: input.vendor,
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    status: "draft",
    subject,
    createdAt: new Date().toISOString(),
  };
}

export async function createInvoice(
  input: InvoiceInput,
  subject: string,
): Promise<Invoice> {
  const duplicate = await store.findDuplicate(
    subject,
    input.vendor,
    input.amount,
  );
  if (duplicate) {
    throw new ModuleError({
      code: "duplicate_invoice",
      message: `Invoice for ${input.vendor} already exists`,
      retryable: false,
    });
  }

  const invoice: Invoice = {
    id: `inv-${randomUUID().slice(0, 8)}`,
    vendor: input.vendor,
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    status: "draft",
    subject,
    createdAt: new Date().toISOString(),
  };

  await store.save(invoice);
  return invoice;
}

export async function getInvoice(
  id: string,
  subject: string,
): Promise<Invoice> {
  const invoice = await store.get(id);

  if (invoice?.subject !== subject) {
    throw new ModuleError({
      code: "invoice_not_found",
      message: `Invoice ${id} not found`,
      retryable: false,
    });
  }

  return invoice;
}

export async function listInvoices(subject: string): Promise<Invoice[]> {
  return store.list(subject);
}
