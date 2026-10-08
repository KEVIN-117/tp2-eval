import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "__session";
export type SessionUser = { uid: string; name: string; admin: boolean };

/** Verifica la cookie de sesión (con revocación). Cacheado por request. */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const d = await adminAuth.verifySessionCookie(value, true);
    return { uid: d.uid, name: d.name ?? d.email ?? "Estudiante", admin: d.admin === true };
  } catch {
    return null;
  }
});

export async function requireUser() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

/** El rol sale del custom claim `admin` firmado por Firebase, no de un dato editable por el usuario. */
export async function requireAdmin() {
  const s = await requireUser();
  if (!s.admin) redirect("/");
  return s;
}
