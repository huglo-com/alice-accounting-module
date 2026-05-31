import { describe, it, expect } from "vitest";
import {
  InvoiceInputSchema,
  InvoiceSchema,
} from "../src/lib/schemas.js";

describe("InvoiceInputSchema", () => {
  it("accepts a valid invoice input", () => {
    const result = InvoiceInputSchema.safeParse({
      vendor: "Acme Corp",
      amount: 50000,
      currency: "USD",
      description: "Consulting",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty vendor", () => {
    const result = InvoiceInputSchema.safeParse({
      vendor: "",
      amount: 50000,
      currency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer amount", () => {
    const result = InvoiceInputSchema.safeParse({
      vendor: "Acme Corp",
      amount: 50.5,
      currency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects currency that is not exactly 3 characters", () => {
    const result = InvoiceInputSchema.safeParse({
      vendor: "Acme Corp",
      amount: 50000,
      currency: "US",
    });
    expect(result.success).toBe(false);
  });
});

describe("InvoiceSchema", () => {
  it("parses a full invoice record", () => {
    const result = InvoiceSchema.safeParse({
      id: "inv-abc12345",
      vendor: "Acme Corp",
      amount: 50000,
      currency: "USD",
      description: "Consulting",
      status: "draft",
      subject: "huglo:user:alice",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = InvoiceSchema.safeParse({
      id: "inv-abc12345",
      vendor: "Acme Corp",
      amount: 50000,
      currency: "USD",
      status: "paid",
      subject: "huglo:user:alice",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
