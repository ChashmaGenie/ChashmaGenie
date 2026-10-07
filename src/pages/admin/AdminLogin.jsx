import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { ApiError } from "@/lib/api.js";
import { useAdminSession } from "@/admin/data/session.jsx";
import { friendlyError } from "@/admin/errors.js";

const loginMessage = (error) => {
  if (error instanceof ApiError && error.code === "invalid_credentials") return "That password didn't work. Please try again.";
  return friendlyError(error, "Could not log in. Please try again.");
};

export default function AdminLogin() {
  const { login } = useAdminSession();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError("Please type your password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(password);
    } catch (failure) {
      setError(loginMessage(failure));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Seo title="Admin login" noindex />
      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-cream-50 p-6 shadow-sh-2">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={logo} alt="ChashmaGenie" width="72" height="72" className="h-[72px] w-[72px] rounded-xl" />
          <h1 className="text-3xl">Shop admin</h1>
          <p className="text-base text-ink-600">Log in to add glasses, answer quote requests and update your shop.</p>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Password" error={error}>
            <div className="relative">
              <Input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                autoFocus
                className="pe-14"
              />
              <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className="focus-ring absolute end-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink-600 hover:bg-ink-100"
              >
                {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </Field>
          <Button type="submit" fullWidth size="lg" loading={busy}>
            <Lock className="h-5 w-5" aria-hidden="true" />
            Log in
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-600">Forgot your password? Ask whoever set up your shop to reset it in Cloudflare.</p>
      </div>
    </div>
  );
}
