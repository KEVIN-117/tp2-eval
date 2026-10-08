"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function ExamListener() {
  const router = useRouter();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const d = doc(db, "metadata", "exams");
    
    const unsubscribe = onSnapshot(d, (snapshot) => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }
      
      router.refresh();
    }, (error) => {
      if (error.code !== "not-found") {
        console.error("Error listening to exams metadata:", error);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
