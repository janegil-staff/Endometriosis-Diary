"use client";
import { useState, useEffect } from "react";
import { combineScore } from "@/lib/log/logHelpers";

const SYMPTOM_FIELDS_PDF = [
  { key: "intensity",         labelKey: "symptomPain",       fallback: "Pelvic pain" },
  { key: "period",            labelKey: "symptomPeriod",     fallback: "Period" },
  { key: "endoBelly",         labelKey: "symptomEndoBelly",  fallback: "Endo belly" },
  { key: "bowelMovementPain", labelKey: "symptomBowel",      fallback: "Bowel pain" },
  { key: "urinationPain",     labelKey: "symptomUrination",  fallback: "Urination" },
  { key: "fatigue",           labelKey: "symptomFatigue",    fallback: "Fatigue" },
  { key: "stress",            labelKey: "symptomStress",     fallback: "Stress" },
  { key: "emotion",           labelKey: "symptomEmotion",    fallback: "Mood" },
  { key: "sleepQuality",      labelKey: "symptomSleep",      fallback: "Sleep" },
  { key: "sexualPain",        labelKey: "symptomSexualPain", fallback: "Sexual pain" },
];

function formatActivity(mins, t) {
  if (!mins || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hLabel = h === 1 ? (t.hourSingular ?? "hour") : (t.hours ?? "hours");
  const mLabel = t.minutes ?? "minutes";
  if (h > 0 && m > 0) return `${h} ${hLabel} ${m} ${mLabel}`;
  if (h > 0)           return `${h} ${hLabel}`;
  return `${m} ${mLabel}`;
}

function Toggle({ checked, onChange, label, color = "#c97060" }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={onChange}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: checked ? color : "#e8c8c0",
          transition: "background 0.2s",
          position: "relative", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3,
          left: checked ? 19 : 3,
          width: 14, height: 14, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }} />
      </div>
      <span className="text-sm" style={{ color: checked ? "#5a3a34" : "#b07a70" }}>{label}</span>
    </label>
  );
}

function DateInput({ label, value, onChange, min, max }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#b07a70" }}>{label}</label>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#fdf4f2", border: "1px solid rgba(201,112,96,0.2)", color: "#5a3a34" }}
        onFocus={(e) => { e.target.style.borderColor = "#c97060"; e.target.style.boxShadow = "0 0 0 3px rgba(201,112,96,0.1)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "rgba(201,112,96,0.2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function PdfExportModal({ open, onClose, patient, t }) {
  const allRecords = [...(patient?.records ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const minDate    = allRecords[0]?.date ?? "";
  const maxDate    = allRecords[allRecords.length - 1]?.date ?? "";

  const [fromDate, setFromDate] = useState(() => {
    if (!maxDate) return "";
    const d = new Date(maxDate);
    d.setMonth(d.getMonth() - 4);
    return d.toISOString().slice(0, 10);
  });
  const [toDate,   setToDate]   = useState(maxDate);
  const [loading,  setLoading]  = useState(false);

  const [fields, setFields] = useState({
    painScore: true,
    symptoms:  true,
    period:    true,
    medicines: true,
    activity:  true,
    sleep:     true,
    note:      true,
  });

  useEffect(() => {
    const d = new Date(maxDate || new Date());
    d.setMonth(d.getMonth() - 4);
    setFromDate(maxDate ? d.toISOString().slice(0, 10) : "");
    setToDate(maxDate);
  }, [minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const toggle = (key) => setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const filtered = allRecords.filter((r) => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate   && r.date > toDate)   return false;
    return true;
  });

  const handleDownload = async () => {
    if (!filtered.length) return;
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W  = 210;
      const ML = 16, MR = 16;
      const CW = W - ML - MR;
      const ink   = [40, 20, 20];
      const mid   = [100, 70, 65];
      const light = [160, 130, 125];
      const rule  = [220, 200, 195];
      const shade = [253, 248, 247];
      let y = 0;

      const setFont = (size, style = "normal", color = ink) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(...color);
      };

      const hline = (yy, lw = 0.2, color = rule) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(...color);
        doc.line(ML, yy, W - MR, yy);
      };

      const vline = (xx, y1, y2, lw = 0.1) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(...rule);
        doc.line(xx, y1 + 0.5, xx, y2 - 0.5);
      };

      const box = (x, yy, w, h, fill, stroke, lw = 0.3) => {
        if (fill)   { doc.setFillColor(...fill);   doc.rect(x, yy, w, h, "F"); }
        if (stroke) { doc.setLineWidth(lw); doc.setDrawColor(...stroke); doc.rect(x, yy, w, h, "S"); }
      };

      const drawFrame = () => {
        doc.setLineWidth(0.4);
        doc.setDrawColor(180, 140, 130);
        doc.rect(11, 11, W - 22, 275, "S");
        doc.setLineWidth(0.1);
        doc.setDrawColor(...rule);
        doc.line(14, 274, W - 14, 274);
      };

      const addPage = () => { doc.addPage(); drawFrame(); y = 44; };
      const checkY  = (need = 10) => { if (y + need > 270) addPage(); };

      // ── Page 1 header ──────────────────────────────────────
      drawFrame();
      setFont(18, "bold", ink);
      doc.text((t.reportTitle ?? t.symptomLog ?? "Symptom Report").toUpperCase(), ML, 26);
      setFont(7, "normal", light);
      doc.text(t.reportDate ?? "Date", W - MR, 20, { align: "right" });
      setFont(8, "bold", ink);
      doc.text(new Date().toLocaleDateString(), W - MR, 25, { align: "right" });
      setFont(7, "normal", mid);
      doc.text(`${patient.age} · ${t.female ?? "Female"}`, W - MR, 30, { align: "right" });
      if (fromDate || toDate) {
        setFont(7, "normal", light);
        doc.text(`${fromDate ?? "–"}  →  ${toDate ?? "–"}`, ML, 30);
      }
      doc.setLineWidth(0.25);
      doc.setDrawColor(201, 112, 96);
      doc.line(ML, 33.5, W - MR, 33.5);
      y = 39;

      // ── Summary stats ───────────────────────────────────────
      const scores     = filtered.map(combineScore);
      const painScores = scores.filter((v) => v > 1);
      const avgPain    = painScores.length ? Math.round(painScores.reduce((a, b) => a + b, 0) / painScores.length) : null;
      const periodDays = filtered.filter((r) => r.period >= 2).length;
      const medDays    = filtered.filter((r) => r.acuteMedicines?.length > 0).length;

      const stats = [
        { label: t.daysRecorded  ?? "Days recorded",  value: String(filtered.length) },
        { label: t.painScore     ?? "Pain score",      value: avgPain != null ? String(avgPain) : "–" },
        { label: t.symptomPeriod ?? "Period days",     value: String(periodDays) },
        { label: t.medication    ?? "Medicine days",   value: String(medDays) },
      ];

      const statW = CW / stats.length;
      const statH = 18;
      box(ML, y, CW, statH, shade, [220, 190, 185], 0.15);
      stats.forEach(({ label, value }, i) => {
        const sx = ML + i * statW;
        if (i > 0) vline(sx, y, y + statH, 0.2);
        setFont(14, "bold", ink);
        doc.text(value, sx + statW / 2, y + 10.5, { align: "center" });
        setFont(6.5, "normal", mid);
        const lbl = doc.splitTextToSize(label.toUpperCase(), statW - 4);
        lbl.forEach((ln, li) => doc.text(ln, sx + statW / 2, y + 15 + li * 3, { align: "center" }));
      });
      y += statH + 10;

      // ── Column layout ───────────────────────────────────────
      const showSymptoms = fields.painScore && fields.symptoms;
      const showMeds     = fields.medicines;
      const showMisc     = fields.activity || fields.sleep;

      let colX = ML;
      const COL = { date: { x: colX, w: 28 } };
      colX += 29;
      if (fields.painScore) { COL.pain = { x: colX, w: 22 };                 colX += 23; }
      if (showSymptoms)     { COL.syms = { x: colX, w: showMeds ? 44 : 64 }; colX += COL.syms.w + 1; }
      if (showMeds)         { COL.meds = { x: colX, w: showMisc ? 28 : 40 }; colX += COL.meds.w + 1; }
      if (showMisc)         { COL.misc = { x: colX, w: W - MR - colX }; }

      // ── Table header ────────────────────────────────────────
      checkY(10);
      const thH = 7;
      box(ML, y, CW, thH, [240, 225, 220], [200, 170, 165], 0.25);
      setFont(6.5, "bold", mid);
      doc.text((t.month ?? "Date").toUpperCase(), COL.date.x + 2, y + 4.8);
      if (COL.pain) doc.text((t.painScore ?? "Pain").toUpperCase(), COL.pain.x + COL.pain.w / 2, y + 4.8, { align: "center" });
      if (COL.syms) doc.text((t.symptomLog ?? "Symptoms").toUpperCase().slice(0, 18), COL.syms.x + 2, y + 4.8);
      if (COL.meds) doc.text((t.medication ?? "Medicine").toUpperCase(), COL.meds.x + 2, y + 4.8);
      if (COL.misc) {
        doc.setFontSize(5.5);
        doc.text(
          `${t.physicalActivity ?? "Activity"} / ${t.symptomSleep ?? "Sleep"}`.toUpperCase(),
          COL.misc.x + 2, y + 4.8,
        );
        doc.setFontSize(6.5);
      }
      Object.entries(COL).filter(([k]) => k !== "date").forEach(([, c]) => vline(c.x, y, y + thH, 0.15));
      y += thH;

      // ── Row constants ───────────────────────────────────────
      const LINE_H   = 4.2;
      const PAD_TOP  = 4.5;
      const PAD_BOT  = 4;
      const PAD_SIDE = 2;

      // ── Records ─────────────────────────────────────────────
      filtered.slice().reverse().forEach((r, idx) => {
        const year     = r.date.slice(0, 4);
        const prevYear = idx > 0 ? filtered[filtered.length - idx].date.slice(0, 4) : null;
        if (year !== prevYear) {
          checkY(10);
          if (idx > 0) y += 3;
          setFont(7, "bold", [201, 112, 96]);
          doc.text(year, ML + PAD_SIDE, y + 5);
          doc.setLineWidth(0.15);
          doc.setDrawColor(220, 180, 170);
          doc.line(ML + PAD_SIDE + 10, y + 4, W - MR, y + 4);
          y += 8;
        }

        const score = combineScore(r);
        const scoreLabel =
          score <= 1 ? (t.noPain     ?? "No pain")
          : score <= 2 ? (t.mild     ?? "Light")
          : score <= 3 ? (t.moderate ?? "Medium")
          : score <= 4 ? (t.serious  ?? "Heavy")
          :               (t.veryHigh ?? "Extreme");

        const scoreRgb =
          score <= 1 ? [214, 238, 248]
          : score <= 2 ? [76, 193, 137]
          : score <= 3 ? [255, 198, 89]
          : score <= 4 ? [255, 116, 115]
          : [190, 56, 48];

        const usedMeds = (r.acuteMedicines ?? []).map((id, i) => {
          const med  = patient.medicines?.find((m) => m.id === id);
          const name = med?.name ?? `ID ${id}`;
          const dose = r.acuteMedicinesDoses?.[i];
          return dose ? `${name} ${dose}mg` : name;
        });

        doc.setFontSize(6.5);
        const medW     = (COL.meds?.w ?? 28) - PAD_SIDE * 2;
        const medText  = usedMeds.join(", ");
        const medSplit = showMeds && medText ? doc.splitTextToSize(medText, medW) : [];

        const noteText  = fields.note && r.note?.trim() ? r.note.trim() : "";
        const noteSplit = noteText
          ? doc.splitTextToSize(`${t.note ?? "Note"}: ${noteText}`, CW - PAD_SIDE * 4)
          : [];

        const visibleSymptoms = SYMPTOM_FIELDS_PDF.filter(({ key }) => {
          if (key === "period"       && !fields.period) return false;
          if (key === "sleepQuality" && !fields.sleep)  return false;
          return r[key] >= 2;
        });

        const symRows      = Math.min(visibleSymptoms.length, 5);
        const subContentH  = showSymptoms ? Math.max(symRows * LINE_H, LINE_H) : 0;
        const medContentH  = medSplit.length > 0 ? medSplit.length * LINE_H : 0;
        const bodyContentH = Math.max(subContentH, medContentH, LINE_H * 2);
        const bodyH        = PAD_TOP + bodyContentH + PAD_BOT;
        const noteH        = noteSplit.length > 0
          ? PAD_TOP + noteSplit.length * LINE_H + PAD_BOT * 0.5
          : 0;
        const rowH = bodyH + noteH;

        checkY(rowH + 1);

        const blendFactor = score <= 1 ? 0.75 : 0.85;
        doc.setFillColor(
          Math.min(255, scoreRgb[0] + (255 - scoreRgb[0]) * blendFactor),
          Math.min(255, scoreRgb[1] + (255 - scoreRgb[1]) * blendFactor),
          Math.min(255, scoreRgb[2] + (255 - scoreRgb[2]) * blendFactor),
        );
        doc.rect(ML, y, CW, rowH, "F");
        doc.setLineWidth(0.1);
        doc.setDrawColor(220, 200, 195);
        doc.rect(ML, y, CW, rowH, "S");

        Object.entries(COL).filter(([k]) => k !== "date").forEach(([, c]) => vline(c.x, y, y + bodyH));

        if (noteSplit.length > 0) {
          doc.setFillColor(251, 250, 255);
          doc.rect(ML, y + bodyH, CW, noteH, "F");
          doc.setLineWidth(0.08); doc.setDrawColor(215, 210, 230);
          doc.line(ML + 1, y + bodyH, W - MR - 1, y + bodyH);
        }

        const ty = y + PAD_TOP;

        // ── Date cell ──────────────────────────────────────────
        const rd  = new Date(r.date.slice(0, 4), r.date.slice(5, 7) - 1, r.date.slice(8, 10));
        const dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][rd.getDay()];
        const fmt = `${String(rd.getDate()).padStart(2,"0")}.${String(rd.getMonth()+1).padStart(2,"0")}.${rd.getFullYear()}`;
        setFont(6, "bold", [180, 150, 140]);
        doc.text(dow, COL.date.x + PAD_SIDE, ty);
        setFont(6.5, "bold", ink);
        doc.text(fmt, COL.date.x + PAD_SIDE, ty + LINE_H * 0.95);

        // ── Pain score cell ─────────────────────────────────────
        if (COL.pain) {
          setFont(13, "bold", ink);
          doc.text(String(score), COL.pain.x + COL.pain.w / 2, ty + 2, { align: "center" });
          setFont(5.5, "normal", light);
          doc.text(scoreLabel.toUpperCase(), COL.pain.x + COL.pain.w / 2, ty + 6.5, { align: "center" });
        }

        // ── Symptom pairs ───────────────────────────────────────
        if (COL.syms && showSymptoms && visibleSymptoms.length > 0) {
          const pairW = (COL.syms.w - PAD_SIDE * 3) / 2;
          visibleSymptoms.slice(0, 10).forEach(({ key, labelKey, fallback }, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            if (row >= 5) return;
            const lbl = (t[labelKey] ?? fallback).slice(0, 13);
            const val = r[key];
            const px  = COL.syms.x + PAD_SIDE + col * (pairW + PAD_SIDE);
            const py  = ty + row * LINE_H;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(...mid);
            doc.text(`${lbl}:`, px, py);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ink);
            doc.text(String(val), px + pairW - 1, py, { align: "right" });
          });
        }

        // ── Medicine cell ───────────────────────────────────────
        if (COL.meds && medSplit.length > 0) {
          setFont(6.5, "normal", ink);
          medSplit.forEach((ln, li) => doc.text(ln, COL.meds.x + PAD_SIDE, ty + li * LINE_H));
        }

        // ── Activity / sleep cell ───────────────────────────────
        if (COL.misc) {
          setFont(7, "normal", ink);
          let sy = ty;
          if (fields.activity && r.physicalActivity > 0) {
            doc.text(formatActivity(r.physicalActivity, t), COL.misc.x + PAD_SIDE, sy);
            sy += LINE_H;
          }
          if (fields.sleep && r.sleepHours > 0) {
            const h = r.sleepHours;
            doc.text(
              h === 1 ? `1 ${t.hourSingular ?? "hour"}` : `${h} ${t.hours ?? "hours"}`,
              COL.misc.x + PAD_SIDE, sy,
            );
          }
        }

        // ── Note band ───────────────────────────────────────────
        if (noteSplit.length > 0) {
          const ny = y + bodyH;
          setFont(6.5, "italic", [120, 100, 160]);
          noteSplit.forEach((ln, li) =>
            doc.text(ln, ML + PAD_SIDE + 1, ny + PAD_TOP * 0.8 + li * LINE_H),
          );
        }

        y += rowH;
      });

      hline(y, 0.2, [201, 112, 96]);

      // ── Footer ──────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        setFont(6.5, "normal", light);
        doc.text(t.symptomLog ?? "Symptom Log", ML, 280);
        doc.text(`${p} / ${pageCount}`, W - MR, 280, { align: "right" });
        doc.text(new Date().toLocaleDateString(), W / 2, 280, { align: "center" });
      }

      doc.save(`${t.reportTitle ?? "endo-diary"}-${fromDate ?? ""}-${toDate ?? ""}.pdf`);
      onClose();
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const fieldGroups = [
    {
      key: "painScore", label: t.painScore ?? "Pain score",
      children: [{ key: "symptoms", label: t.symptomLog ?? "All symptom fields" }],
    },
    { key: "period",    label: t.symptomPeriod   ?? "Period"    },
    { key: "medicines", label: t.medicines       ?? "Medicines" },
    { key: "activity",  label: t.physicalActivity ?? "Activity" },
    { key: "sleep",     label: t.symptomSleep    ?? "Sleep"     },
    { key: "note",      label: t.note            ?? "Notes"     },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 z-[401] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 32px))",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(201,112,96,0.2)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(201,112,96,0.12)" }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#b07a70" }}>
              {t.downloadPdf ?? "Download PDF"}
            </p>
            <p className="text-lg font-bold" style={{ color: "#5a3a34", fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t.reportTitle ?? t.symptomLog ?? "Symptom Report"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
            style={{ color: "#b07a70" }}
          >✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Date range */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#b07a70" }}>
              {(() => {
                if (!fromDate || !toDate) return t.lastFourMonths ?? "Period";
                const from    = new Date(fromDate);
                const to      = new Date(toDate);
                const months  = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
                const rounded = Math.max(1, Math.round(months));
                return `${rounded} ${rounded === 1 ? (t.monthSingular ?? "month") : (t.months ?? "months")}`;
              })()}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DateInput label={t.from ?? "From"} value={fromDate} onChange={setFromDate} max={toDate || maxDate} />
              <DateInput label={t.stopped ?? "To"} value={toDate}  onChange={setToDate}   min={fromDate || minDate} max={maxDate} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#b07a70" }}>
              {filtered.length} {t.entries ?? "entries"}
              {filtered.length === 0 && (
                <span className="ml-2" style={{ color: "#e05a5a" }}>— {t.noEntries ?? "No entries"}</span>
              )}
            </p>
          </div>

          {/* Field toggles */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#b07a70" }}>
              {t.showIn ?? "Include in report"}
            </p>
            <div className="space-y-2.5">
              {fieldGroups.map(({ key, label, children }) => (
                <div key={key}>
                  <Toggle checked={fields[key]} onChange={() => toggle(key)} label={label} />
                  {children && fields[key] && (
                    <div className="ml-10 mt-2 space-y-2">
                      {children.map((child) => (
                        <Toggle key={child.key} checked={fields[child.key]} onChange={() => toggle(child.key)} label={child.label} color="#b07a70" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(201,112,96,0.12)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(201,112,96,0.08)", color: "#c97060", border: "1px solid rgba(201,112,96,0.2)" }}
          >
            {t.back ?? "Cancel"}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#c97060", color: "#fff" }}
          >
            {loading
              ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <span>⬇</span>}
            {loading ? (t.loading ?? "…") : (t.downloadPdf ?? "Download PDF")}
          </button>
        </div>
      </div>
    </>
  );
}