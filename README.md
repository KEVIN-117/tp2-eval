# TP2 // Evaluaciones (Next.js + Firebase)

## Arquitectura
```
Navegador ──(Server Actions: enviar examen, subir/habilitar/eliminar)──▶ Next.js (servidor) ──Admin SDK──▶ Firestore
          ──(Firebase Auth SDK solo para login)──▶ /api/auth/session ──▶ cookie httpOnly (session cookie)
          ──(GET /api/exams, /api/exams/[id])──▶ lectura vía API
```
- **Firestore con reglas `deny all`**: el cliente no toca la DB; todo pasa por el servidor.
- **Capas**: `lib/services` (acceso a datos, `server-only`) → `lib/actions` (mutaciones, validan rol) y `app/api` (lecturas/sesión).
- **Anti-trampa**: al rendir, el navegador recibe el examen sin `answer` ni `explanation`; la nota se calcula en el servidor (`gradeAttempt`).
- **Roles**: custom claim `admin` (Firebase Auth). Se verifica en el layout/página y otra vez en cada Server Action.
- **Colecciones**: `exams/{id}` (`title, subject, description, questions[], enabled, createdAt, updatedAt, updatedBy`) y `attempts/{id}` (`uid, examId, examTitle, score, total, answers[], questions[] (snapshot), createdAt`).

## Puesta en marcha
1. `npx create-next-app@latest` no es necesario: este proyecto ya incluye la config. Ejecuta `npm install`.
2. En Firebase: crea proyecto → habilita **Authentication (Google)** y **Firestore** → crea una **cuenta de servicio** (clave privada).
3. `cp .env.example .env.local` y completa los valores.
4. Despliega `firestore.rules` (`firebase deploy --only firestore:rules`).
5. `npm run dev`, inicia sesión una vez con tu cuenta y luego: `npm run set-admin -- tu@correo.com`. Vuelve a iniciar sesión.
6. En `/admin` sube `data/sis211-parcial2-g2.json` y habilítalo.

## Formato JSON del examen
`{ id?, title, subject?, description?, questions: [{ prompt, code?, options[2..8], answer (índice desde 0), explanation? }] }`
