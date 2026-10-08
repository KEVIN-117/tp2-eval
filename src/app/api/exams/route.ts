import { NextResponse } from "next/server";
import { listExams } from "@/lib/services/exams";

// Lista pública de exámenes habilitados (sin preguntas).
export async function GET() {
  const exams = await listExams(true);
  return NextResponse.json(exams.map(({ id, title, subject, description, questionCount }) => ({ id, title, subject, description, questionCount })));
}
