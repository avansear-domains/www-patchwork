// Single-user gate for /cms: password is AVAN_KEY; a signed cookie keeps you logged in.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "cms";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const key = () => process.env.AVAN_KEY ?? "";
const token = () => createHmac("sha256", key()).update("cms-session").digest("hex");

const safeEq = (a: string, b: string) => {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export const cmsEnabled = () => key().length > 0;

export async function isAuthed() {
  if (!cmsEnabled()) return false;
  const c = (await cookies()).get(COOKIE)?.value ?? "";
  return safeEq(c, token());
}

export async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Not signed in");
}

export function checkKey(input: string) {
  return cmsEnabled() && safeEq(input, key());
}

export async function setSession() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/cms",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete({ name: COOKIE, path: "/cms" });
}
