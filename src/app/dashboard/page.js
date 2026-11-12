// src/app/dashboard/page.js
"use client";

import CalendarCard from "@/components/dashboard/CalendarCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { usePatient } from "@/components/dashboard/usePatient";

export default function DashboardPage() {
  const { patient, close } = usePatient();

  if (!patient) return null;

  return (
    <div className="min-h-screen pb-12">
      <DashboardHeader patient={patient} onClose={close} />

      {/* Calendar on the left, the rest on the right (stacked on small screens), like the other sites */}
      <main className="mx-auto mt-6 grid max-w-md gap-6 px-4 lg:max-w-[62rem] lg:grid-cols-2 lg:items-start">
        <CalendarCard patient={patient} />
        <aside className="space-y-6">
          <SummaryCard patient={patient} />
        </aside>
      </main>
    </div>
  );
}
