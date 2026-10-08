import { requireAdmin } from "@/lib/auth";
import { listExams } from "@/lib/services/exams";
import { AdminPanel } from "@/components/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin(); // defensa en profundidad: también se valida en cada Server Action
  return (<><h1>Panel <em>admin</em></h1><AdminPanel exams={await listExams(false)} /></>);
}
