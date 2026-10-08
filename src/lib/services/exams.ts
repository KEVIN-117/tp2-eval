import "server-only";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import type { Attempt, AttemptSummary, ExamInput, ExamSummary, PublicExam } from "@/lib/schemas";

const exams = db.collection("exams");
const attempts = db.collection("attempts");

const toSummary = (d: DocumentSnapshot): ExamSummary => {
  const x = d.data()!;
  return { id: d.id, title: x.title, subject: x.subject, description: x.description,
    enabled: x.enabled, questionCount: x.questions.length, createdAt: x.createdAt };
};

export async function listExams(onlyEnabled = true): Promise<ExamSummary[]> {
  try {
    const snap = onlyEnabled ? await exams.where("enabled", "==", true).get() : await exams.get();
    return snap.docs.map(toSummary).sort((a, b) => b.createdAt - a.createdAt);
  } catch (e: any) {
    if (e.code === 5) return []; // 5 NOT_FOUND: Database might not be created yet
    throw e;
  }
}

export async function getPublicExam(id: string): Promise<PublicExam | null> {
  const snap = await exams.doc(id).get();
  const x = snap.data();
  if (!x?.enabled) return null;
  return {
    id: snap.id, title: x.title, subject: x.subject, description: x.description,
    questions: (x.questions as ExamInput["questions"]).map(({ prompt, code, options }) => ({ prompt, code, options })),
  };
}

export async function saveExam(input: ExamInput, uid: string) {
  const ref = input.id ? exams.doc(input.id) : exams.doc();
  const prev = (await ref.get()).data();
  const now = Date.now();
  // JSON round-trip: Firestore no acepta `undefined`.
  await ref.set(JSON.parse(JSON.stringify({
    title: input.title, subject: input.subject, description: input.description, questions: input.questions,
    enabled: prev?.enabled ?? false, // los nuevos quedan como borrador
    createdAt: prev?.createdAt ?? now, updatedAt: now, updatedBy: uid,
  })));
  await db.doc("metadata/exams").set({ lastUpdated: now }, { merge: true });
  return ref.id;
}

export const setEnabled = async (id: string, enabled: boolean) => {
  await exams.doc(id).update({ enabled, updatedAt: Date.now() });
  await db.doc("metadata/exams").set({ lastUpdated: Date.now() }, { merge: true });
};
export const deleteExam = async (id: string) => {
  await exams.doc(id).delete();
  await db.doc("metadata/exams").set({ lastUpdated: Date.now() }, { merge: true });
};

/** La calificación ocurre en el servidor: el cliente nunca ve las respuestas antes de enviar. */
export async function gradeAttempt(uid: string, examId: string, answers: (number | null)[]) {
  const snap = await exams.doc(examId).get();
  const x = snap.data();
  if (!x?.enabled) throw new Error("Examen no disponible");
  const qs = x.questions as ExamInput["questions"];
  const valid = Array.isArray(answers) && answers.length === qs.length &&
    answers.every((a, i) => a === null || (Number.isInteger(a) && a >= 0 && a < qs[i].options.length));
  if (!valid) throw new Error("Respuestas inválidas");
  const score = qs.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  const ref = await attempts.add({ uid, examId, examTitle: x.title, score, total: qs.length, answers, questions: qs, createdAt: Date.now() });
  return ref.id;
}

export async function listAttempts(uid: string): Promise<AttemptSummary[]> {
  try {
    const snap = await attempts.where("uid", "==", uid).get();
    return snap.docs
      .map((d) => { const x = d.data(); return { id: d.id, examId: x.examId, examTitle: x.examTitle, score: x.score, total: x.total, createdAt: x.createdAt }; })
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (e: any) {
    if (e.code === 5) return []; // 5 NOT_FOUND
    throw e;
  }
}

export async function getAttempt(uid: string, id: string): Promise<Attempt | null> {
  const snap = await attempts.doc(id).get();
  const x = snap.data();
  if (!x || x.uid !== uid) return null; // solo el dueño
  return { id: snap.id, ...(x as Omit<Attempt, "id">) };
}
