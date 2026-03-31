"use client";
import { useEffect, useState, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";
import { parseInitialState } from "@/lib/summary/dateHelpers";
import {
  buildPainTrend,
  buildPeriodData,
  buildActivityData,
  buildSleepData,
  buildMedUsage,
} from "@/lib/summary/summaryStats";
import { SummaryHeader } from "@/components/summary/SummaryHeader";
import {
  PainTrendCard,
  OverviewCard,
  PeriodCard,
  ActivityCard,
  SleepCard,
  MedicineCard,
  MedicineEffectivenessCard,
} from "@/components/summary/SummaryCards";
import { Card } from "@/components/summary/Card";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildMonthKeys(vy, vm, monthRange) {
  const pad  = (n) => String(n).padStart(2, "0");
  const keys = [];
  for (let i = monthRange - 1; i >= 0; i--) {
    const d = new Date(vy, vm - i, 1);
    keys.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }
  return keys;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SummaryPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [state, setState] = useState({
    patient:    null,
    viewYear:   null,
    viewMonth:  null,
    monthRange: 1,
  });

  const { patient, viewYear, viewMonth, monthRange } = state;

  useEffect(() => {
    const parsed = parseInitialState();
    if (!parsed.patient) { router.replace("/"); return; }
    const saved = parseInt(localStorage.getItem("endo_summary_range") ?? "1", 10);
    const monthRange = !isNaN(saved) && saved >= 1 && saved <= 12 ? saved : 1;
    startTransition(() =>
      setState((s) => ({ ...s, ...parsed, monthRange }))
    );
  }, [router]);

  const allRecords = useMemo(
    () => [...(patient?.records ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patient],
  );

  const vy = viewYear  ?? new Date().getFullYear();
  const vm = viewMonth ?? new Date().getMonth();

  const monthKeys = buildMonthKeys(vy, vm, monthRange);

  const records = useMemo(
    () => allRecords.filter((r) => monthKeys.some((key) => r.date.startsWith(key))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allRecords, vy, vm, monthRange],
  );

  if (!patient) return null;

  const months = t.monthNames ?? [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const step = monthRange;

  const prevMonth = () =>
    setState((s) => {
      const d = new Date(
        s.viewYear  ?? new Date().getFullYear(),
        (s.viewMonth ?? new Date().getMonth()) - step,
        1,
      );
      return { ...s, viewYear: d.getFullYear(), viewMonth: d.getMonth() };
    });

  const nextMonth = () =>
    setState((s) => {
      const d = new Date(
        s.viewYear  ?? new Date().getFullYear(),
        (s.viewMonth ?? new Date().getMonth()) + step,
        1,
      );
      return { ...s, viewYear: d.getFullYear(), viewMonth: d.getMonth() };
    });

  const firstKey = monthKeys[0];
  const lastKey  = monthKeys[monthKeys.length - 1];
  const hasPrev  = allRecords.some((r) => r.date < firstKey);
  const hasNext  = allRecords.some((r) => r.date.slice(0, 7) > lastKey);

  const painTrend    = buildPainTrend(records, t);
  const periodData   = buildPeriodData(records);
  const activityData = buildActivityData(records, t);
  const sleepData    = buildSleepData(records);
  const medList      = buildMedUsage(records, patient.medicines ?? []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background-endo.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <SummaryHeader
        t={t}
        months={months}
        vm={vm}
        vy={vy}
        hasPrev={hasPrev}
        hasNext={hasNext}
        recordsCount={records.length}
        monthRange={monthRange}
        onRangeChange={(n) => { localStorage.setItem("endo_summary_range", n); setState((s) => ({ ...s, monthRange: n })); }}
        onBack={() => router.push("/dashboard")}
        onPrev={prevMonth}
        onNext={nextMonth}
        allRecords={allRecords}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          {records.length === 0 ? (
            <Card title={t.summaryTab ?? "Summary"}>
              <p className="text-sm text-center py-4" style={{ color: "#b07a70" }}>
                {t.noEntries ?? "No entries this period."}
              </p>
            </Card>
          ) : (
            <>
              <OverviewCard t={t} records={records} />

              <PainTrendCard
                t={t}
                painTrend={painTrend}
                months={months}
                vm={vm}
                vy={vy}
                monthRange={monthRange}
              />

              <PeriodCard
                t={t}
                periodData={periodData}
                months={months}
                vm={vm}
                vy={vy}
                monthRange={monthRange}
              />

              <ActivityCard t={t} activityData={activityData} />

              <SleepCard t={t} sleepData={sleepData} />

              <MedicineEffectivenessCard
                t={t}
                records={records}
                medicines={patient.medicines ?? []}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}