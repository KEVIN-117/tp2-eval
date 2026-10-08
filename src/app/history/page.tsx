import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listAttempts } from "@/lib/services/exams";

export default async function History() {
  const user = await requireUser();
  const items = await listAttempts(user.uid);
  const best = items.length ? Math.max(...items.map((a) => Math.round((a.score / a.total) * 100))) : null;
  return (
    <>
      <h1>Tu <em>historial</em></h1>
      <div className="stats card">
        <div className="stat"><b>{items.length}</b><span>Rendidos</span></div>
        <div className="stat"><b>{best === null ? "—" : `${best}%`}</b><span>Mejor nota</span></div>
      </div>
      <h2>Intentos</h2>
      <div className="card scroll">
        <table>
          <thead><tr><th>Examen</th><th>Fecha</th><th>Nota</th><th /></tr></thead>
          <tbody>
            {items.map((a) => {
              const p = Math.round((a.score / a.total) * 100);
              return (
                <tr key={a.id}>
                  <td>{a.examTitle}</td>
                  <td className="meta">{new Date(a.createdAt).toLocaleString("es")}</td>
                  <td><span className={`pill ${p >= 51 ? "g" : "b"}`}>{a.score}/{a.total} · {p}%</span></td>
                  <td style={{ textAlign: "right" }}><Link className="btn sm" href={`/history/${a.id}`}>Revisar</Link></td>
                </tr>
              );
            })}
            {!items.length && <tr><td colSpan={4} className="meta">Todavía no rendiste ningún examen.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
