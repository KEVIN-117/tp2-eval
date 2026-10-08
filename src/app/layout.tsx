import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import "./globals.css";

export const metadata: Metadata = { title: "TP2 // Evaluaciones" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <html lang="es">
      <body>
        <div className="wrap">
          <header className="top">
            <Link href="/" className="logo"><b>TP2</b><i>//</i>EVAL</Link>
            <nav className="who">
              {s ? (<>
                <Link href="/history">Historial</Link>
                {s.admin && <Link href="/admin">Admin</Link>}
                <span>{s.name}</span><LogoutButton />
              </>) : <Link href="/login">Entrar</Link>}
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
