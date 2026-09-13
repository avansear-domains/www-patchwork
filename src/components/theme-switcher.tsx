"use client";

import { useSyncExternalStore } from "react";
import { defaultTheme, themes, THEME_KEY } from "@/lib/themes";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") ?? defaultTheme;
}

function setTheme(name: string) {
  document.documentElement.setAttribute("data-theme", name);
  try {
    localStorage.setItem(THEME_KEY, name);
  } catch {}
  listeners.forEach((cb) => cb());
}

export function ThemeSwitcher() {
  const active = useSyncExternalStore(subscribe, getSnapshot, () => defaultTheme);

  return (
    <div className="flex flex-row-reverse items-center gap-2">
      {themes.map((t) => (
        <button
          key={t.name}
          type="button"
          aria-label={`${t.name} theme`}
          aria-pressed={active === t.name}
          onClick={() => setTheme(t.name)}
          className="size-5 rounded-full border-2 cursor-pointer"
          style={{ backgroundColor: t.bg, borderColor: t.fg }}
        />
      ))}
    </div>
  );
}
