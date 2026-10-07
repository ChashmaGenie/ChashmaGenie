import { useCallback, useEffect, useState } from "react";
import { Copy, Mail, Phone, Printer, Trash2 } from "lucide-react";
import { QUOTE_STATUS } from "@shared/enums.js";
import { Button } from "@/components/ui/Button.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Select, Textarea } from "@/components/ui/Input.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { Drawer } from "@/components/ui/Modal.jsx";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { formatPkr } from "@/lib/format.js";
import { waLink } from "@/lib/whatsapp.js";
import { adminApi } from "@/admin/api.js";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog.jsx";
import { LoadError } from "@/admin/components/LoadError.jsx";
import { StatusChip } from "@/admin/components/StatusChip.jsx";
import { useAdminQuotes } from "@/admin/data/AdminQuotes.jsx";
import { friendlyError } from "@/admin/errors.js";
import { RxTable } from "./RxTable.jsx";
import { printQuoteRx } from "./printRx.js";
import { attributionLine, channelLabel, itemLine, lensLine, phoneDisplay, quoteDate, rxPlainText, usageLabel, whatsappGreeting } from "./quoteFormat.js";

const contactButtonClasses = "w-full sm:w-auto";

function Block({ title, children }) {
  return (
    <section className="border-b border-ink-200 py-4 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-600">{title}</h3>
      {children}
    </section>
  );
}

function ContactBlock({ quote }) {
  const { contact } = quote;
  const phone = contact.phone ?? "";
  return (
    <Block title="Customer">
      <p className="text-lg font-semibold">{contact.name}</p>
      <p className="tabular text-base">{phoneDisplay(phone)}</p>
      <p className="text-base text-ink-600">{contact.city}. Prefers {channelLabel(contact.channel)}.</p>
      {contact.email ? <p className="break-all text-base">{contact.email}</p> : null}
      {contact.notes ? <p className="mt-2 rounded-xl bg-cream-200 p-3 text-base">"{contact.notes}"</p> : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="teal" className={contactButtonClasses} href={waLink(phone, whatsappGreeting(quote))} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="h-5 w-5" />
          Reply on WhatsApp
        </Button>
        <Button variant="secondary" className={contactButtonClasses} href={`tel:+${phone}`}>
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call
        </Button>
        {contact.email ? (
          <Button variant="secondary" className={contactButtonClasses} href={`mailto:${contact.email}?subject=${encodeURIComponent(`Your ChashmaGenie quote ${quote.id}`)}`}>
            <Mail className="h-5 w-5" aria-hidden="true" />
            Email
          </Button>
        ) : null}
      </div>
    </Block>
  );
}

function OrderBlock({ quote }) {
  return (
    <Block title="What they want">
      <ul className="space-y-1">
        {quote.items.map((item, index) => (
          <li key={`${item.productId}-${index}`} className="flex items-baseline justify-between gap-3 text-base">
            <span>{itemLine(item)}</span>
            {item.ownFrame ? null : <span className="tabular shrink-0 font-semibold">{formatPkr(item.framePrice)}</span>}
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 text-base">
        <div className="flex gap-2"><dt className="font-semibold">Use:</dt><dd>{usageLabel(quote.usage)}</dd></div>
        <div className="flex gap-2"><dt className="shrink-0 font-semibold">Lenses:</dt><dd>{lensLine(quote.lensPackage)}</dd></div>
        {quote.lensPackage?.tintColor ? <div className="flex gap-2"><dt className="font-semibold">Tint:</dt><dd className="capitalize">{quote.lensPackage.tintColor}</dd></div> : null}
      </dl>
    </Block>
  );
}

function PrescriptionBlock({ quote, onCopy }) {
  return (
    <Block title="Prescription">
      <RxTable rx={quote.rx} />
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" onClick={onCopy}>
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy
        </Button>
        <Button variant="secondary" size="sm" onClick={() => printQuoteRx(quote)}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print
        </Button>
      </div>
    </Block>
  );
}

function ManageBlock({ quote, onStatus, onNotes, onDelete }) {
  const [notes, setNotes] = useState(quote.ownerNotes ?? "");
  const saveNotes = () => {
    if (notes !== (quote.ownerNotes ?? "")) onNotes(notes);
  };
  return (
    <Block title="Your follow-up">
      <div className="space-y-4">
        <Field label="Status">
          <Select value={quote.status} onChange={(event) => onStatus(event.target.value)}>
            {QUOTE_STATUS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </Select>
        </Field>
        <Field label="Your private notes" hint="Only you can see these. They save when you tap outside the box.">
          <Textarea value={notes} rows={3} maxLength={1000} onChange={(event) => setNotes(event.target.value)} onBlur={saveNotes} />
        </Field>
        <p className="text-sm text-ink-600">Came from: {attributionLine(quote.attribution)}</p>
        <Button variant="ghost" className="text-danger-600" onClick={onDelete}>
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          Delete this request
        </Button>
      </div>
    </Block>
  );
}

const copyText = async (text) => {
  await navigator.clipboard.writeText(text);
};

export function QuoteDrawer({ id, onClose }) {
  const toast = useToast();
  const { patchEntry, removeEntry } = useAdminQuotes();
  const [state, setState] = useState({ status: "loading", quote: null, error: null });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setState({ status: "loading", quote: null, error: null });
    try {
      const quote = await adminApi.quote(id);
      setState({ status: "ready", quote, error: null });
    } catch (error) {
      setState({ status: "error", quote: null, error });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const applyPatch = async (patch, successMessage) => {
    const previous = state.quote;
    setState((current) => ({ ...current, quote: { ...current.quote, ...patch } }));
    patchEntry(id, patch.status ? { status: patch.status } : {});
    try {
      await adminApi.patchQuote(id, patch);
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      setState((current) => ({ ...current, quote: previous }));
      patchEntry(id, { status: previous.status });
      toast.error(friendlyError(error, "Could not save that change."));
    }
  };

  const copyPrescription = async () => {
    try {
      await copyText(rxPlainText(state.quote));
      toast.success("Prescription copied.");
    } catch {
      toast.error("Could not copy. Please copy it by hand.");
    }
  };

  const remove = async () => {
    await adminApi.deleteQuote(id);
    removeEntry(id);
    toast.success("Request deleted.");
    onClose();
  };

  const { quote } = state;
  return (
    <Drawer open onClose={onClose} title={quote ? `Request ${quote.id}` : "Quote request"}>
      {state.status === "loading" ? (
        <div className="space-y-3" role="status" aria-label="Loading request">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : null}
      {state.status === "error" ? <LoadError error={state.error} onRetry={load} what="this request" /> : null}
      {quote ? (
        <div>
          <p className="mb-1 flex flex-wrap items-center gap-2 text-sm text-ink-600">
            <StatusChip status={quote.status} />
            Sent {quoteDate(quote.createdAt)}
          </p>
          <ContactBlock quote={quote} />
          <OrderBlock quote={quote} />
          <PrescriptionBlock quote={quote} onCopy={copyPrescription} />
          <ManageBlock quote={quote} onStatus={(status) => applyPatch({ status })} onNotes={(ownerNotes) => applyPatch({ ownerNotes }, "Notes saved.")} onDelete={() => setConfirmDelete(true)} />
        </div>
      ) : null}
      <ConfirmDialog open={confirmDelete} danger title="Delete this request?" confirmLabel="Yes, delete it" onConfirm={remove} onCancel={() => setConfirmDelete(false)}>
        <p>The request and the customer's details will be removed for good.</p>
      </ConfirmDialog>
    </Drawer>
  );
}
