"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";
import CalendarPanel from "@/components/dashboard/CalendarPanel";
import MonthlySidebar from "@/components/dashboard/MonthlySidebar";
import DayDetailDrawer from "@/components/dashboard/DayDetailDrawer";
import { translations } from "@/lib/translations";

function parsePatientData() {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("patientData");
  return raw ? JSON.parse(raw) : null;
}

const CHECKBOXES = [
  { key: "medicine", label: "Vis medisindager" },
  { key: "note",     label: "Vis notater"      },
  { key: "period",   label: "Vis menstruasjon" },
  { key: "activity", label: "Vis trening"      },
];

function Checkbox({ checked, label, onToggle }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 select-none text-left">
      <div
        className="flex items-center justify-center rounded flex-shrink-0 transition-all"
        style={{
          width: 14, height: 14,
          background: checked ? "#c97060" : "transparent",
          border: `1.5px solid ${checked ? "#c97060" : "rgba(201,112,96,0.4)"}`,
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 11, color: checked ? "#5a3a34" : "#b07a70", fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </button>
  );
}

export default function Dashboard() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const t        = translations[lang] ?? translations.en;

  const [patient, setPatient]               = useState(() => parsePatientData());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [menuOpen, setMenuOpen]             = useState(false);

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [selectedField, setSelectedField] = useState("intensity");
  const [show, setShow] = useState({
    period: true, flareUp: true, medicine: true,
    activity: true, sexPrevented: true, sleep: true, note: true,
  });
  const toggleShow = (key) => setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => { if (!patient) router.replace("/"); }, [patient, router]);
  if (!patient) return null;

  function handleDayClick(rec) {
    setSelectedRecord(rec ?? null);
    if (rec) setDrawerOpen(true);
  }

  const initials = patient.name
    ? patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const tabs = [
    { label: t.calendarTab ?? "Calendar", href: "/dashboard" },
    { label: t.summaryTab  ?? "Summary",  href: "/summary"   },
    { label: t.logTab      ?? "Log",      href: "/log"       },
  ];

  const sidebarProps = {
    t,
    records:         patient.records ?? [],
    viewYear,
    viewMonth,
    show,
    onToggleShow:    toggleShow,
    selectedRecord,
    medicines:       patient.medicines ?? [],
    onClearSelection: () => setSelectedRecord(null),
    selectedField,
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdf3f0" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between relative z-20"
        style={{
          background: "linear-gradient(135deg, #c97060 0%, #8b4038 100%)",
          boxShadow: "0 2px 16px rgba(139,64,56,0.28)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {initials}
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">
              {patient.name ?? t.title ?? "Endometriosis Diary"}
            </p>
            <p className="text-white/60 text-xs">
              {patient.records?.length ?? 0} {t.entries ?? "entries"}
            </p>
          </div>
        </div>

        <button
          onClick={() => { sessionStorage.removeItem("patientData"); router.replace("/"); }}
          className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
          style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t.logout ?? "Sign out"}
        </button>

        <button
          className="lg:hidden w-8 h-8 flex flex-col gap-1.5 items-center justify-center rounded-lg"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="block w-4 h-0.5 rounded" style={{ background: "#fff" }} />
          ))}
        </button>

        {menuOpen && (
          <div
            className="absolute top-full right-4 mt-1 rounded-xl shadow-xl py-1 z-50 min-w-[160px] lg:hidden"
            style={{ background: "#fff", border: "1px solid rgba(201,112,96,0.15)" }}
          >
            {tabs.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => { router.push(href); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
                style={{
                  color: pathname === href ? "#c97060" : "#5a3a34",
                  fontWeight: pathname === href ? 700 : 400,
                  borderBottom: "1px solid rgba(201,112,96,0.08)",
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { sessionStorage.removeItem("patientData"); router.replace("/"); }}
              className="w-full text-left px-4 py-2.5 text-sm"
              style={{ color: "#b07a70" }}
            >
              {t.logout ?? "Sign out"}
            </button>
          </div>
        )}
      </header>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div
        className="flex border-b flex-shrink-0"
        style={{ background: "#fff", borderColor: "rgba(201,112,96,0.18)" }}
      >
        {tabs.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex-1 lg:flex-none lg:px-8 py-3 text-sm font-bold transition-colors"
              style={{
                color: active ? "#c97060" : "#c9a098",
                borderBottom: active ? "2px solid #c97060" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto p-4 lg:p-10 gap-4">

        {/*
          Card:
          - Mobile:  column → [calendar + checkboxes] / [divider] / [summary]
          - Desktop: row    → [calendar + checkboxes] | [divider] | [summary 220px]
        */}
        <div
          className="flex flex-row w-full"
          style={{
            maxWidth: 560,
            background: "#fff",
            borderRadius: 20,
            border: "1px solid rgba(201,112,96,0.22)",
            boxShadow: "0 20px 80px rgba(139,64,56,0.18), 0 8px 32px rgba(139,64,56,0.12)",
            overflow: "hidden",
          }}
        >

          {/* ── Left: calendar + checkboxes ─────────────────────────── */}
          <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>

            {/* Calendar */}
            <div style={{ padding: "28px 24px 16px" }}>
              <CalendarPanel
                t={t}
                records={patient.records ?? []}
                onDayClick={handleDayClick}
                selectedDate={selectedRecord?.date}
                viewYear={viewYear}
                viewMonth={viewMonth}
                onViewChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
                show={show}
                onToggleShow={toggleShow}
                selectedField={selectedField}
                onFieldChange={setSelectedField}
              />
            </div>

            {/* Checkboxes */}
            <div
              style={{
                padding: "12px 24px 20px",
                borderTop: "1px solid rgba(201,112,96,0.12)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 12px",
              }}
            >
              {CHECKBOXES.map(({ key, label }) => (
                <Checkbox
                  key={key}
                  checked={show[key] ?? true}
                  label={label}
                  onToggle={() => toggleShow(key)}
                />
              ))}
            </div>
          </div>

          {/* ── Divider — vertical, desktop only ───────────────────── */}
          <div
            className="hidden lg:block flex-shrink-0"
            style={{ width: 1, background: "rgba(201,112,96,0.12)", alignSelf: "stretch" }}
          />

          {/* ── Right: monthly summary — desktop sidebar ────────────── */}
          <div
            className="hidden lg:block flex-shrink-0 overflow-y-auto"
            style={{ width: 220 }}
          >
            <MonthlySidebar {...sidebarProps} />
          </div>

        </div>

        {/* ── Mobile only: monthly summary below the card ─────────── */}
        <div
          className="lg:hidden w-full mt-4"
          style={{
            maxWidth: 560,
            background: "#fff",
            borderRadius: 20,
            border: "1px solid rgba(201,112,96,0.22)",
            boxShadow: "0 20px 80px rgba(139,64,56,0.18), 0 8px 32px rgba(139,64,56,0.12)",
            overflow: "hidden",
          }}
        >
          <MonthlySidebar {...sidebarProps} />
        </div>
      </main>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <DayDetailDrawer
        t={t}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedRecord(null); }}
        record={selectedRecord}
        medicines={patient.medicines ?? []}
        show={show}
      />
    </div>
  );
}