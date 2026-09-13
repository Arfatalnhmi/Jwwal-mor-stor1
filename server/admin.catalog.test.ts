import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("catalog admin protection", () => {
  it("rejects catalog management access for regular users", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 2,
        openId: "regular-user",
        name: "Regular User",
        email: "user@example.com",
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
    await expect(caller.catalog.adminProducts()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.catalog.updateBrand({ id: 1, name: "Blocked Brand", slug: "blocked-brand" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.catalog.updateCategory({ id: 1, name: "Blocked Category", slug: "blocked-category" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.catalog.updateProduct({ id: 1, name: "Blocked Product" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
