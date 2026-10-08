"use server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth";
import { examInputSchema } from "@/lib/schemas";
import { deleteExam, gradeAttempt, saveExam, setEnabled } from "@/lib/services/exams";

export type FormState = { ok: boolean; message: string };

export async function submitAttempt(examId: string, answers: (number | null)[]) {
  const user = await requireUser();
  const id = await gradeAttempt(user.uid, examId, answers);
  revalidatePath("/history");
  return id;
}

export async function uploadExam(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, message: "Selecciona al menos un archivo JSON." };

  const errors: string[] = [];
  let ok = 0;
  for (const f of files) {
    try {
      if (f.size > 1_000_000) throw new Error("supera 1 MB");
      await saveExam(examInputSchema.parse(JSON.parse(await f.text())), admin.uid);
      ok++;
    } catch (e) {
      const detail = e instanceof ZodError ? `${e.issues[0].path.join(".")}: ${e.issues[0].message}` : e instanceof Error ? e.message : "error";
      errors.push(`${f.name} → ${detail}`);
    }
  }
  revalidatePath("/"); revalidatePath("/admin");
  return { ok: !errors.length, message: [ok && `${ok} examen(es) subido(s) como borrador.`, ...errors].filter(Boolean).join(" · ") };
}

export async function setExamEnabled(id: string, enabled: boolean) {
  await requireAdmin();
  await setEnabled(id, enabled);
  revalidatePath("/"); revalidatePath("/admin");
}

export async function removeExam(id: string) {
  await requireAdmin();
  await deleteExam(id);
  revalidatePath("/"); revalidatePath("/admin");
}
