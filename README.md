# Endometriosis Diary – web (endometriosisdiary)

Next.js site for the Endometriosis Diary app by KBB Medic AS, built like the Headache Calendar site
but in the app's red colours. Healthcare providers open a patient's diary with the one-time code
the patient makes in the app (Share → six-digit code, valid for 10 minutes).

## Getting started

```bash
cp .env.example .env.local   # then set API_URL
npm install
npm run dev
```

Open http://localhost:3000.

## Where things are

- `src/app/page.js` – landing page (headline, phone picture, code card, store links)
- `src/app/api/patient-access/route.js` – looks the code up on `API_URL` (`/api/patients/details/json`)
- `src/app/dashboard/page.js` – the patient's page (first version: header only)
- `src/locales/*.json` – texts for the app's 12 languages; no text is hardcoded in components
- `public/images/background.svg` – red background; `public/images/app-*.webp` – the three phone screenshots
- `public/images/code-help/code-1.webp`, `code-2.webp` – screenshots in "How do I get a code?"
- `public/images/about-app/<folder>/front.webp` – optional picture per language (replaces the phone frame)
