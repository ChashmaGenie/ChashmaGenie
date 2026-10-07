import { ArrowUpRight } from "lucide-react";
import { useSettings } from "@/lib/settings.jsx";
import { socialChannels } from "./socialChannels.js";

function FollowCard({ channel }) {
  const { Icon, label, handle, blurb, href } = channel;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring group flex items-center gap-4 rounded-xl border border-ink-200 bg-cream-50 p-4 transition-colors duration-150 hover:border-ink-800"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-900 text-gold-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-ink-900">
          {label}
          {handle ? <span className="ms-2 text-sm font-medium text-ink-600">{handle}</span> : null}
        </span>
        <span className="block text-sm text-ink-600">{blurb}</span>
      </span>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-600 group-hover:text-ink-900" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function FollowCards({ medium = "home", className }) {
  const settings = useSettings();
  const channels = socialChannels(settings, medium);
  if (channels.length === 0) return null;
  return (
    <ul className={className ?? "grid gap-3 sm:grid-cols-2"}>
      {channels.map((channel) => (
        <li key={channel.key}>
          <FollowCard channel={channel} />
        </li>
      ))}
    </ul>
  );
}
