import { useEffect, useMemo, useRef, useState } from "react";
import { validateProduct } from "@shared/schema.js";
import { Info } from "lucide-react";
import { useToast } from "@/components/ui/Toast.jsx";
import { ApiError } from "@/lib/api.js";
import { SaveBar } from "@/admin/components/SaveBar.jsx";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog.jsx";
import { useAdminCatalog } from "@/admin/data/AdminCatalog.jsx";
import { adminApi } from "@/admin/api.js";
import { fieldErrorsOf, friendlyError } from "@/admin/errors.js";
import { useUnsavedGuard } from "@/admin/useUnsavedGuard.js";
import { ErrorSummary } from "./ErrorSummary.jsx";
import { ProductBasics } from "./ProductBasics.jsx";
import { ProductLens } from "./ProductLens.jsx";
import { ProductOptions } from "./ProductOptions.jsx";
import { ProductPhotos } from "./ProductPhotos.jsx";
import { ProductStyle } from "./ProductStyle.jsx";
import { blankDraft, draftFromProduct, errorSectionOf, isLensCategory, payloadFromDraft } from "./productDraft.js";
import { usePhotoUploads } from "./usePhotoUploads.js";

const PRODUCTS_PATH = "/admin/products";
const SECTION_ORDER = ["photos", "basics", "style", "lens"];
const SAVED_MESSAGE = "Saved. It will show on the shop within about 5 minutes.";
const DUPLICATE_NAME_MESSAGE = "Another product already uses this name. Change the name a little.";

const sortedErrors = (errors) => Object.fromEntries(Object.keys(errors).sort((a, b) => SECTION_ORDER.indexOf(errorSectionOf(a)) - SECTION_ORDER.indexOf(errorSectionOf(b))).map((path) => [path, errors[path]]));

const serverErrors = (error) => {
  if (error instanceof ApiError && error.status === 409) return { name: DUPLICATE_NAME_MESSAGE };
  return fieldErrorsOf(error);
};

const sameList = (a, b) => a.length === b.length && a.every((entry, index) => entry === b[index]);

export function ProductEditor({ product }) {
  const { saveProduct } = useAdminCatalog();
  const toast = useToast();
  const [draft, setDraft] = useState(() => (product ? draftFromProduct(product) : blankDraft()));
  const [initialSnapshot] = useState(() => JSON.stringify(draft));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef(null);
  const uploads = usePhotoUploads(product?.images ?? []);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== initialSnapshot || !sameList(uploads.refs, product?.images ?? []),
    [draft, initialSnapshot, uploads.refs, product],
  );
  const guard = useUnsavedGuard(dirty);

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const isLens = isLensCategory(draft.category);

  const showErrors = (found) => setErrors(sortedErrors(found));

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    summaryRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    summaryRef.current?.focus({ preventScroll: true });
  }, [errors]);

  const cleanUpOrphans = (savedRefs) =>
    Promise.allSettled(uploads.orphanedIds(savedRefs).map((id) => adminApi.deleteImage(id)));

  const save = async () => {
    if (uploads.busy) return toast.error("Please wait for the photos to finish uploading.");
    if (uploads.hasFailed) return toast.error("Some photos did not upload. Try again or delete them.");
    const checked = validateProduct(payloadFromDraft(draft, { images: uploads.refs, base: product }));
    if (!checked.ok) return showErrors(checked.errors);
    setErrors({});
    setSaving(true);
    try {
      await saveProduct(checked.value, product?.id);
      cleanUpOrphans(checked.value.images);
      toast.success(SAVED_MESSAGE);
      guard.leaveNow(PRODUCTS_PATH);
    } catch (error) {
      const fromServer = serverErrors(error);
      if (Object.keys(fromServer).length > 0) showErrors(fromServer);
      else toast.error(friendlyError(error, "Could not save. Please try again."));
      setSaving(false);
    }
    return undefined;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-5">
        {product?.sample ? (
          <p className="flex items-start gap-2 rounded-xl bg-warn-100 p-3 text-base text-warn-800">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            This is a sample product. When you save it, it becomes your own product.
          </p>
        ) : null}
        <ErrorSummary ref={summaryRef} errors={errors} />
        <ProductPhotos uploads={uploads} error={errors.images} />
        <ProductBasics draft={draft} update={update} errors={errors} />
        {isLens ? <ProductLens draft={draft} update={update} errors={errors} /> : <ProductStyle draft={draft} update={update} errors={errors} />}
        <ProductOptions draft={draft} update={update} />
      </div>
      <SaveBar dirty={dirty} saving={saving} disabled={uploads.busy} onSave={save} onCancel={() => guard.requestLeave(PRODUCTS_PATH)} />
      <ConfirmDialog
        open={Boolean(guard.pendingPath)}
        title="Leave without saving?"
        confirmLabel="Leave"
        cancelLabel="Keep editing"
        danger
        onConfirm={() => guard.leaveNow(guard.pendingPath)}
        onCancel={guard.stay}
      >
        <p>Your changes on this page will be lost.</p>
      </ConfirmDialog>
    </div>
  );
}
