import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ModuleError } from "@huglo/module-sdk";
import type { InvoiceInput } from "../src/lib/schemas.js";

const SUBJECT_ALICE = "huglo:user:alice";
const SUBJECT_BOB = "huglo:user:bob";

const validInput: InvoiceInput = {
  vendor: "Acme Corp",
  amount: 50000,
  currency: "USD",
  description: "Consulting",
};

let dataDir: string;
let invoiceService: typeof import("../src/services/invoice.js");

describe("invoice service", () => {
  beforeAll(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "alice-inv-"));
    vi.resetModules();
    vi.doMock("../src/config.js", async () => {
      const actual = await vi.importActual("../src/config.js");
      return { ...actual, DATA_DIR: dataDir };
    });
    invoiceService = await import("../src/services/invoice.js");
  });

  afterAll(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    const entries = await readdir(dataDir);
    await Promise.all(
      entries.map((entry) => rm(path.join(dataDir, entry), { force: true })),
    );
  });

  it("createInvoice persists an invoice that getInvoice can read back", async () => {
    const created = await invoiceService.createInvoice(validInput, SUBJECT_ALICE);

    expect(created.id).toMatch(/^inv-/);
    expect(created.status).toBe("draft");
    expect(created.subject).toBe(SUBJECT_ALICE);

    const loaded = await invoiceService.getInvoice(created.id, SUBJECT_ALICE);
    expect(loaded).toEqual(created);
  });

  it("createInvoice rejects duplicate vendor and amount for the same subject", async () => {
    await invoiceService.createInvoice(validInput, SUBJECT_ALICE);

    await expect(
      invoiceService.createInvoice(validInput, SUBJECT_ALICE),
    ).rejects.toMatchObject({
      name: "ModuleError",
      code: "duplicate_invoice",
    } satisfies Partial<ModuleError>);
  });

  it("previewInvoice returns a dry-run preview without writing to disk", async () => {
    const preview = invoiceService.previewInvoice(validInput, SUBJECT_ALICE);

    expect(preview.id).toBe("dry-run-preview");
    expect(preview.vendor).toBe(validInput.vendor);
    expect(preview.subject).toBe(SUBJECT_ALICE);

    const files = await readdir(dataDir);
    expect(files).toHaveLength(0);
  });

  it("getInvoice throws invoice_not_found when the subject does not match", async () => {
    const created = await invoiceService.createInvoice(validInput, SUBJECT_ALICE);

    await expect(
      invoiceService.getInvoice(created.id, SUBJECT_BOB),
    ).rejects.toMatchObject({
      name: "ModuleError",
      code: "invoice_not_found",
    } satisfies Partial<ModuleError>);
  });

  it("listInvoices returns only invoices for the calling subject", async () => {
    await invoiceService.createInvoice(validInput, SUBJECT_ALICE);
    await invoiceService.createInvoice(
      { ...validInput, vendor: "Other Corp", amount: 10000 },
      SUBJECT_BOB,
    );

    const aliceInvoices = await invoiceService.listInvoices(SUBJECT_ALICE);
    expect(aliceInvoices).toHaveLength(1);
    expect(aliceInvoices[0]?.subject).toBe(SUBJECT_ALICE);
  });
});
