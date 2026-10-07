import { QUOTE_STATUS, labelOf } from "@shared/enums.js";
import { Badge } from "@/components/ui/Badge.jsx";

const TONE_BY_STATUS = {
  new: "gold",
  contacted: "neutral",
  quoted: "warn",
  won: "teal",
  lost: "danger",
};

export function StatusChip({ status }) {
  return <Badge tone={TONE_BY_STATUS[status] ?? "neutral"}>{labelOf(QUOTE_STATUS, status) || status}</Badge>;
}
