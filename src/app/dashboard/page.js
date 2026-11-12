// src/app/dashboard/page.js
"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { usePatient } from "@/components/dashboard/usePatient";
import { useLocale } from "@/components/LocaleProvider";

// First version: the patient opens and the header shows who it is.
// The calendar and summaries (like on the headache site) come in the next step.
export default function DashboardPage() {
  const { patient, close } = usePatient();
  const { t } = useLocale();

  if (!patient) return null;

  return (
    <div className="min-h-screen pb-12">
      <DashboardHeader patient={patient} onClose={close} />
      <main className="mx-auto mt-8 max-w-md px-4 lg:max-w-[62rem]">
        <section className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_10px_30px_-18px_rgba(160,40,50,0.45)] backdrop-blur">
          <p className="text-slate-600">{t.DASH_COMING_SOON}</p>
        </section>
      </main>
    </div>
  );
}
