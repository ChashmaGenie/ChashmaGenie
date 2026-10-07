import { Link } from "react-router-dom";
import { productStats } from "./productFilters.js";
import { useAdminQuotes } from "@/admin/data/AdminQuotes.jsx";

function Stat({ label, value, to, highlight = false }) {
  const content = (
    <>
      <span className="tabular block text-3xl font-semibold text-ink-900">{value}</span>
      <span className="block text-sm text-ink-600">{label}</span>
    </>
  );
  const classes = `rounded-xl border p-4 ${highlight ? "border-gold-500 bg-warn-100" : "border-ink-200 bg-cream-50"}`;
  return to ? (
    <Link to={to} className={`focus-ring block hover:border-ink-800 ${classes}`}>{content}</Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export function DashboardSummary({ products }) {
  const stats = productStats(products);
  const { newCount, status } = useAdminQuotes();
  return (
    <section aria-label="Shop summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="New quote requests" value={status === "ready" ? newCount : "-"} to="/admin/quotes" highlight={newCount > 0} />
      <Stat label="Showing on the shop" value={stats.visible} />
      <Stat label="Hidden products" value={stats.hidden} />
      <Stat label="Out of stock" value={stats.outOfStock} />
    </section>
  );
}
