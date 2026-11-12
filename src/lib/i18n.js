// src/lib/i18n.js
import daDK from "@/locales/da-DK.json";
import deDE from "@/locales/de-DE.json";
import enUS from "@/locales/en-US.json";
import esES from "@/locales/es-ES.json";
import fiFI from "@/locales/fi-FI.json";
import frFR from "@/locales/fr-FR.json";
import itIT from "@/locales/it-IT.json";
import nbNO from "@/locales/nb-NO.json";
import nlNL from "@/locales/nl-NL.json";
import plPL from "@/locales/pl-PL.json";
import ptPT from "@/locales/pt-PT.json";
import svSE from "@/locales/sv-SE.json";

export const DEFAULT_LOCALE = "nb-NO";
export const LOCALE_COOKIE = "locale";

export const DICTIONARIES = {
  "da-DK": daDK,
  "de-DE": deDE,
  "en-US": enUS,
  "es-ES": esES,
  "fi-FI": fiFI,
  "fr-FR": frFR,
  "it-IT": itIT,
  "nb-NO": nbNO,
  "nl-NL": nlNL,
  "pl-PL": plPL,
  "pt-PT": ptPT,
  "sv-SE": svSE,
};

// The 12 languages of the Endometriosis Diary app. Shown in the language picker, sorted by
// native name at render time. `images` is the folder under /public/images/about-app/
export const LANGUAGES = [
  { code: "da-DK", name: "Dansk", flag: "🇩🇰", images: "da" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪", images: "de" },
  { code: "en-US", name: "English", flag: "🇬🇧", images: "en" },
  { code: "es-ES", name: "Español", flag: "🇪🇸", images: "es" },
  { code: "fi-FI", name: "Suomi", flag: "🇫🇮", images: "fi" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷", images: "fr" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹", images: "it" },
  { code: "nb-NO", name: "Norsk", flag: "🇳🇴", images: "no" },
  { code: "nl-NL", name: "Nederlands", flag: "🇳🇱", images: "nl" },
  { code: "pl-PL", name: "Polski", flag: "🇵🇱", images: "pl" },
  { code: "pt-PT", name: "Português", flag: "🇵🇹", images: "pt" },
  { code: "sv-SE", name: "Svenska", flag: "🇸🇪", images: "se" },
];

export const isSupported = (code) => Object.hasOwn(DICTIONARIES, code ?? "");

const findLanguage = (code) => LANGUAGES.find((l) => l.code === code);

export const getDir = (code) => findLanguage(code)?.dir ?? "ltr";

// Folder with the "About the app" screenshots for a locale
export const getImageFolder = (code) =>
  findLanguage(code)?.images ?? findLanguage(DEFAULT_LOCALE).images;

// Language part only ("pt-PT" → "pt"); the first code listed wins for a shared language
const BY_LANGUAGE = {};
for (const { code } of LANGUAGES) BY_LANGUAGE[code.split("-")[0].toLowerCase()] ??= code;
BY_LANGUAGE.no = BY_LANGUAGE.nn = "nb-NO";
BY_LANGUAGE.pt = "pt-PT";

// Maps any tag ("en", "en-GB", "no", "sv", "pt_br", the old short codes) to a supported locale, or null
export function normalizeLocale(code) {
  if (!code) return null;
  const tag = String(code).trim().replace("_", "-");
  const exact = Object.keys(DICTIONARIES).find((c) => c.toLowerCase() === tag.toLowerCase());
  if (exact) return exact;
  return BY_LANGUAGE[tag.split("-")[0].toLowerCase()] ?? null;
}

// Missing keys fall back to Norwegian
export const getDictionary = (code) => ({
  ...DICTIONARIES[DEFAULT_LOCALE],
  ...(DICTIONARIES[code] ?? {}),
});

// Picks the best supported locale from an Accept-Language header
export function matchAcceptLanguage(header = "") {
  const wanted = header
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean);

  for (const tag of wanted) {
    const match = normalizeLocale(tag);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
