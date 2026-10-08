import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPublicExam } from "@/lib/services/exams";
import { ExamRunner } from "@/components/exam-runner";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const exam = await getPublicExam((await params).id);
  if (!exam) notFound();
  return <ExamRunner exam={exam} />;
}
