import { Facebook, Instagram, Music2, Youtube } from "lucide-react";
import { withOutboundUtm } from "@/lib/utm.js";

const CHANNELS = [
  { key: "instagram", label: "Instagram", Icon: Instagram, setting: "instagramUrl", blurb: "New arrivals, styling ideas and behind-the-scenes." },
  { key: "facebook", label: "Facebook", Icon: Facebook, setting: "facebookUrl", blurb: "Updates, offers and the opening of our store." },
  { key: "tiktok", label: "TikTok", Icon: Music2, setting: "tiktokUrl", blurb: "Short clips on frames, fits and lens tips." },
  { key: "youtube", label: "YouTube", Icon: Youtube, setting: "youtubeUrl", blurb: "Guides to choosing frames and lenses." },
];

export const socialChannels = (settings, medium) =>
  CHANNELS.filter((channel) => settings[channel.setting]).map(({ setting, ...channel }) => ({
    ...channel,
    handle: handleOf(settings[setting]),
    href: withOutboundUtm(settings[setting], { source: "website", medium }),
  }));

const handleOf = (url) => {
  try {
    const segment = new URL(url).pathname.split("/").filter(Boolean)[0];
    return segment ? `@${segment.replace(/^@/, "")}` : "";
  } catch {
    return "";
  }
};
