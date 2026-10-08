import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth";

const EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const { idToken } = await req.json().catch(() => ({}));
  if (typeof idToken !== "string") return NextResponse.json({ error: "idToken requerido" }, { status: 400 });
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    // Solo se emite cookie si el login es reciente (evita canjear tokens viejos)
    if (Date.now() / 1000 - decoded.auth_time > 300) return NextResponse.json({ error: "Login reciente requerido" }, { status: 401 });
    const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_MS });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: EXPIRES_MS / 1000 });
    return res;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
