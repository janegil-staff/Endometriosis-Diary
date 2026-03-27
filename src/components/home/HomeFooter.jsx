import StoreButtons from "./StoreButtons";
import LanguageFlags from "./LanguageFlags";

export default function HomeFooter({ t, lang, setLang }) {
  return (
    <footer className="relative z-10 text-center pb-9 px-4">
      <p className="text-gray-700 text-sm mb-1">{t.available}</p>
      <p className="text-gray-700 text-sm mb-5">{t.download}</p>

      <StoreButtons />
      <LanguageFlags lang={lang} setLang={setLang} />

      <p className="text-gray-600 text-xs mb-2">
        Copyright 2026 - KBB Medic AS (org: 912 372 022)
      </p>
      <a
        href="mailto:post@kbbmedic.no"
        className="text-gray-600 text-xs flex items-center justify-center gap-1.5 hover:text-[#268E86] transition-colors"
      >
        ✉ post@kbbmedic.no
      </a>
    </footer>
  );
}
