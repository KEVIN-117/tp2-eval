import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

async function test() {
  try {
    const snap = await db.collection("exams").get();
    console.log("Success! Docs:", snap.docs.length);
  } catch (e: any) {
    console.log(e);
    console.log("Code:", e.code);
    console.log("Details:", e.details);
  }
}
test();
