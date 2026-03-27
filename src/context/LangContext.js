"use client";
import { createContext, useContext, useState } from "react";

const SUPPORTED_LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"];
const DEFAULT_LANG = "no";

const DOMAIN_LANG_MAP = {
  "copdcalendar.com":  "en",
  "kolskalendar.no":   "no",
  "localhost":         "no",
};

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {} });

function resolveInitialLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;

  // 1. Check ?lang= query parameter first — overrides everything
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang");
  if (queryLang && SUPPORTED_LANGS.includes(queryLang)) {
    localStorage.setItem("lang", queryLang);
    return queryLang;
  }

  // 2. Fall back to saved preference from localStorage
  const saved = localStorage.getItem("lang");
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

  // 3. Detect language from domain
  const hostname = window.location.hostname;
  const domainLang = DOMAIN_LANG_MAP[hostname];
  if (domainLang) return domainLang;

  // 4. Final fallback — Norwegian
  return DEFAULT_LANG;
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(resolveInitialLang);

  const setLang = (newLang) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}