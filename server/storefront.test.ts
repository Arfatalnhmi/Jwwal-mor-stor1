import { describe, expect, it } from "vitest";
import { calculateOrderTotal, formatSar } from "../shared/store";

describe("storefront pricing", () => {
  it("calculates subtotal, VAT, shipping, and total for a small order", () => {
    expect(calculateOrderTotal([{ price: 100, quantity: 2 }])).toEqual({
      subtotal: 200,
      vat: 30,
      shipping: 29,
      total: 259,
    });
  });

  it("waives shipping for orders at or above the free-shipping threshold", () => {
    expect(calculateOrderTotal([{ price: 299, quantity: 1 }])).toMatchObject({
      subtotal: 299,
      shipping: 0,
      total: 343.85,
    });
  });

  it("formats Saudi Riyal values for the storefront", () => {
    expect(formatSar(3299)).toContain("٣٬٢٩٩");
    expect(formatSar(3299)).toContain("ر.س");
  });
});
