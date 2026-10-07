import { useState } from "react";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { formatDate } from "@/lib/format.js";
import { adminApi } from "@/admin/api.js";
import { friendlyError } from "@/admin/errors.js";

export function NotifyList() {
  const toast = useToast();
  const [entries, setEntries] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      setEntries(await adminApi.notifyList());
    } catch (error) {
      toast.error(friendlyError(error, "Could not load the list."));
    } finally {
      setBusy(false);
    }
  };

  const download = () =>
    adminApi.downloadNotifyCsv().catch((error) => toast.error(friendlyError(error, "Could not download the file.")));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={load} loading={busy}>
          <Users className="h-5 w-5" aria-hidden="true" />
          {entries ? "Refresh list" : "Show the list"}
        </Button>
        <Button variant="secondary" onClick={download}>
          <Download className="h-5 w-5" aria-hidden="true" />
          Download CSV
        </Button>
      </div>
      {entries && entries.length === 0 ? <p className="text-base text-ink-600">Nobody has signed up yet.</p> : null}
      {entries && entries.length > 0 ? (
        <div className="max-h-80 overflow-auto rounded-xl border border-ink-200">
          <table className="w-full text-start text-base">
            <caption className="sr-only">People who want to hear when the store opens</caption>
            <thead className="sticky top-0 bg-ink-100 text-sm">
              <tr>
                <th scope="col" className="p-3 text-start">Contact</th>
                <th scope="col" className="p-3 text-start">Type</th>
                <th scope="col" className="p-3 text-start">Joined</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.kind}-${entry.contact}`} className="border-t border-ink-200">
                  <td className="break-all p-3">{entry.contact}</td>
                  <td className="p-3 capitalize">{entry.kind}</td>
                  <td className="p-3">{formatDate(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
