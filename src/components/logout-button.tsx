"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button className="btn sm" onClick={async () => { await fetch("/api/auth/session", { method: "DELETE" }); router.replace("/login"); router.refresh(); }}>
      Salir
    </button>
  );
}
