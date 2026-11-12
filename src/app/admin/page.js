// src/app/admin/page.js
// Hidden admin page – not linked from anywhere and kept out of search engines.
import { Suspense } from "react";
import { connection } from "next/server";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { isAdmin, missingSettings } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

// Login or dashboard. Reads the login cookie and the current time, so it renders on every
// request – inside <Suspense>, as Next.js 16 (cacheComponents) requires for per-request content.
async function AdminGate() {
  await connection();
  if (await isAdmin()) return <AdminDashboard />;
  const missing = missingSettings();
  // Only while developing: name the missing settings on the login page
  const devMissing = process.env.NODE_ENV === "production" ? [] : missing;
  return <AdminLogin configured={missing.length === 0} missing={devMissing} cwd={devMissing.length ? process.cwd() : null} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminGate />
    </Suspense>
  );
}
