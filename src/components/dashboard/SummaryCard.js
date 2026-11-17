// src/components/dashboard/SummaryCard.js
"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import AdviceModal, { relevantAdvice } from "@/components/dashboard/AdviceModal";
import CompareModal from "@/components/dashboard/CompareModal";
import EndoLog from "@/components/dashboard/EndoLog";
import Modal from "@/components/dashboard/Modal";
import { MedicationModal, PreviousMedicationModal, medicationCount } from "@/components/dashboard/MedicationModals";
import SummaryModal, { periodLabel, useSummaryOptions } from "@/components/dashboard/SummaryModal";
import { addDays, indexRecords, rangeStats, startOfToday } from "@/components/dashboard/data";

function MenuButton({ onClick, children, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-start text-xs font-bold uppercase tracking-[0.14em] text-[#c8323f] shadow-[0_4px_14px_-8px_rgba(160,40,50,0.45)] transition hover:bg-[#fff6f7]"
    >
      <span>{children}</span>
      <span className="flex items-center gap-3">
        {badge !== undefined && (
          <span className="rounded-full bg-[#e8434f] px-2 py-0.5 text-[11px] font-bold tracking-normal text-white">{badge}</span>
        )}
        <span aria-hidden="true" className="text-[10px] rtl:rotate-180">
          ▶
        </span>
      </span>
    </button>
  );
}

function Number({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2.5 text-center shadow-[0_4px_14px_-8px_rgba(160,40,50,0.35)]">
      <div className="text-2xl font-semibold tabular-nums text-[#c0392b]">{value}</div>
      <div className="mt-0.5 text-xs leading-tight text-[#b5655c]">{label}</div>
    </div>
  );
}

// "Summary" in the right sidebar: the last 30 days, then summary table, before/after comparison, log, relevant advice and medication
export default function SummaryCard({ patient }) {
  const { t } = useLocale();
  const byDate = useMemo(() => indexRecords(patient?.records), [patient]);
  const [options, setOption] = useSummaryOptions();
  const [open, setOpen] = useState(null); // "summary" | "compare" | "log" | "advice" | "medication" | "previous"
  const close = () => setOpen(null);
  const last30 = rangeStats(byDate, addDays(startOfToday(), -29), 30);

  return (
    <section className="rounded-3xl border border-white/70 bg-[#fdf1f2]/90 p-4 shadow-[0_10px_30px_-18px_rgba(160,40,50,0.45)] backdrop-blur sm:p-5">
      <h2 className="text-center font-serif text-2xl font-bold text-[#c8323f]">{t.SUM_TITLE}</h2>

      {/* Last 30 days at a glance */}
      <h3 className="mb-2 mt-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#b5655c]">{t.SUM_LAST_30}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Number label={t.SUM_PAIN_DAYS} value={last30.pain} />
        <Number label={t.CAL_PERIOD} value={last30.period} />
        <Number label={t.CAL_MEDICATION} value={last30.medication} />
        <Number label={t.ABS_WORK} value={last30.absentWork} />
      </div>

      <div className="mt-5 space-y-3">
        <MenuButton onClick={() => setOpen("summary")}>
          {t.SUM_TITLE} · {periodLabel(t, options.period)}
        </MenuButton>
        <MenuButton onClick={() => setOpen("compare")}>{t.SUM_BTN_COMPARE}</MenuButton>
        <MenuButton onClick={() => setOpen("log")} badge={patient?.records?.length ?? 0}>
          {t.SUM_BTN_LOG}
        </MenuButton>
        <MenuButton onClick={() => setOpen("advice")} badge={relevantAdvice(patient).length}>
          {t.ADV_TITLE}
        </MenuButton>
        <MenuButton onClick={() => setOpen("medication")} badge={medicationCount(patient)}>
          {t.MED_TITLE}
        </MenuButton>
        <MenuButton onClick={() => setOpen("previous")} badge={patient?.previousMedicines?.length ?? 0}>
          {t.MED_PREVIOUS}
        </MenuButton>
      </div>

      <SummaryModal open={open === "summary"} onClose={close} byDate={byDate} options={options} setOption={setOption} />
      <CompareModal open={open === "compare"} onClose={close} byDate={byDate} />
      <Modal open={open === "log"} onClose={close} title={t.LOG_TITLE} fullHeight>
        <EndoLog patient={patient} />
      </Modal>
      <AdviceModal open={open === "advice"} onClose={close} patient={patient} />
      <MedicationModal open={open === "medication"} onClose={close} patient={patient} />
      <PreviousMedicationModal open={open === "previous"} onClose={close} patient={patient} />
    </section>
  );
}
