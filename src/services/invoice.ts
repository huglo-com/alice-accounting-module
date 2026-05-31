import { randomUUID } from "node:crypto";
import { ModuleError } from "@huglo/module-sdk";
import { store } from "./store.js";
import type { Invoice, InvoiceInput } from "../lib/schemas.js";

// Business logic for invoices.
//
// The scope handlers stay thin by delegating to the small, focused functions
// below. Each function does exactly one thing and reads top to bottom.

// Builds what an invoice WOULD look like, without saving anything.
// Used for "dry run" requests so a caller can preview the result safely.
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

// Creates a new invoice for the subject and saves it to disk.
// Rejects the request if an identical invoice already exists.
export async function createInvoice(
  input: InvoiceInput,
  subject: string,
): Promise<Invoice> {
  // Step 1: refuse to create the same invoice twice.
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

  // Step 2: build the new invoice record.
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

  // Step 3: persist it and hand it back.
  await store.save(invoice);
  return invoice;
}

// Reads a single invoice and confirms it belongs to the asking subject.
// Throws a "not found" error if it is missing or owned by someone else.
export async function getInvoice(
  id: string,
  subject: string,
): Promise<Invoice> {
  const invoice = await store.get(id);

  // We treat "not yours" and "does not exist" the same way on purpose,
  // so callers cannot probe for invoices owned by other subjects.
  if (invoice?.subject !== subject) {
    throw new ModuleError({
      code: "invoice_not_found",
      message: `Invoice ${id} not found`,
      retryable: false,
    });
  }

  return invoice;
}

// Lists every invoice that belongs to the given subject.
export async function listInvoices(subject: string): Promise<Invoice[]> {
  return store.list(subject);
}
