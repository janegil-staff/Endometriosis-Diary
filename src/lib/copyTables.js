// src/lib/copyTables.js
// Copies paragraphs and tables to the clipboard – as a real table (HTML) for the patient record,
// Word or e-mail, and as aligned plain text for places that only take text.
//
// blocks: [{ text: "…" } | { title?: "…", head: ["…"], rows: [["…"]] }]

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toHtml(blocks) {
  const cell = "border:1px solid #cbd5e1;padding:3px 8px;white-space:nowrap;";
  return blocks
    .map((b) => {
      if (!b.head) return b.text ? `<p>${esc(b.text)}</p>` : "";
      const row = (r, tag) =>
        `<tr>${r.map((c, i) => `<${tag} style="${cell}text-align:${i === 0 ? "left" : "center"}">${esc(c)}</${tag}>`).join("")}</tr>`;
      return [
        b.title ? `<p><b>${esc(b.title)}</b></p>` : "",
        `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">`,
        `<thead>${row(b.head, "th")}</thead><tbody>${b.rows.map((r) => row(r, "td")).join("")}</tbody></table>`,
      ].join("");
    })
    .join("");
}

function toPlain(blocks) {
  const out = [];
  for (const b of blocks) {
    if (!b.head) {
      out.push(b.text ?? "", "");
      continue;
    }
    if (b.title) out.push(b.title);
    const all = [b.head, ...b.rows].map((r) => r.map(String));
    const widths = b.head.map((_, i) => Math.max(...all.map((r) => (r[i] ?? "").length)));
    const line = (r) => r.map((c, i) => (i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join(" | ").trimEnd();
    out.push(line(all[0]), widths.map((w) => "-".repeat(w)).join("-+-"), ...all.slice(1).map(line), "");
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function copyTables(blocks) {
  const html = `<div style="font-family:Arial,sans-serif">${toHtml(blocks)}</div>`;
  const plain = toPlain(blocks);
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return true;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(plain);
    return true;
  } catch {
    return false;
  }
}
