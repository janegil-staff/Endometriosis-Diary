// src/app/dashboard/page.js
"use client";

import CalendarCard from "@/components/dashboard/CalendarCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { usePatient } from "@/components/dashboard/usePatient";
import { useLocale } from "@/components/LocaleProvider";

export default function DashboardPage() {
  const { patient, close } = usePatient();
  const { t } = useLocale();

  if (!patient) return null;

  return (
    <div className="min-h-screen pb-12">
      <DashboardHeader patient={patient} onClose={close} />

      {/* Calendar on the left, the rest on the right (stacked on small screens), like the other sites */}
      <main className="mx-auto mt-6 grid max-w-md gap-6 px-4 lg:max-w-[62rem] lg:grid-cols-2 lg:items-start">
        <CalendarCard patient={patient} />
        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_10px_30px_-18px_rgba(160,40,50,0.45)] backdrop-blur">
            <p className="text-slate-600">{t.DASH_COMING_SOON}</p>
          </section>
        </aside>
      </main>
    </div>
  );
}
