"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePatient() {
  const router = useRouter();
  const [patient, setPatient] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("endo_patient");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!patient) {
      router.push("/");
    }
  }, [patient, router]);

  return patient;
}