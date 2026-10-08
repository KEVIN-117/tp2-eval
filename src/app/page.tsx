import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listExams } from "@/lib/services/exams";
import { ExamListener } from "@/components/exam-listener";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, exams] = await Promise.all([getSession(), listExams(true)]);
  return (
    <>
      <ExamListener />
      <h1>Evalúate. <em>Mide</em> tu avance.</h1>
      <p className="lead">Exámenes de Técnicas de Programación II. {session ? "Elige uno para comenzar." : "Inicia sesión para rendirlos y guardar tu historial."}</p>
      <h2>Exámenes disponibles</h2>
      <div className="grid">
        {exams.map((e) => (
          <div key={e.id} className="card exam">
            <span className="meta">{e.subject || "Examen"} · {e.questionCount} preguntas</span>
            <h3>{e.title}</h3>
            <span className="meta" style={{ fontFamily: "var(--sans)", fontSize: 14 }}>{e.description}</span>
            <div className="row"><Link className="btn pri sm" href={`/exam/${e.id}`}>Comenzar</Link></div>
          </div>
        ))}
        {!exams.length && <p className="meta">No hay exámenes habilitados por ahora.</p>}
      </div>
    </>
  );
}
