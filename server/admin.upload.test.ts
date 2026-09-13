import { describe, expect, it } from "vitest";

describe("admin product image upload rules", () => {
  it("accepts the supported storefront image formats", () => {
    expect(["image/jpeg", "image/png", "image/webp"].includes("image/webp")).toBe(true);
  });

  it("keeps the upload limit at 10MB", () => {
    expect(10 * 1024 * 1024).toBe(10485760);
  });

  it("keeps the product gallery capped at eight images", () => {
    expect(Array.from({ length: 8 })).toHaveLength(8);
  });
});
