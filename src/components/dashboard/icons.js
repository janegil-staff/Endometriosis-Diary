// src/components/dashboard/icons.js
import { COLORS } from "@/components/dashboard/data";

// Smiley in a coloured circle, like the app's pain icons
export function FaceIcon({ face, size = 28 }) {
  const fill = COLORS[face] ?? COLORS.none;
  const eyes =
    face === "extreme" ? (
      <>
        <path d="M8.5 9.5l2.5 1.2M15.5 9.5L13 10.7" />
        <circle cx="9.8" cy="11.3" r="0.9" fill="#fff" stroke="none" />
        <circle cx="14.2" cy="11.3" r="0.9" fill="#fff" stroke="none" />
      </>
    ) : face === "strong" ? (
      <>
        <path d="M8.6 9.4l2.2 1M15.4 9.4l-2.2 1" />
        <circle cx="9.8" cy="11" r="0.9" fill="#fff" stroke="none" />
        <circle cx="14.2" cy="11" r="0.9" fill="#fff" stroke="none" />
      </>
    ) : face === "moderate" ? (
      <path d="M8.3 10.2q1.2 1 2.4 0M13.3 10.2q1.2 1 2.4 0" />
    ) : (
      <>
        <circle cx="9.5" cy="10" r="1" fill="#fff" stroke="none" />
        <circle cx="14.5" cy="10" r="1" fill="#fff" stroke="none" />
      </>
    );
  const mouth = {
    none: "M8.8 14.2q3.2 2.6 6.4 0",
    mild: "M9.2 15h5.6",
    moderate: "M9 15.8q3-2 6 0",
    strong: "M9 16.2q3-2.6 6 0",
    extreme: "M9 16.4q3-3 6 0",
  }[face] ?? "M9.2 15h5.6";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={fill} />
      <g fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
        {eyes}
        <path d={mouth} />
      </g>
    </svg>
  );
}

// Thick dark-red ring – the month sum
export function MonthSumIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" fill="none" stroke={COLORS.monthSum} strokeWidth="3.6" />
    </svg>
  );
}

// Pink dot – days with bleeding
export function PeriodIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fdc8cd" />
    </svg>
  );
}

// Red cross in a ring – acute medication
export function AcuteIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" stroke={COLORS.acute} strokeWidth="1.6" />
      <path d="M10 6.5h4v3.5h3.5v4H14v3.5h-4V14H6.5v-4H10z" fill={COLORS.acute} />
    </svg>
  );
}

// Note sheet in a blue ring – the day has a written note
export function NoteIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" stroke={COLORS.note} strokeWidth="1.6" />
      <path d="M8 5.8h5.6l2.6 2.6v9.8H8z" fill={COLORS.note} />
      <path d="M13.6 5.8v2.6h2.6" fill="#cfe0f7" />
      <path d="M9.8 11.3h4.6M9.8 13.6h4.6M9.8 15.9h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ dir = "left", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
