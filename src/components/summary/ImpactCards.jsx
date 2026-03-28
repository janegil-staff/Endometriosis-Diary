"use client";
import { Card } from "./Card";

export function AbsenceCard({ t, records }) {
  const withAbsence = records.filter((r) => r.absentWork >= 2 || r.absentSocial >= 2);
  if (!withAbsence.length) return null;

  const workDays   = records.filter((r) => r.absentWork >= 2).length;
  const socialDays = records.filter((r) => r.absentSocial >= 2).length;
  const fullWork   = records.filter((r) => r.absentWork === 3).length;
  const fullSocial = records.filter((r) => r.absentSocial === 3).length;

  const byMonth = {};
  records.forEach((r) => {
    const m = r.date.slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { work: 0, social: 0 };
    if (r.absentWork   >= 2) byMonth[m].work++;
    if (r.absentSocial >= 2) byMonth[m].social++;
  });
  const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
  const maxVal = Math.max(...months.map(([, v]) => Math.max(v.work, v.social)), 1);

  return (
    <Card title={t.absence ?? "Absence & impact"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.absentWork   ?? "Work days lost",   value: workDays,   sub: `${fullWork} full`,   color: "#e05a5a" },
          { label: t.absentSocial ?? "Social days lost", value: socialDays, sub: `${fullSocial} full`, color: "#f5a623" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,112,96,0.04)", border: "1px solid rgba(201,112,96,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: "#b07a70" }}>{sub}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
        {t.absenceByMonth ?? "By month"}
      </p>
      <div className="space-y-2">
        {months.map(([month, { work, social }]) => {
          const [y, m] = month.split("-");
          const monthNames = t.monthNames ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const label = `${monthNames[parseInt(m)-1]} ${y}`;
          return (
            <div key={month}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs" style={{ color: "#7a5a54" }}>{label}</span>
                <span className="text-xs" style={{ color: "#b07a70" }}>
                  {work > 0 && `🏢 ${work}`} {social > 0 && `👥 ${social}`}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(224,90,90,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(work/maxVal)*100}%`, background: "#e05a5a" }} />
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(245,166,35,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(social/maxVal)*100}%`, background: "#f5a623" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2">
        {[
          { color: "#e05a5a", label: t.absentWork   ?? "Work"   },
          { color: "#f5a623", label: t.absentSocial ?? "Social" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: "#b07a70" }}>{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SexualHealthCard({ t, records }) {
  const total     = records.length;
  const prevented = records.filter((r) => r.sexualPrevented >= 2).length;
  const partial   = records.filter((r) => r.sexualPrevented === 2).length;
  const full      = records.filter((r) => r.sexualPrevented === 3).length;
  const pct       = total ? Math.round((prevented / total) * 100) : 0;
  if (!prevented) return null;

  const painColor = (p) => p <= 2 ? "#4CC189" : p <= 3 ? "#FFC659" : p <= 4 ? "#FF7473" : "#BE3830";
  const byPain = [2,3,4,5].map((p) => {
    const subset  = records.filter((r) => r.intensity === p);
    const prevSub = subset.filter((r) => r.sexualPrevented >= 2).length;
    return { pain: p, pct: subset.length ? Math.round((prevSub / subset.length) * 100) : 0, count: subset.length };
  }).filter((d) => d.count > 0);

  return (
    <Card title={t.sexualHealthImpact ?? "Sexual health impact"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.daysAffected  ?? "Days affected", value: prevented, color: "#e05a5a" },
          { label: t.percentOfDays ?? "% of days",     value: `${pct}%`, color: "#c97060" },
          { label: t.partial       ?? "Partial",        value: partial,   color: "#FFC659" },
          { label: t.full          ?? "Full",           value: full,      color: "#FF7473" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,112,96,0.04)", border: "1px solid rgba(201,112,96,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      {byPain.length > 0 && (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
            {t.preventedByPainLevel ?? "Prevented by pain level"}
          </p>
          <div className="space-y-1.5">
            {byPain.map(({ pain, pct, count }) => (
              <div key={pain} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: painColor(pain) }} />
                <span className="text-xs w-14 shrink-0" style={{ color: "#7a5a54" }}>{t.painScore ?? "Pain"} {pain}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: painColor(pain) }} />
                </div>
                <span className="text-xs font-bold w-8 text-right" style={{ color: "#8b4038" }}>{pct}%</span>
                <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
