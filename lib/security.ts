import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env, isDemoMode } from "./env";

const COOKIE = "wedding_admin";
const SESSION_DAYS = 30;

// Key is derived from the admin password, so changing the password signs everyone out.
const sessionKey = (password: string) => createHash("sha256").update(`wedding-admin-session:${password}`).digest();
const sign = (payload: string, password: string) => createHmac("sha256", sessionKey(password)).update(payload).digest("base64url");
const digest = (value: string) => createHash("sha256").update(value).digest();

export function verifyPassword(input: string, password = env.ADMIN_PASSWORD) {
  if (!password) return false;
  return timingSafeEqual(digest(input), digest(password));
}

export function createSessionToken(password: string, now = Date.now()) {
  const expires = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${sign(String(expires), password)}`;
}

export function verifySessionToken(token: string | undefined, password: string, now = Date.now()) {
  if (!token) return false;
  const [expires, mac] = token.split(".");
  if (!expires || !mac) return false;
  const expected = Buffer.from(sign(expires, password));
  const provided = Buffer.from(mac);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return false;
  return Number(expires) > now;
}

export async function setAdminSession() {
  if (!env.ADMIN_PASSWORD) return;
  const store = await cookies();
  store.set(COOKIE, createSessionToken(env.ADMIN_PASSWORD), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // No password configured: open while playing in demo mode, locked in production.
  if (!env.ADMIN_PASSWORD) return isDemoMode;
  return verifySessionToken((await cookies()).get(COOKIE)?.value, env.ADMIN_PASSWORD);
}
