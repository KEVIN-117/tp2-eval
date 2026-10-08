import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return (<>
    <h1>Inicia
      <em>sesión</em>
    </h1>
    <p className="lead">Tu historial y puntajes quedan asociados a tu cuenta.</p>

    <LoginForm />

  </>);
}
