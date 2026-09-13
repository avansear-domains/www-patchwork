export type Theme = {
  name: string;
  bg: string;
  fg: string;
};

// Single source of truth for colors. First entry is the default.
// Circles in the navbar render right-to-left in this order.
export const themes: Theme[] = [
  { name: "noire", bg: "#0f0f0e", fg: "#f196e5" },
  { name: "beach", bg: "#ffeff5", fg: "#1f7cff" },
  { name: "rosie", bg: "#9e2b25", fg: "#fff8f0" },
  { name: "peach", bg: "#FAD4C6", fg: "#EA481F" },
];

export const defaultTheme = themes[0].name;
export const THEME_KEY = "theme";

// CSS that sets --bg-color / --fg-color per theme, injected in the root layout.
export const themeCss = themes
  .map(
    (t, i) =>
      `${i === 0 ? ":root," : ""}[data-theme="${t.name}"]{--bg-color:${t.bg};--fg-color:${t.fg}}`,
  )
  .join("\n");
