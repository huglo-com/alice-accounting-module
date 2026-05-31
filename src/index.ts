import "dotenv/config";
import { Module, InMemoryGrantStore, loadKeyPair } from "@huglo/module-sdk";
import { PORT, MODULE_ENDPOINT } from "./config.js";
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

// Grants are kept in memory here, so they are forgotten on restart.
// In production you should provide your own grant store (for example one backed
// by Postgres) that implements the `GrantStore` interface from the SDK.
const grantStore = new InMemoryGrantStore();

// Create the module instance. This is the equivalent of `const app = express()`:
// it holds the metadata, the signing key pair, and the grant store.
const module = new Module({
  id: "alice-accounting",
  name: "Alice Accounting",
  description: "Stores and serves invoices",
  version: "0.1.0",
  keyPair: loadKeyPair(),
  grantStore,
});

// Routing table. Each scope pairs a name + validation schemas with a handler,
// just like `app.get(path, handler)` pairs a route with its handler.
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

// Start listening for requests.
await module.listen(PORT);

console.log(`Server listening on http://localhost:${PORT}`);
console.log(`Module ready at ${MODULE_ENDPOINT}`);