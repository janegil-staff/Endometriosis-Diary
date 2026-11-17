// src/components/dashboard/usePatient.js
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "patientSession";

// The patient opened with the one-time code (kept in sessionStorage), shared by the dashboard pages.
//
// `session` is a new id for every login. Next (cacheComponents) keeps the dashboard alive
// in the background after "Log out", so state like the calendar month would survive into
// the next login. Keying the dashboard content on `session` starts it fresh each time,
// while moving between dashboard pages within the same login keeps the same id.
export function usePatient() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem("patient"));
    } catch {}
    if (!stored) {
      setPatient(null);
      router.replace("/"); // no valid code used → back to landing
      return;
    }

    let id = null;
    try {
      id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(SESSION_KEY, id);
      }
    } catch {
      id = String(Date.now());
    }

    setSession(id);
    setPatient(stored);
  }, [router]);

  const close = useCallback(() => {
    try {
      sessionStorage.removeItem("patient");
      sessionStorage.removeItem("screening"); // opened from a /[lang]/screening link
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setPatient(null);
    setSession(null);
    router.replace("/"); // replace: Back shouldn't return to a closed patient
  }, [router]);

  return { patient, session, close };
}
