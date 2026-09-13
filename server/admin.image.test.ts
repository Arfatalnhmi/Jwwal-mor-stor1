import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("catalog image permissions", () => {
  it("rejects image deletion for a regular user", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 3,
        openId: "regular-image-user",
        name: "Regular User",
        email: "regular@example.com",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    await expect(caller.catalog.updateProductImage({ id: 1, imageUrl: null })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.catalog.updateProductGallery({ id: 1, galleryUrls: Array.from({ length: 9 }, (_, index) => `image-${index}`) })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
