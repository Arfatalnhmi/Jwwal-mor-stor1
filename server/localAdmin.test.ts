import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { authenticateLocalAdmin } from "./_core/localAdmin";
import type { TrpcContext } from "./_core/context";

function createContext() {
  let token = "";
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
    res: {
      cookie: (_name: string, value: string) => { token = value; },
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
  return { ctx, getToken: () => token };
}

describe("local admin login", () => {
  it("accepts the configured admin secret and creates an authenticated admin session", async () => {
    const { ctx, getToken } = createContext();
    const caller = appRouter.createCaller(ctx);
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword) throw new Error("ADMIN_PASSWORD must be configured for this test");
    await expect(caller.auth.localLogin({ username: "admin", password: configuredPassword })).resolves.toEqual({ success: true });
    expect(getToken()).toBeTruthy();
    const authenticated = await authenticateLocalAdmin({ protocol: "https", cookies: { jawwal_admin_session: getToken() } } as never);
    expect(authenticated?.role).toBe("admin");
    expect(authenticated?.name).toBe("admin");
  });

  it("rejects an incorrect password", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.auth.localLogin({ username: "admin", password: "wrong-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
