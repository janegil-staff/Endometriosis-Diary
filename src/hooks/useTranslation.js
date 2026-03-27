"use client";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const { lang } = useLang();
  const t = translations[lang] || translations.en;
  return { t, lang };
}
