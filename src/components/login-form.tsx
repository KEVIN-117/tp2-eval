"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true); setErr("");
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      if (!res.ok) throw new Error();
      await signOut(auth); // la sesión real vive en la cookie httpOnly del servidor
      router.replace("/"); router.refresh();
    } catch { setErr("No se pudo iniciar sesión."); } finally { setBusy(false); }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <button className="btn pri" onClick={signIn} disabled={busy}>{busy ? "Conectando…" : "Entrar con Google →"}</button>
      {err && <div className="msg err">{err}</div>}
    </div>
  );
}
