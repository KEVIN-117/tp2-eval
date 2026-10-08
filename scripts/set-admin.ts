// Uso: npm run set-admin -- correo@dominio.com   (el usuario debe volver a iniciar sesión)
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID!, clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n") }) });

const email = process.argv[2];
if (!email) { console.error("Falta el correo"); process.exit(1); }
const auth = getAuth();
async function main() {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  await auth.revokeRefreshTokens(user.uid);
  console.log(`✔ ${email} ahora es admin`);
}
main().catch(console.error);
