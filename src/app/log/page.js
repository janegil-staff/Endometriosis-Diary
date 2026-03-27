"use client";
import { useEffect, useState, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";
import { filterRecords } from "@/lib/log/logHelpers";
import { LogHeader } from "@/components/log/LogHeader";
import { LogSearch } from "@/components/log/LogSearch";
import { RecordList } from "@/components/log/RecordList";

const PAGE_SIZE = 20;

export default function LogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [patient, setPatient] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchState, setSearchState] = useState({
    query: "",
    visibleCount: PAGE_SIZE,
  });
  const sentinelRef = useRef(null);

  const search = searchState.query;
  const visibleCount = searchState.visibleCount;

  const setSearch = (q) =>
    setSearchState({ query: q, visibleCount: PAGE_SIZE });

  const setVisibleCount = (updater) =>
    setSearchState((prev) => ({
      ...prev,
      visibleCount:
        typeof updater === "function" ? updater(prev.visibleCount) : updater,
    }));

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) {
      router.replace("/");
      return;
    }
    startTransition(() => setPatient(JSON.parse(raw)));
  }, [router]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setVisibleCount((prev) => prev + PAGE_SIZE);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [patient]);

  if (!patient) return null;

  const records = [...(patient.records ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const filtered = filterRecords(records, search, patient, t);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleToggle = (date) =>
    setExpandedDate((prev) => (prev === date ? null : date));

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
      <LogHeader
        t={t}
        filteredCount={filtered.length}
        onBack={() => router.push("/dashboard")}
        onPdfOpen={() => {}}
      />

      <LogSearch t={t} search={search} onSearch={setSearch} />

      <main className="flex-1 px-6 py-4 max-w-3xl mx-auto w-full pb-12">
        <RecordList
          t={t}
          visible={visible}
          filtered={filtered}
          patient={patient}
          expandedDate={expandedDate}
          onToggle={handleToggle}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          PAGE_SIZE={PAGE_SIZE}
        />
      </main>
    </div>
  );
}
