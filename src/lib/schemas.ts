import { z } from "zod";

export const questionSchema = z
  .object({
    prompt: z.string().min(1),
    code: z.string().optional(),
    options: z.array(z.string().min(1)).min(2).max(8),
    answer: z.number().int().min(0),
    explanation: z.string().optional().default(""),
  })
  .refine((q) => q.answer < q.options.length, { message: "answer fuera de rango", path: ["answer"] });

export const examInputSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{3,60}$/, "id: minúsculas, números y guiones").optional(),
  title: z.string().min(1).max(120),
  subject: z.string().default(""),
  description: z.string().default(""),
  questions: z.array(questionSchema).min(1).max(200),
});

export type Question = z.infer<typeof questionSchema>;
export type ExamInput = z.infer<typeof examInputSchema>;

/** Lo que recibe el navegador al rendir: SIN respuestas correctas ni explicaciones. */
export type PublicExam = {
  id: string; title: string; subject: string; description: string;
  questions: { prompt: string; code?: string; options: string[] }[];
};
export type ExamSummary = {
  id: string; title: string; subject: string; description: string;
  enabled: boolean; questionCount: number; createdAt: number;
};
export type AttemptSummary = {
  id: string; examId: string; examTitle: string; score: number; total: number; createdAt: number;
};
export type Attempt = AttemptSummary & { uid: string; answers: (number | null)[]; questions: Question[] };
