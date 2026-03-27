export const parseInitialState = () => {
  if (typeof window === "undefined")
    return { patient: null, viewYear: null, viewMonth: null };
  const raw = sessionStorage.getItem("patientData");
  if (!raw) return { patient: null, viewYear: null, viewMonth: null };
  const data = JSON.parse(raw);
  const sorted = [...(data.records ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  if (sorted.length) {
    const last = sorted[sorted.length - 1].date;
    return {
      patient: data,
      viewYear: parseInt(last.slice(0, 4)),
      viewMonth: parseInt(last.slice(5, 7)) - 1,
    };
  }
  return { patient: data, viewYear: null, viewMonth: null };
};
