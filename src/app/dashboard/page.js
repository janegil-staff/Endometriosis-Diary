"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";
import CalendarPanel, { FIELDS } from "@/components/dashboard/CalendarPanel";
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

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [selectedField, setSelectedField] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("endo_selectedField") ?? "intensity")
      : "intensity"
  );
  const setSelectedFieldPersist = (val) => {
    localStorage.setItem("endo_selectedField", val);
    setSelectedField(val);
  };

  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return {
      period: false, flareUp: true, medicine: true,
      activity: false, sexPrevented: true, sleep: true, note: true,
    };
    const saved = localStorage.getItem("endo_show");
    return saved ? JSON.parse(saved) : {
      period: false, flareUp: true, medicine: true,
      activity: false, sexPrevented: true, sleep: true, note: true,
    };
  });
  const toggleShow = (key) => setShow((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    localStorage.setItem("endo_show", JSON.stringify(next));
    return next;
  });

  // ── Header dropdown state ─────────────────────────────────────────────────
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const headerDropdownRef = useRef(null);

  useEffect(() => {
    if (!headerDropdownOpen) return;
    function handle(e) {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(e.target)) {
        setHeaderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [headerDropdownOpen]);

  const activeField = FIELDS.find((f) => f.key === selectedField) ?? FIELDS[0];
  const activeLabel = t[activeField.tKey] ?? activeField.fallback;
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => { if (!patient) router.replace("/"); }, [patient, router]);
  if (!patient) return null;

  function handleDayClick(rec) {
    setSelectedRecord(rec ?? null);
    if (rec) setDrawerOpen(true);
  }

  const initials = patient.name
    ? patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const sidebarProps = {
    t,
    records:          patient.records ?? [],
    viewYear,
    viewMonth,
    show,
    onToggleShow:     toggleShow,
    selectedRecord,
    medicines:        patient.medicines ?? [],
    onClearSelection: () => setSelectedRecord(null),
    selectedField,
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between relative z-20"
        style={{
          background: "linear-gradient(135deg, #c97060 0%, #8b4038 100%)",
          boxShadow: "0 2px 16px rgba(139,64,56,0.28)",
        }}
      >
        {/* Left: avatar + name */}
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

        {/* Center: field selector dropdown */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          ref={headerDropdownRef}
          style={{ zIndex: 30 }}
        >
          <button
            onClick={() => setHeaderDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.8)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
              {activeLabel}
            </span>
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"
              style={{
                transform: headerDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
                flexShrink: 0,
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {headerDropdownOpen && (
            <div
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 rounded-xl overflow-hidden"
              style={{
                background: "#fff",
                border: "1px solid rgba(201,112,96,0.18)",
                boxShadow: "0 8px 24px rgba(139,64,56,0.2)",
                minWidth: 168,
                zIndex: 50,
              }}
            >
              {FIELDS.map((f) => {
                const label    = t[f.tKey] ?? f.fallback;
                const isActive = f.key === selectedField;
                return (
                  <button
                    key={f.key}
                    onClick={() => { setSelectedFieldPersist(f.key); setHeaderDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors"
                    style={{
                      background: isActive ? "rgba(201,112,96,0.08)" : "transparent",
                      borderBottom: "1px solid rgba(201,112,96,0.06)",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isActive ? "#c97060" : "rgba(201,112,96,0.25)" }}
                    />
                    <span style={{
                      fontSize: 11,
                      color: isActive ? "#c97060" : "#7a5a54",
                      fontWeight: isActive ? 700 : 400,
                    }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: logout button */}
        <button
          onClick={() => { sessionStorage.removeItem("patientData"); router.replace("/"); }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
          style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t.logout ?? "Sign out"}
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto p-4 lg:p-10 gap-4">

        <div
          className="flex flex-row w-full"
          style={{
            maxWidth: 560,
            borderRadius: 20,
            border: "1px solid rgba(201,112,96,0.22)",
            boxShadow: "0 20px 80px rgba(139,64,56,0.18), 0 8px 32px rgba(139,64,56,0.12)",
            overflow: "hidden",
          }}
        >

          {/* ── Left: calendar + checkboxes ─────────────────────────── */}
          <div className="flex flex-col flex-1" style={{ minWidth: 0, background: "#fff" }}>

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
                onFieldChange={setSelectedFieldPersist}
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

            {/* Summary + Log links */}
            <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
              {[
                {
                  label: t.summaryTab ?? "Sammendrag",
                  href: "/summary",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  ),
                  bg: "linear-gradient(135deg, #c97060 0%, #8b4038 100%)",
                  shadow: "0 4px 16px rgba(139,64,56,0.35)",
                },
                {
                  label: t.logTab ?? "Logg",
                  href: "/log",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  ),
                  bg: "linear-gradient(135deg, #c97060 0%, #8b4038 100%)",
                  shadow: "0 4px 16px rgba(139,64,56,0.35)",
                },
              ].map(({ label, href, icon, bg, shadow }) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ fontSize: 13, color: "#fff", background: bg, boxShadow: shadow, border: "none" }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: monthly summary — desktop sidebar ────────────── */}
          <div
            className="hidden lg:block flex-shrink-0 overflow-y-auto"
            style={{ width: 220, background: "#fff" }}
          >
            <MonthlySidebar {...sidebarProps} />
          </div>

        </div>

        {/* ── Mobile only: monthly summary below the card ─────────── */}
        <div
          className="lg:hidden w-full mt-4"
          style={{
            maxWidth: 560,
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