// Alice Accounting - example Huglo module for storing and serving invoices.

import "dotenv/config";
import { Module, InMemoryGrantStore, loadKeyPair } from "@huglo/module-sdk";

// Grants are kept in memory here, so they are forgotten on restart.
// In production, provide a GrantStore backed by durable storage (e.g. Postgres).
const grantStore = new InMemoryGrantStore();

const module = new Module({
  id: "alice-accounting",
  name: "Alice Accounting",
  description: "Stores and serves invoices",
  version: "0.1.0",
  keyPair: loadKeyPair(),
  grantStore,
});

/* =============================================================================
 * Scopes
 *
 * invoices:write — create an invoice (dry-run previews without saving).
 * invoices:read  — fetch one invoice by id for the subject.
 * invoices:list  — list all invoices for the subject.
 *
 * Input/output schemas are registered here; handlers delegate to services.
 * ============================================================================= */

import {
  InvoiceInputSchema,
  InvoiceSchema,
  ReadInputSchema,
  ListInputSchema,
  ListOutputSchema,
} from "./lib/schemas.js";
import { writeInvoice } from "./scopes/invoices.write.js";
import { readInvoice } from "./scopes/invoices.read.js";
import { listInvoicesHandler } from "./scopes/invoices.list.js";

module.scope("invoices:write", {
  description: "Create an invoice",
  input: InvoiceInputSchema,
  output: InvoiceSchema,
  handler: writeInvoice,
});

module.scope("invoices:read", {
  description: "Read an invoice by id",
  input: ReadInputSchema,
  output: InvoiceSchema,
  handler: readInvoice,
});

module.scope("invoices:list", {
  description: "List invoices for the subject",
  input: ListInputSchema,
  output: ListOutputSchema,
  handler: listInvoicesHandler,
});

/* =============================================================================
 * Start the server
 * ============================================================================= */
import { PORT, MODULE_ENDPOINT } from "./config.js";
await module.listen(PORT);

console.log(`Server listening on http://localhost:${PORT}`);
console.log(`Module ready at ${MODULE_ENDPOINT}`);
