import { useCallback, useEffect, useMemo, useState } from "react";
import { validateSettings } from "@shared/schema.js";
import { Seo } from "@/components/layout/Seo.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { adminApi } from "@/admin/api.js";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog.jsx";
import { FieldBox } from "@/admin/components/FieldBox.jsx";
import { HelpTip } from "@/admin/components/HelpTip.jsx";
import { LoadError } from "@/admin/components/LoadError.jsx";
import { PageHeader } from "@/admin/components/PageHeader.jsx";
import { SaveBar } from "@/admin/components/SaveBar.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { SwitchRow } from "@/admin/components/SwitchRow.jsx";
import { fieldErrorsOf, friendlyError } from "@/admin/errors.js";
import { LookbookEditor } from "@/admin/settings/LookbookEditor.jsx";
import { draftFromSettings, whatsappPreview } from "@/admin/settings/settingsDraft.js";
import { useUnsavedGuard } from "@/admin/useUnsavedGuard.js";
import { focusField } from "@/admin/product/focusField.js";

const SAVED_MESSAGE = "Settings saved. Changes show on the shop within about 5 minutes.";

function TextSetting({ name, label, hint, value, error, onChange, type = "text", ...inputProps }) {
  return (
    <FieldBox name={name}>
      <Field label={label} hint={hint} error={error}>
        <Input type={type} value={value} onChange={(event) => onChange({ [name]: event.target.value })} {...inputProps} />
      </Field>
    </FieldBox>
  );
}

function AreaSetting({ name, label, hint, value, onChange, maxLength }) {
  return (
    <FieldBox name={name}>
      <Field label={label} hint={hint}>
        <Textarea rows={3} value={value} maxLength={maxLength} onChange={(event) => onChange({ [name]: event.target.value })} />
      </Field>
    </FieldBox>
  );
}

function ContactSection({ draft, errors, update }) {
  const preview = whatsappPreview(draft.whatsappNumber);
  return (
    <Section id="contact" title="Contact" description="How customers reach you. Empty items are hidden on the shop.">
      <TextSetting name="businessName" label="Shop name" value={draft.businessName} onChange={update} maxLength={60} />
      <TextSetting name="tagline" label="Tagline" value={draft.tagline} onChange={update} maxLength={80} />
      <TextSetting
        name="whatsappNumber"
        label="WhatsApp number"
        hint={preview || "Type a Pakistani mobile number like 0300-1234567. Leave empty to hide the WhatsApp buttons."}
        value={draft.whatsappNumber}
        error={errors.whatsappNumber}
        onChange={update}
        type="tel"
        inputMode="tel"
        autoComplete="off"
      />
      <TextSetting name="businessEmail" label="Email address" value={draft.businessEmail} error={errors.businessEmail} onChange={update} type="email" inputMode="email" />
    </Section>
  );
}

function SocialSection({ draft, errors, update }) {
  const fields = [
    ["instagramUrl", "Instagram", "https://instagram.com/chashmagenie"],
    ["facebookUrl", "Facebook", "https://facebook.com/chashmagenie"],
    ["tiktokUrl", "TikTok", "https://tiktok.com/@yourname"],
    ["youtubeUrl", "YouTube", "https://youtube.com/@yourname"],
  ];
  return (
    <Section id="social" title="Social links" description="Paste the full link to each page. Leave empty to hide that button.">
      {fields.map(([name, label, placeholder]) => (
        <TextSetting key={name} name={name} label={label} value={draft[name]} error={errors[name]} onChange={update} type="url" inputMode="url" placeholder={placeholder} />
      ))}
    </Section>
  );
}

function AnnouncementSection({ draft, update }) {
  return (
    <Section id="announcement" title="Announcement bar" description="The thin banner at the top of every page.">
      <SwitchRow label="Show the announcement bar" checked={draft.comingSoonEnabled} onChange={(comingSoonEnabled) => update({ comingSoonEnabled })} />
      <TextSetting name="announcementText" label="Announcement text" value={draft.announcementText} onChange={update} maxLength={160} />
    </Section>
  );
}

function InfoSection({ draft, errors, update }) {
  return (
    <Section id="info" title="Shop information" description="Shown on product pages and the delivery and returns page.">
      <AreaSetting name="shippingText" label="Delivery" value={draft.shippingText} onChange={update} maxLength={400} />
      <AreaSetting name="codText" label="Cash on delivery" value={draft.codText} onChange={update} maxLength={400} />
      <AreaSetting name="returnsText" label="Returns" value={draft.returnsText} onChange={update} maxLength={600} />
      <AreaSetting name="warrantyText" label="Warranty" value={draft.warrantyText} onChange={update} maxLength={600} />
      <TextSetting
        name="freeShippingThreshold"
        label="Free delivery above (Rs)"
        hint="Type 0 to turn this off."
        value={draft.freeShippingThreshold}
        error={errors.freeShippingThreshold}
        onChange={(patch) => update({ freeShippingThreshold: patch.freeShippingThreshold.replace(/\D/g, "") })}
        inputMode="numeric"
      />
    </Section>
  );
}

function AnalyticsSection({ draft, update }) {
  return (
    <Section id="analytics" title="Analytics" description="Optional. Helps you see how many people visit from Instagram and Facebook.">
      <TextSetting
        name="cfAnalyticsToken"
        label="Cloudflare Web Analytics token"
        hint="Copy it from Cloudflare under Web Analytics. Leave empty if you do not use it."
        value={draft.cfAnalyticsToken}
        onChange={update}
        maxLength={64}
        autoComplete="off"
      />
      <TextSetting name="metaPixelId" label="Meta Pixel ID" value={draft.metaPixelId} onChange={update} maxLength={24} inputMode="numeric" autoComplete="off" />
      <SwitchRow
        label="Turn the Meta Pixel on"
        hint="Visitors are asked for permission first."
        checked={draft.metaPixelEnabled}
        onChange={(metaPixelEnabled) => update({ metaPixelEnabled })}
      />
    </Section>
  );
}

function SettingsForm({ initial, onSaved }) {
  const toast = useToast();
  const [baseline, setBaseline] = useState(() => draftFromSettings(initial));
  const [draft, setDraft] = useState(baseline);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  const guard = useUnsavedGuard(dirty);

  const update = useCallback((patch) => setDraft((current) => ({ ...current, ...patch })), []);

  const showErrors = (found) => {
    setErrors(found);
    const [first] = Object.keys(found);
    if (first) focusField(first);
  };

  const save = async () => {
    const checked = validateSettings(draft);
    if (!checked.ok) return showErrors(checked.errors);
    setErrors({});
    setSaving(true);
    try {
      const saved = await adminApi.saveSettings(checked.value);
      const next = draftFromSettings(saved ?? checked.value);
      setBaseline(next);
      setDraft(next);
      onSaved(saved ?? checked.value);
      toast.success(SAVED_MESSAGE);
    } catch (error) {
      const fromServer = fieldErrorsOf(error);
      if (Object.keys(fromServer).length > 0) showErrors(fromServer);
      else toast.error(friendlyError(error, "Could not save. Please try again."));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <div className="space-y-5">
      <ContactSection draft={draft} errors={errors} update={update} />
      <SocialSection draft={draft} errors={errors} update={update} />
      <AnnouncementSection draft={draft} update={update} />
      <InfoSection draft={draft} errors={errors} update={update} />
      <AnalyticsSection draft={draft} update={update} />
      <Section id="lookbook" title="Shop the look" description="Pick up to 12 products to show together on the home page.">
        <LookbookEditor lookbook={draft.lookbook} onChange={(lookbook) => update({ lookbook })} />
      </Section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} saveLabel="Save settings" />
      <ConfirmDialog
        open={Boolean(guard.pendingPath)}
        danger
        title="Leave without saving?"
        confirmLabel="Leave"
        cancelLabel="Keep editing"
        onConfirm={() => guard.leaveNow(guard.pendingPath)}
        onCancel={guard.stay}
      >
        <p>Your changes on this page will be lost.</p>
      </ConfirmDialog>
    </div>
  );
}

export default function AdminSettings() {
  const [state, setState] = useState({ status: "loading", settings: null, error: null });

  const load = useCallback(async () => {
    setState({ status: "loading", settings: null, error: null });
    try {
      setState({ status: "ready", settings: await adminApi.settings(), error: null });
    } catch (error) {
      setState({ status: "error", settings: null, error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl">
      <Seo title="Settings" noindex />
      <PageHeader
        title="Settings"
        subtitle={
          <>
            Contact details, links and texts for your shop.
            <HelpTip label="About settings">Changes can take about 5 minutes to appear for customers.</HelpTip>
          </>
        }
      />
      {state.status === "loading" ? (
        <div className="space-y-4" role="status" aria-label="Loading settings">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}
      {state.status === "error" ? <LoadError error={state.error} onRetry={load} what="your settings" /> : null}
      {state.status === "ready" ? (
        <SettingsForm initial={state.settings} onSaved={(settings) => setState((current) => ({ ...current, settings }))} />
      ) : null}
    </div>
  );
}
