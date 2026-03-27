"use client";
import { createContext, useContext, useState } from "react";

const SUPPORTED_LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"];
const DEFAULT_LANG = "en";

const DOMAIN_LANG_MAP = {
  "endometriosedagboken.no": "no",
  "endometriosisdiary.com":  "en",
  "localhost":               "en",
};

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {} });

function resolveInitialLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;

  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang");
  if (queryLang && SUPPORTED_LANGS.includes(queryLang)) {
    localStorage.setItem("lang", queryLang);
    return queryLang;
  }

  const saved = localStorage.getItem("lang");
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

  const hostname = window.location.hostname;
  const domainLang = DOMAIN_LANG_MAP[hostname];
  if (domainLang) return domainLang;

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