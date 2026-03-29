"use client";
import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import CalendarPanel from "@/components/dashboard/CalendarPanel";
import DayDetailDrawer from "@/components/dashboard/DayDetailDrawer";
import { translations } from "@/lib/translations";

export default function Dashboard() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang] ?? translations.en;

  const [mounted, setMounted] = useState(false);
  const [patient, setPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);

  // Which field drives the calendar colours
  const [selectedField, setSelectedField] = useState("intensity");

  const [show, setShow] = useState({
    period: true,
    flareUp: true,
    medicine: true,
    note: true,
    activity: true,
    sexPrevented: true,
  });

  const toggleShow = (key) =>
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) {
      router.replace("/");
      return;
    }
    const data = JSON.parse(raw);
    startTransition(() => {
      setPatient(data);
      if (data.records?.length) {
        const last = [...data.records]
          .sort((a, b) => a.date.localeCompare(b.date))
          .pop();
        setSelectedRecord(last);
        setViewYear(parseInt(last.date.slice(0, 4)));
        setViewMonth(parseInt(last.date.slice(5, 7)) - 1);
      }
      setMounted(true);
    });
  }, [router]);

  const handleDayClick = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  if (!mounted || !patient) return null;

  const NAV_ITEMS = [
    { label: t.summaryTab ?? "Summary", href: "/summary" },
    { label: t.logTab ?? "Log", href: "/log" },
  ];

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
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-8 py-4 relative z-[100]"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(201,112,96,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "#c97060" }}
          >
            {(t.female ?? "F")[0]}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#5a3a34" }}>
              {patient.age} · {t.female ?? "Female"}
            </p>
            <p className="text-xs" style={{ color: "#b07a70" }}>
              {patient.records?.length ?? 0}{" "}
              {t.registrations ?? "registrations"}
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {NAV_ITEMS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all hover:opacity-80"
              style={{
                background: "rgba(201,112,96,0.08)",
                color: "#c97060",
                border: "1px solid rgba(201,112,96,0.2)",
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              sessionStorage.removeItem("patientData");
              localStorage.removeItem("sessionStartAt");
              router.replace("/");
            }}
            className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all hover:opacity-80"
            style={{
              background: "rgba(201,112,96,0.12)",
              color: "#c97060",
              border: "1px solid rgba(201,112,96,0.3)",
            }}
          >
            {t.logout ?? "Sign out"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full transition-all"
            style={{
              background: menuOpen
                ? "rgba(201,112,96,0.15)"
                : "rgba(201,112,96,0.08)",
              border: "1px solid rgba(201,112,96,0.25)",
            }}
          >
            <span
              className="block w-4 h-0.5 rounded-full transition-all"
              style={{
                background: "#c97060",
                transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-4 h-0.5 rounded-full transition-all"
              style={{ background: "#c97060", opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-4 h-0.5 rounded-full transition-all"
              style={{
                background: "#c97060",
                transform: menuOpen
                  ? "translateY(-8px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-[199]"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-11 z-[200] rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(201,112,96,0.2)",
                  boxShadow: "0 8px 32px rgba(201,112,96,0.15)",
                  minWidth: 160,
                }}
              >
                {[
                  ...NAV_ITEMS.map(({ label, href }) => ({
                    label,
                    action: () => {
                      setMenuOpen(false);
                      router.push(href);
                    },
                    danger: false,
                  })),
                  {
                    label: t.logout ?? "Sign out",
                    action: () => {
                      setMenuOpen(false);
                      sessionStorage.removeItem("patientData");
                      localStorage.removeItem("sessionStartAt");
                      router.replace("/");
                    },
                    danger: true,
                  },
                ].map(({ label, action, danger }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="text-left px-5 py-3 text-sm font-semibold transition-all hover:bg-black/5"
                    style={{
                      color: danger ? "#b91c1c" : "#c97060",
                      borderBottom: "1px solid rgba(201,112,96,0.08)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div
          className="rounded-2xl shadow-xl w-full"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(201,112,96,0.18)",
            maxWidth: 480,
            padding: "20px 18px",
          }}
        >
          <h1
            className="text-center text-xl font-bold mb-4"
            style={{
              color: "#c97060",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {t.title ?? "Endometriosis Diary"}
          </h1>

          <CalendarPanel
            t={t}
            records={patient.records}
            medicines={patient.medicines}
            onDayClick={handleDayClick}
            selectedDate={selectedRecord?.date}
            show={show}
            onToggleShow={toggleShow}
            viewYear={viewYear}
            viewMonth={viewMonth}
            onViewChange={(y, m) => {
              setViewYear(y);
              setViewMonth(m);
            }}
            selectedField={selectedField}
            onFieldChange={setSelectedField}
          />
        </div>
      </main>

      <DayDetailDrawer
        t={t}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
        medicines={patient.medicines}
        show={show}
      />
    </div>
  );
}
