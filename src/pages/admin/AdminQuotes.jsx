import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Download, Inbox, RefreshCw, Search } from "lucide-react";
import { QUOTE_STATUS } from "@shared/enums.js";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Chip } from "@/components/ui/Chip.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { adminApi } from "@/admin/api.js";
import { LoadError } from "@/admin/components/LoadError.jsx";
import { PageHeader } from "@/admin/components/PageHeader.jsx";
import { StatusChip } from "@/admin/components/StatusChip.jsx";
import { useAdminQuotes } from "@/admin/data/AdminQuotes.jsx";
import { friendlyError } from "@/admin/errors.js";
import { QuoteDrawer } from "@/admin/quotes/QuoteDrawer.jsx";
import { filterQuotes, phoneDisplay, quoteDate } from "@/admin/quotes/quoteFormat.js";

const STATUS_FILTERS = [{ value: "all", label: "All" }, ...QUOTE_STATUS];

function QuoteCard({ entry }) {
  return (
    <li>
      <Link to={`/admin/quotes/${entry.id}`} className="focus-ring flex items-center gap-3 rounded-xl border border-ink-200 bg-cream-50 p-4 hover:border-ink-800">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular font-semibold">{entry.id}</span>
            <StatusChip status={entry.status} />
          </div>
          <p className="mt-1 truncate text-lg font-semibold">{entry.name}</p>
          <p className="text-sm text-ink-600">{[entry.city, phoneDisplay(entry.phone), quoteDate(entry.createdAt)].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 truncate text-base">{entry.itemSummary}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-600" aria-hidden="true" />
      </Link>
    </li>
  );
}

export default function AdminQuotes() {
  const { id: openId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { status, quotes, error, load } = useAdminQuotes();
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const shown = useMemo(() => filterQuotes(quotes, statusFilter, query), [quotes, statusFilter, query]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await adminApi.downloadQuotesCsv();
    } catch (failure) {
      toast.error(friendlyError(failure, "Could not download the file."));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Seo title="Quote requests" noindex />
      <PageHeader
        title="Quote requests"
        subtitle="Customers who asked for a price. Reply on WhatsApp, then update the status."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={exportCsv} loading={exporting} disabled={quotes.length === 0}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
          </>
        }
      />
      {status === "loading" && quotes.length === 0 ? (
        <div className="space-y-3" role="status" aria-label="Loading requests">
          {[0, 1, 2].map((key) => <Skeleton key={key} className="h-28 w-full" />)}
        </div>
      ) : null}
      {status === "error" && quotes.length === 0 ? <LoadError error={error} onRetry={load} what="your requests" /> : null}
      {status === "ready" && quotes.length === 0 ? (
        <EmptyState icon={Inbox} title="No requests yet">
          When a customer asks for a quote, it shows up here. Share your shop link on Instagram and Facebook to get started.
        </EmptyState>
      ) : null}
      {quotes.length > 0 ? (
        <>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-600" aria-hidden="true" />
            <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or reference" aria-label="Search requests" className="ps-11" />
          </div>
          <div role="group" aria-label="Filter by status" className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            {STATUS_FILTERS.map((entry) => (
              <Chip key={entry.value} selected={statusFilter === entry.value} onClick={() => setStatusFilter(entry.value)} className="shrink-0">
                {entry.label}
              </Chip>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState icon={Search} title="Nothing matches" actions={<Button variant="secondary" onClick={() => { setStatusFilter("all"); setQuery(""); }}>Clear search and filters</Button>}>
              Try a different word or status.
            </EmptyState>
          ) : (
            <ul className="space-y-3">{shown.map((entry) => <QuoteCard key={entry.id} entry={entry} />)}</ul>
          )}
        </>
      ) : null}
      {openId ? <QuoteDrawer key={openId} id={openId} onClose={() => navigate("/admin/quotes")} /> : null}
    </div>
  );
}
