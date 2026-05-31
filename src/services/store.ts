import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { InvoiceSchema, type Invoice } from "../lib/schemas.js";
import { DATA_DIR } from "../config.js";

// Persists invoices as one JSON file per invoice inside a data directory.
//
// This is the only part of the app that talks to the file system. The scopes
// and the rest of the services use it through the `store` singleton exported
// at the bottom of this file.
export class FileInvoiceStore {
  private readonly dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  // Full path to the file that holds a given invoice.
  private invoicePath(id: string): string {
    return path.join(this.dataDir, `${id}.json`);
  }

  // Makes sure the data directory exists before we read or write.
  private async ensureDir(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
  }

  // Writes an invoice to disk as pretty-printed JSON.
  async save(invoice: Invoice): Promise<void> {
    await this.ensureDir();
    const filePath = this.invoicePath(invoice.id);
    await writeFile(filePath, `${JSON.stringify(invoice, null, 2)}\n`, "utf8");
  }

  // Reads one invoice by id. Returns null when the file does not exist.
  async get(id: string): Promise<Invoice | null> {
    try {
      const raw = await readFile(this.invoicePath(id), "utf8");
      // Parse through the schema so we never trust malformed files on disk.
      return InvoiceSchema.parse(JSON.parse(raw));
    } catch (error) {
      // "ENOENT" means "no such file": a missing invoice, not a real error.
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  // Returns every invoice that belongs to the given subject, oldest first.
  async list(subject: string): Promise<Invoice[]> {
    await this.ensureDir();

    let entries: string[];
    try {
      entries = await readdir(this.dataDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }

    const invoices: Invoice[] = [];
    for (const entry of entries) {
      // Skip anything that is not an invoice JSON file.
      if (!entry.endsWith(".json")) {
        continue;
      }

      // Turn "inv-1234.json" back into the id "inv-1234".
      const id = entry.slice(0, -".json".length);
      const invoice = await this.get(id);

      // Only include invoices owned by this subject.
      if (invoice?.subject === subject) {
        invoices.push(invoice);
      }
    }

    return invoices.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  // Finds an existing invoice with the same vendor and amount for a subject.
  // Used to stop the same invoice from being created twice.
  async findDuplicate(
    subject: string,
    vendor: string,
    amount: number,
  ): Promise<Invoice | null> {
    const invoices = await this.list(subject);
    return (
      invoices.find(
        (invoice) => invoice.vendor === vendor && invoice.amount === amount,
      ) ?? null
    );
  }
}

// Shared single instance used across the whole module.
// Built once from the configured data directory.
export const store = new FileInvoiceStore(DATA_DIR);
