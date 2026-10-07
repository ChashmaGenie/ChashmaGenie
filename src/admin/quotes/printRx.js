import { formatPd, rxFlags, rxRows, rxStatusNote } from "./quoteFormat.js";

const escapeHtml = (text) =>
  String(text ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

const rowHtml = (row) =>
  `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.sph)}</td><td>${escapeHtml(row.cyl)}</td><td>${escapeHtml(row.axis)}</td><td>${escapeHtml(row.add)}</td></tr>`;

const tableHtml = (rx) => `
  <table>
    <thead><tr><th></th><th>SPH</th><th>CYL</th><th>AXIS</th><th>ADD</th></tr></thead>
    <tbody>${rxRows(rx).map(rowHtml).join("")}</tbody>
  </table>
  <p><strong>PD:</strong> ${escapeHtml(formatPd(rx))}</p>
  ${rxFlags(rx).map((flag) => `<p class="flag">Check: ${escapeHtml(flag)}</p>`).join("")}`;

const documentHtml = (quote) => `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(quote.id)}</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;color:#0f2a3f;padding:24px}
  table{border-collapse:collapse;margin:12px 0}
  th,td{border:1px solid #4b5b6b;padding:8px 14px;text-align:center}
  .flag{color:#b42318;font-weight:600}
</style></head><body>
<h1>Prescription for quote ${escapeHtml(quote.id)}</h1>
<p>${escapeHtml(quote.contact?.name)}</p>
${rxStatusNote(quote.rx) ? `<p>${escapeHtml(rxStatusNote(quote.rx))}</p>` : tableHtml(quote.rx)}
</body></html>`;

export const printQuoteRx = (quote) => {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
  frame.srcdoc = documentHtml(quote);
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1000);
  };
  document.body.appendChild(frame);
};
