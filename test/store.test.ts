import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { FileInvoiceStore } from "../src/services/store.js";
import type { Invoice } from "../src/lib/schemas.js";

function sampleInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-test001",
    vendor: "Acme Corp",
    amount: 50000,
    currency: "USD",
    description: "Consulting",
    status: "draft",
    subject: "huglo:user:alice",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("FileInvoiceStore", () => {
  let dataDir: string;
  let store: FileInvoiceStore;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "alice-store-"));
    store = new FileInvoiceStore(dataDir);
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("save then get round-trips an identical invoice", async () => {
    const invoice = sampleInvoice();
    await store.save(invoice);

    const loaded = await store.get(invoice.id);
    expect(loaded).toEqual(invoice);
  });

  it("writes pretty-printed JSON to <dir>/<id>.json", async () => {
    const invoice = sampleInvoice({ id: "inv-file001" });
    await store.save(invoice);

    const raw = await readFile(path.join(dataDir, "inv-file001.json"), "utf8");
    expect(raw).toBe(`${JSON.stringify(invoice, null, 2)}\n`);
  });

  it("get returns null when the invoice file does not exist", async () => {
    const loaded = await store.get("inv-missing");
    expect(loaded).toBeNull();
  });

  it("list returns only invoices for the subject, sorted by createdAt", async () => {
    await store.save(
      sampleInvoice({
        id: "inv-b",
        subject: "huglo:user:alice",
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
    );
    await store.save(
      sampleInvoice({
        id: "inv-a",
        subject: "huglo:user:alice",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    await store.save(
      sampleInvoice({
        id: "inv-other",
        subject: "huglo:user:bob",
        createdAt: "2026-01-03T00:00:00.000Z",
      }),
    );

    const invoices = await store.list("huglo:user:alice");
    expect(invoices.map((i) => i.id)).toEqual(["inv-a", "inv-b"]);
  });

  it("list ignores non-json files in the data directory", async () => {
    await store.save(sampleInvoice({ id: "inv-only" }));
    await writeFile(path.join(dataDir, "notes.txt"), "not an invoice", "utf8");

    const invoices = await store.list("huglo:user:alice");
    expect(invoices).toHaveLength(1);
    expect(invoices[0]?.id).toBe("inv-only");
  });

  it("findDuplicate returns a matching invoice by vendor and amount", async () => {
    const existing = sampleInvoice({
      id: "inv-dup",
      vendor: "Acme Corp",
      amount: 50000,
    });
    await store.save(existing);

    const duplicate = await store.findDuplicate(
      "huglo:user:alice",
      "Acme Corp",
      50000,
    );
    expect(duplicate).toEqual(existing);
  });

  it("findDuplicate returns null when no match exists", async () => {
    await store.save(sampleInvoice({ vendor: "Acme Corp", amount: 50000 }));

    const duplicate = await store.findDuplicate(
      "huglo:user:alice",
      "Other Vendor",
      99999,
    );
    expect(duplicate).toBeNull();
  });
});
