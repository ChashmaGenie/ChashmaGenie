import { AlertCircle, ArrowLeft, ArrowRight, Loader2, RotateCw, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { Dropzone } from "@/admin/components/Dropzone.jsx";
import { HelpTip } from "@/admin/components/HelpTip.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { MAX_PHOTOS } from "./photoList.js";

const STATUS_LABELS = { preparing: "Shrinking photo", uploading: "Uploading" };

function PhotoTile({ photo, index, total, controls }) {
  const working = photo.status === "preparing" || photo.status === "uploading";
  const position = `photo ${index + 1} of ${total}`;
  return (
    <li className="overflow-hidden rounded-xl border border-ink-200 bg-cream-50">
      <div className="relative aspect-square bg-cream-200">
        <img src={photo.previewUrl} alt={`Preview of ${position}`} className="h-full w-full object-cover" />
        {index === 0 ? <Badge tone="gold" className="absolute start-2 top-2">Main photo</Badge> : null}
        {working ? (
          <div className="absolute inset-0 grid place-items-center bg-ink-900/60 text-cream-100" role="status">
            <span className="flex flex-col items-center gap-2 text-sm font-semibold">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              {STATUS_LABELS[photo.status]}
            </span>
          </div>
        ) : null}
        {photo.status === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-danger-100/95 p-3 text-center" role="alert">
            <span className="flex flex-col items-center gap-2 text-sm font-semibold text-danger-600">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
              {photo.error}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 p-1.5">
        <div className="flex">
          <button type="button" aria-label={`Move ${position} earlier`} disabled={index === 0 || working} onClick={() => controls.move(index, -1)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg hover:bg-ink-100 disabled:opacity-40">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Move ${position} later`} disabled={index === total - 1 || working} onClick={() => controls.move(index, 1)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg hover:bg-ink-100 disabled:opacity-40">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          {photo.status === "error" && photo.file ? (
            <button type="button" aria-label={`Try ${position} again`} onClick={() => controls.retry(photo.key)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg hover:bg-ink-100">
              <RotateCw className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
          {photo.status === "done" && index > 0 ? (
            <button type="button" aria-label={`Make ${position} the main photo`} onClick={() => controls.makeMain(index)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg hover:bg-ink-100">
              <Star className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <button type="button" aria-label={`Delete ${position}`} onClick={() => controls.remove(photo.key)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg text-danger-600 hover:bg-danger-100">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export function ProductPhotos({ uploads, error }) {
  const toast = useToast();
  const remaining = MAX_PHOTOS - uploads.photos.length;

  const addFiles = async (files) => {
    const { skipped } = await uploads.addFiles(files);
    if (skipped > 0) toast.error(`Only ${MAX_PHOTOS} photos are allowed. ${skipped} not added.`);
  };

  return (
    <Section id="photos" title="Photos" description="The first photo is the main one customers see.">
      <div data-field="images" className="space-y-4">
        <p className="flex items-center gap-1 text-sm text-ink-600">
          Use a plain light background. Show the front first, then the side.
          <HelpTip label="Photo tips">Stand near a window for soft light. Put the glasses on a plain white or cream sheet. Take the front view first, then the side, then the inside of the arm.</HelpTip>
        </p>
        {uploads.photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {uploads.photos.map((photo, index) => (
              <PhotoTile key={photo.key} photo={photo} index={index} total={uploads.photos.length} controls={uploads} />
            ))}
          </ul>
        ) : null}
        {remaining > 0 ? <Dropzone onFiles={addFiles} remaining={remaining} /> : <p className="text-base font-medium">You have added the maximum of {MAX_PHOTOS} photos.</p>}
        {error ? <p role="alert" className="text-sm font-medium text-danger-600">{error}</p> : null}
        {uploads.hasFailed ? <p className="text-sm font-medium text-danger-600">Try again or delete the photos that failed before saving.</p> : null}
      </div>
    </Section>
  );
}
