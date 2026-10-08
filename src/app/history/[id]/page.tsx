import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAttempt } from "@/lib/services/exams";
import { Rich } from "@/components/rich";

const L = "ABCDEFGH";

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const a = await getAttempt(user.uid, (await params).id);
  if (!a) notFound();
  const p = Math.round((a.score / a.total) * 100);
  return (
    <>
      <div className="meta">{a.examTitle} · {new Date(a.createdAt).toLocaleString("es")}</div>
      <div className="score">{a.score}<small>/{a.total}</small></div>
      <p className="lead"><span className={`pill ${p >= 51 ? "g" : "b"}`}>{p}%</span> {p >= 51 ? "Aprobado." : "Sigue practicando: revisa las explicaciones."}</p>
      <div className="row" style={{ padding: "0 0 10px" }}>
        <Link className="btn pri" href={`/exam/${a.examId}`}>Reintentar</Link><Link className="btn" href="/history">Historial</Link>
      </div>
      <h2>Revisión</h2>
      {a.questions.map((q, i) => {
        const given = a.answers[i], ok = given === q.answer;
        return (
          <div key={i} className="card rev">
            <div className="qn">{i + 1} · <span style={{ color: `var(${ok ? "--ok" : "--bad"})` }}>{ok ? "CORRECTA" : given === null ? "SIN RESPONDER" : "INCORRECTA"}</span></div>
            <div className="q" style={{ fontSize: 18 }}><Rich text={q.prompt} /></div>
            {q.code && <pre>{q.code}</pre>}
            <div className="opts">
              {q.options.map((o, k) => (
                <div key={k} className={`opt ${k === q.answer ? "right" : k === given ? "wrong" : ""}`} style={{ cursor: "default" }}>
                  <span className="k">{L[k]}</span><span><Rich text={o} /></span>
                </div>
              ))}
            </div>
            {q.explanation && <div className="note"><Rich text={q.explanation} /></div>}
          </div>
        );
      })}
    </>
  );
}
