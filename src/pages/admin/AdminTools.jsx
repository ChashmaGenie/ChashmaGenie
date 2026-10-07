import { useEffect, useState } from "react";
import { Eraser, Sparkles, Trash2 } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog.jsx";
import { PageHeader } from "@/admin/components/PageHeader.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { CATALOG_STATUS, useAdminCatalog } from "@/admin/data/AdminCatalog.jsx";
import { sampleProducts } from "@/admin/data/productList.js";
import { adminApi } from "@/admin/api.js";
import { friendlyError } from "@/admin/errors.js";
import { HelpTopics } from "@/admin/tools/HelpTopics.jsx";
import { NotifyList } from "@/admin/tools/NotifyList.jsx";
import { UtmBuilder } from "@/admin/tools/UtmBuilder.jsx";

function SampleCatalogSection() {
  const { status, products, ensureLoaded, loadSamples, removeSamples } = useAdminCatalog();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const sampleCount = sampleProducts(products).length;
  const ready = status === CATALOG_STATUS.ready;
  const canLoad = ready && products.length === 0;

  const load = async () => {
    setLoading(true);
    try {
      await loadSamples();
      toast.success("Sample catalog loaded.");
    } catch (error) {
      toast.error(friendlyError(error, "Could not load the sample catalog."));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    await removeSamples();
    toast.success("Sample products deleted.");
    setConfirmRemove(false);
  };

  return (
    <Section id="samples" title="Sample products" description="Demo glasses that show how your shop looks. Delete them when you have your own.">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={load} loading={loading} disabled={!canLoad}>
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          Load sample catalog
        </Button>
        <Button variant="secondary" onClick={() => setConfirmRemove(true)} disabled={sampleCount === 0}>
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          Delete sample products{sampleCount > 0 ? ` (${sampleCount})` : ""}
        </Button>
      </div>
      {ready && !canLoad ? <p className="text-sm text-ink-600">You can load the samples only when the shop is empty, so your own products are never replaced.</p> : null}
      <ConfirmDialog open={confirmRemove} danger title="Delete all sample products?" confirmLabel={`Yes, delete ${sampleCount}`} onConfirm={remove} onCancel={() => setConfirmRemove(false)}>
        <p>Products you added yourself stay. Only the demo products are removed.</p>
      </ConfirmDialog>
    </Section>
  );
}

function UnusedPhotosSection() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const tidy = async () => {
    setBusy(true);
    try {
      const { removed, remaining } = await adminApi.removeUnusedPhotos();
      toast.success(removed === 0 ? "No unused photos found." : `Removed ${removed} unused ${removed === 1 ? "photo" : "photos"}.${remaining > 0 ? " Tap again to remove more." : ""}`);
    } catch (error) {
      toast.error(friendlyError(error, "Could not tidy the photos."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section id="photos" title="Tidy photos" description="Removes photos that were uploaded but never used by a product. Photos added in the last hour are kept.">
      <Button variant="secondary" onClick={tidy} loading={busy}>
        <Eraser className="h-5 w-5" aria-hidden="true" />
        Remove unused photos
      </Button>
    </Section>
  );
}

export default function AdminTools() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Seo title="Tools" noindex />
      <PageHeader title="Tools" subtitle="Helpers for sharing your shop and managing the basics." />
      <Section id="links" title="Link builder" description="Make a special link for each place you post. Later you can see which one brought customers.">
        <UtmBuilder />
      </Section>
      <SampleCatalogSection />
      <UnusedPhotosSection />
      <Section id="notify" title="Opening-soon list" description="People who asked to hear when the physical store opens.">
        <NotifyList />
      </Section>
      <Section id="help" title="Help">
        <HelpTopics />
      </Section>
    </div>
  );
}
