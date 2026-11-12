// src/components/landing/FrontImage.js
"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { DEFAULT_LOCALE, getImageFolder } from "@/lib/i18n";

// A ready-made picture per language can be dropped in later as
// /public/images/about-app/<folder>/front.webp (folders in src/lib/i18n.js).
// Until then – or for a language without one – three app screens are shown in phone frames,
// laid out like the headache site's picture: home and share at the sides, the calendar lower in the middle.
const frontSrc = (locale) => `/images/about-app/${getImageFolder(locale)}/front.webp`;
const SCREENS = ["/images/app-home.webp", "/images/app-calendar.webp", "/images/app-share.webp"];

function Phone({ src, alt, className = "" }) {
  return (
    <div
      className={`relative w-[31%] shrink-0 overflow-hidden rounded-[1.6rem] border-[6px] border-slate-900 bg-slate-900 shadow-[0_24px_45px_-20px_rgba(120,20,30,0.6)] xl:rounded-[1.9rem] xl:border-[7px] ${className}`}
    >
      {/* Notch */}
      <div className="absolute left-1/2 top-0 z-10 h-[3.5%] w-[38%] -translate-x-1/2 rounded-b-xl bg-slate-900" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false} className="block h-auto w-full rounded-[1.1rem] xl:rounded-[1.4rem]" />
    </div>
  );
}

function PhoneGroup({ alt }) {
  return (
    <div className="flex items-start justify-center gap-[3%] pb-[8%]">
      <Phone src={SCREENS[0]} alt={alt} />
      <Phone src={SCREENS[1]} alt="" className="translate-y-[12%]" />
      <Phone src={SCREENS[2]} alt="" />
    </div>
  );
}

function Picture({ locale, alt, className }) {
  const sources = [frontSrc(locale), frontSrc(DEFAULT_LOCALE)];
  const [index, setIndex] = useState(0);
  const imgRef = useRef(null);

  // The page is rendered on the server, so a missing picture can fail to load before React is
  // ready – then onError never runs and the browser shows a broken image. Check it here as well.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setIndex((i) => i + 1);
  }, [index]);

  if (index >= sources.length) {
    return (
      <div className={className}>
        <PhoneGroup alt={alt} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={sources[index]}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

// key={locale} → a fresh image (and fallback state) every time the language changes
export default function FrontImage({ className = "" }) {
  const { locale, t } = useLocale();
  return <Picture key={locale} locale={locale} alt={t.ENDOMETRIOSIS_DIARY ?? ""} className={className} />;
}
