// src/app/[lang]/blinded/page.js
//
// Blinded entry – calendar only, read-only:
//   http://localhost:3000/no/blinded?code=123456
//
// Every registered day is drawn in one flat light red. No pain colours, period marking,
// medication or note icons, month numbers, summary or patient details (age).
//
// The patient is kept under its own sessionStorage key ("blinded"), never under
// "patient", so /dashboard can't be used to open the unblinded view.
"use client";

import { useRouter } from "next/navigation";
import BlindedCalendarCard from "@/components/dashboard/BlindedCalendarCard";
import CodeLinkStatus from "@/components/dashboard/CodeLinkStatus";
import { useCodeLink } from "@/components/dashboard/useCodeLink";
import { useUrlLanguage } from "@/components/dashboard/useUrlLanguage";
import { useLocale } from "@/components/LocaleProvider";

const clearDashboardPatient = () => {
  try {
    sessionStorage.removeItem("patient");
  } catch {}
};

export default function BlindedPage() {
  useUrlLanguage();
  const router = useRouter();
  const { t, locale, dir } = useLocale();
  const link = useCodeLink("blinded", clearDashboardPatient);

  if (link.status !== "ready") return <CodeLinkStatus errorKey={link.errorKey} />;

  const close = () => {
    try {
      sessionStorage.removeItem("blinded");
    } catch {}
    router.replace("/");
  };

  return (
    <div dir={dir} lang={locale} className="min-h-screen pb-12">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <h1 className="truncate font-serif text-2xl font-bold text-[#c8323f]">{t.ENDOMETRIOSIS_DIARY}</h1>
          <button
            type="button"
            onClick={close}
            className="shrink-0 whitespace-nowrap rounded-full bg-[#e8434f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8323f]"
          >
            {t.DASHBOARD_CLOSE}
          </button>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-md px-4">
        <BlindedCalendarCard patient={link.patient} />
      </main>
    </div>
  );
}
