import { useMemo, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { useAdminCatalog } from "@/admin/data/AdminCatalog.jsx";
import { PLATFORM_PRESETS, buildTaggedUrl, pageOptions } from "./utmBuilder.js";

export function UtmBuilder() {
  const { products } = useAdminCatalog();
  const toast = useToast();
  const pages = useMemo(() => pageOptions(products), [products]);
  const [path, setPath] = useState("/links");
  const [presetValue, setPresetValue] = useState(PLATFORM_PRESETS[0].value);
  const [campaign, setCampaign] = useState("");

  const preset = PLATFORM_PRESETS.find((entry) => entry.value === presetValue);
  const url = buildTaggedUrl({ origin: window.location.origin, path, preset, campaign });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Paste it where you need it.");
    } catch {
      toast.error("Could not copy. Press and hold the link to copy it.");
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Which page should the link open?">
        <Select value={path} onChange={(event) => setPath(event.target.value)}>
          {pages.map((page) => <option key={page.path} value={page.path}>{page.label}</option>)}
        </Select>
      </Field>
      <Field label="Where will you post this link?">
        <Select value={presetValue} onChange={(event) => setPresetValue(event.target.value)}>
          {PLATFORM_PRESETS.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
        </Select>
      </Field>
      <Field label="Campaign name (optional)" hint="For example: eid sale. It helps you see which post brought visitors.">
        <Input value={campaign} maxLength={40} onChange={(event) => setCampaign(event.target.value)} />
      </Field>
      <div className="rounded-xl bg-cream-200 p-3">
        <p className="text-sm text-ink-600">Your link</p>
        <p data-testid="tagged-url" className="break-all text-base font-medium">{url}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={copy}>
          <Copy className="h-5 w-5" aria-hidden="true" />
          Copy link
        </Button>
        <Button variant="secondary" href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
          Open
        </Button>
      </div>
    </div>
  );
}
