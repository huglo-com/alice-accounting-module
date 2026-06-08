import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { InvoiceSchema, type Invoice } from "../lib/schemas.js";
import { DATA_DIR } from "../config.js";

/* =============================================================================
 * Invoice storage
 *
 * FileInvoiceStore persists one JSON file per invoice.
 *
 * Production: use a durable database instead of plain files on disk.
 * ============================================================================= */

export class FileInvoiceStore {
  private readonly dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  private invoicePath(id: string): string {
    return path.join(this.dataDir, `${id}.json`);
  }

  private async ensureDir(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
  }

  async save(invoice: Invoice): Promise<void> {
    await this.ensureDir();
    const filePath = this.invoicePath(invoice.id);
    await writeFile(filePath, `${JSON.stringify(invoice, null, 2)}\n`, "utf8");
  }

  async get(id: string): Promise<Invoice | null> {
    try {
      const raw = await readFile(this.invoicePath(id), "utf8");
      return InvoiceSchema.parse(JSON.parse(raw));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

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
      if (!entry.endsWith(".json")) {
        continue;
      }

      const id = entry.slice(0, -".json".length);
      const invoice = await this.get(id);

      if (invoice?.subject === subject) {
        invoices.push(invoice);
      }
    }

    return invoices.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

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

export const store = new FileInvoiceStore(DATA_DIR);
