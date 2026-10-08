"use client";
import { useActionState, useTransition } from "react";
import { removeExam, setExamEnabled, uploadExam } from "@/lib/actions/exams";
import type { ExamSummary } from "@/lib/schemas";

export function AdminPanel({ exams }: { exams: ExamSummary[] }) {
  const [state, formAction, uploading] = useActionState(uploadExam, { ok: false, message: "" });
  const [pending, start] = useTransition();

  return (
    <>
      <h2>Subir exámenes (JSON)</h2>
      <form action={formAction} className="card">
        <input type="file" name="files" accept=".json,application/json" multiple />{" "}
        <button className="btn pri" disabled={uploading}>{uploading ? "Subiendo…" : "Subir"}</button>
        <p className="meta">Los exámenes nuevos quedan deshabilitados (borrador) hasta que los habilites. Si el JSON trae un <code>id</code> existente, se actualiza.</p>
        {state.message && <div className={`msg ${state.ok ? "ok" : "err"}`}>{state.message}</div>}
      </form>

      <h2>Exámenes</h2>
      <div className="card scroll">
        <table>
          <thead><tr><th>Título</th><th>Preguntas</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id}>
                <td>{e.title}<div className="meta">{e.id}</div></td>
                <td>{e.questionCount}</td>
                <td><span className={`pill ${e.enabled ? "g" : "b"}`}>{e.enabled ? "HABILITADO" : "BORRADOR"}</span></td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button className="btn sm" disabled={pending} onClick={() => start(() => setExamEnabled(e.id, !e.enabled))}>{e.enabled ? "Inhabilitar" : "Habilitar"}</button>{" "}
                  <button className="btn sm" disabled={pending} onClick={() => confirm("¿Eliminar este examen?") && start(() => removeExam(e.id))}>✕</button>
                </td>
              </tr>
            ))}
            {!exams.length && <tr><td colSpan={4} className="meta">Aún no hay exámenes.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
