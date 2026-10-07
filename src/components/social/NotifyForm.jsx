import { useState } from "react";
import { postNotify } from "@/lib/api.js";
import { Button } from "@/components/ui/Button.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { useToast } from "@/components/ui/Toast.jsx";

const FALLBACK_ERROR = "Please enter a valid email address or mobile number.";
const SUCCESS_MESSAGE = "Thank you. We will tell you when the store opens.";

export function NotifyForm({ id = "notify-contact" }) {
  const toast = useToast();
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await postNotify({ contact: contact.trim(), website: honeypot });
      setContact("");
      toast.success(SUCCESS_MESSAGE);
    } catch (failure) {
      setError(failure.fields?.contact ?? (failure.status === 429 ? "Too many tries. Please try again later." : FALLBACK_ERROR));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <Field label="Email or mobile number" error={error} className="flex-1">
        <Input
          id={id}
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="you@example.com or 03XX XXXXXXX"
          autoComplete="email"
          inputMode="email"
        />
      </Field>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -start-[9999px] h-0 w-0 opacity-0"
      />
      <Button type="submit" loading={busy} className="sm:mt-[26px]">Notify me</Button>
    </form>
  );
}
