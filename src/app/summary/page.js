"use client";
import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";
import { parseInitialState } from "@/lib/summary/dateHelpers";
import {
  buildPainTrend,
  buildFlareData,
  buildActivityData,
  buildPeriodData,
  buildSleepData,
  buildMedUsage,
  buildPainStats,
} from "@/lib/summary/summaryStats";
import { SummaryHeader } from "@/components/summary/SummaryHeader";
import {
  PainOverviewCard,
  PainTrendCard,
  FlareUpCard,
  PeriodCard,
  ActivityCard,
  SleepCard,
  MedicineCard,
} from "@/components/summary/SummaryCards";
import { Card } from "@/components/summary/Card";

export default function SummaryPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [state, setState] = useState({
    patient: null,
    viewYear: null,
    viewMonth: null,
  });
  const { patient, viewYear, viewMonth } = state;

  useEffect(() => {
    const parsed = parseInitialState();
    if (!parsed.patient) {
      router.replace("/");
      return;
    }
    startTransition(() => setState(parsed));
  }, [router]);

  if (!patient) return null;

  const allRecords = [...(patient.records ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const pad = (n) => String(n).padStart(2, "0");
  const vy = viewYear ?? new Date().getFullYear();
  const vm = viewMonth ?? new Date().getMonth();
  const monthKey = `${vy}-${pad(vm + 1)}`;

  const records = allRecords.filter((r) => r.date.startsWith(monthKey));

  const months = t.monthNames ?? [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () =>
    setState((s) =>
      s.viewMonth === 0
        ? { ...s, viewMonth: 11, viewYear: s.viewYear - 1 }
        : { ...s, viewMonth: s.viewMonth - 1 },
    );
  const nextMonth = () =>
    setState((s) =>
      s.viewMonth === 11
        ? { ...s, viewMonth: 0, viewYear: s.viewYear + 1 }
        : { ...s, viewMonth: s.viewMonth + 1 },
    );

  const hasPrev = allRecords.some((r) => r.date < monthKey);
  const hasNext = allRecords.some((r) => r.date > monthKey + "-31");

  // Build data
  const painTrend = buildPainTrend(records, t);
  const flareData = buildFlareData(records, t);
  const activityData = buildActivityData(records, t);
  const periodData = buildPeriodData(records);
  const sleepData = buildSleepData(records);
  const medList = buildMedUsage(records, patient);
  const {
    avgPain,
    minPain,
    maxPain,
    flareUps,
    periodDays,
    light,
    medium,
    heavy,
    extreme,
    medicineDays,
  } = buildPainStats(records);

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
        onBack={() => router.push("/dashboard")}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <PainOverviewCard
            t={t}
            avgPain={avgPain}
            minPain={minPain}
            maxPain={maxPain}
            flareUps={flareUps}
            periodDays={periodDays}
            recordsCount={records.length}
            light={light}
            medium={medium}
            heavy={heavy}
            extreme={extreme}
            medicineDays={medicineDays}
          />

          <PainTrendCard
            t={t}
            painTrend={painTrend}
            months={months}
            vm={vm}
            vy={vy}
          />

          {records.length === 0 && (
            <Card title={t.summaryTab ?? "Summary"}>
              <p
                className="text-sm text-center py-4"
                style={{ color: "#b07a70" }}
              >
                {t.noEntries ?? "No entries this month."}
              </p>
            </Card>
          )}

          <FlareUpCard
            t={t}
            flareData={flareData}
            months={months}
            vm={vm}
            vy={vy}
          />

          <PeriodCard
            t={t}
            periodData={periodData}
            months={months}
            vm={vm}
            vy={vy}
          />

          <ActivityCard t={t} activityData={activityData} />

          <SleepCard t={t} sleepData={sleepData} />

          <MedicineCard t={t} medList={medList} recordsCount={records.length} />
        </div>
      </main>
    </div>
  );
}
