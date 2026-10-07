const PALETTE = {
  ink900: "#0B1F2E",
  ink800: "#0F2A3F",
  ink600: "#4B5B6B",
  cream100: "#FBF6EA",
  gold400: "#F2B705",
  gold700: "#7A5200",
  teal600: "#0E6B5C",
  teal700: "#0A5347",
  sky700: "#0B6FA0",
  sky500: "#0095D9",
  danger600: "#B42318",
  warn800: "#7A4B00",
  warn100: "#FEF3C7",
  teal100: "#D8EFE9",
  white: "#FFFFFF",
};

const CHECKS = [
  ["ink800", "cream100", 13.5, "body text on page"],
  ["ink800", "gold400", 8, "CTA label"],
  ["ink600", "cream100", 6, "secondary text"],
  ["teal600", "white", 6, "teal text on white"],
  ["teal600", "cream100", 5.5, "teal text on cream"],
  ["white", "teal600", 6, "white on teal"],
  ["sky700", "white", 5, "link on white"],
  ["danger600", "white", 6, "error text"],
  ["cream100", "ink900", 15, "footer text"],
  ["gold400", "ink900", 8.5, "gold accents on dark"],
  ["gold700", "white", 4.5, "gold text on white"],
  ["warn800", "warn100", 4.5, "warning text"],
  ["teal700", "teal100", 4.5, "teal badge"],
  ["sky500", "white", 3, "sky graphics only"],
];

const channelToLinear = (channel) => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return 0.2126 * channelToLinear(red) + 0.7152 * channelToLinear(green) + 0.0722 * channelToLinear(blue);
};

const contrastRatio = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

const failures = CHECKS.map(([fg, bg, minimum, label]) => ({
  label,
  minimum,
  ratio: contrastRatio(PALETTE[fg], PALETTE[bg]),
})).filter(({ ratio, minimum }) => ratio < minimum);

failures.forEach(({ label, minimum, ratio }) =>
  console.error(`FAIL ${label}: ${ratio.toFixed(2)}:1 (needs ${minimum}:1)`),
);

if (failures.length > 0) process.exit(1);
console.log(`Contrast OK (${CHECKS.length} pairs)`);
