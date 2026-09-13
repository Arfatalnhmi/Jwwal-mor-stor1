import { jwtVerify, SignJWT } from "jose";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

export const LOCAL_ADMIN_COOKIE = "jawwal_admin_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function secretKey() {
  return new TextEncoder().encode(ENV.cookieSecret || "development-only-change-me");
}

export async function createLocalAdminSession() {
  return new SignJWT({ kind: "local-admin", username: ENV.adminUsername })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function authenticateLocalAdmin(req: Request): Promise<User | null> {
  const token = (req.cookies?.[LOCAL_ADMIN_COOKIE] as string | undefined) ?? parseCookieHeader(req.headers.cookie ?? "")[LOCAL_ADMIN_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "local-admin" || payload.username !== ENV.adminUsername) return null;
    const now = new Date();
    return {
      id: 0,
      openId: "local-admin",
      name: "admin",
      email: null,
      loginMethod: "local",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
  } catch {
    return null;
  }
}

export function localAdminCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: req.protocol === "https" || process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  };
}

export function clearLocalAdminCookieOptions(req: Request) {
  return { ...localAdminCookieOptions(req), maxAge: -1 };
}
