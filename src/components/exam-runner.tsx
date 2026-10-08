"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAttempt } from "@/lib/actions/exams";
import type { PublicExam } from "@/lib/schemas";
import { Rich } from "./rich";

const L = "ABCDEFGH";

export function ExamRunner({ exam }: { exam: PublicExam }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<(number | null)[]>(() => Array(exam.questions.length).fill(null));
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const q = exam.questions[i];
  const last = i === exam.questions.length - 1;

  const finish = () => {
    const left = ans.filter((a) => a === null).length;
    if (left && !confirm(`Tienes ${left} pregunta(s) sin responder. ¿Finalizar de todas formas?`)) return;
    start(async () => {
      try { router.push(`/history/${await submitAttempt(exam.id, ans)}`); }
      catch { setErr("No se pudo enviar el examen. Intenta de nuevo."); }
    });
  };

  return (
    <>
      <div className="meta" style={{ marginBottom: 8 }}>{exam.title}</div>
      <div className="prog"><div style={{ width: `${((i + 1) / exam.questions.length) * 100}%` }} /></div>
      <div className="qn">PREGUNTA {i + 1} / {exam.questions.length}</div>
      <div className="q"><Rich text={q.prompt} /></div>
      {q.code && <pre>{q.code}</pre>}
      <div className="opts">
        {q.options.map((o, k) => (
          <button key={k} className={`opt ${ans[i] === k ? "sel" : ""}`} onClick={() => setAns((a) => a.map((v, j) => (j === i ? k : v)))}>
            <span className="k">{L[k]}</span><span><Rich text={o} /></span>
          </button>
        ))}
      </div>
      <div className="nav">
        <button className="btn" disabled={!i} onClick={() => setI(i - 1)}>← Anterior</button>
        {last
          ? <button className="btn pri" disabled={pending} onClick={finish}>{pending ? "Enviando…" : "Finalizar"}</button>
          : <button className="btn pri" onClick={() => setI(i + 1)}>Siguiente →</button>}
      </div>
      {err && <div className="msg err">{err}</div>}
    </>
  );
}
