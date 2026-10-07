import { useState } from "react";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { friendlyError } from "@/admin/errors.js";

export function ConfirmDialog({ open, title, children, confirmLabel = "Yes, continue", cancelLabel = "Keep it", danger = false, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      title={title}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={confirm} loading={busy}>{confirmLabel}</Button>
        </div>
      }
    >
      <div className="space-y-2 text-base text-ink-800">{children}</div>
    </Modal>
  );
}
