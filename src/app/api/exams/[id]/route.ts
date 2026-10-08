import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublicExam } from "@/lib/services/exams";

// Examen para rendir: requiere sesión y nunca incluye respuestas correctas.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const exam = await getPublicExam((await params).id);
  return exam ? NextResponse.json(exam) : NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
