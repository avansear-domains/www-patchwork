"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Renders nothing. On mount, asks the server to pull new playlist tracks; if any
// were added, re-render the page so the new song shows up without a reload.
export function MusixSync() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/musix/sync")
      .then((r) => r.json())
      .then((d: { added?: boolean }) => { if (d.added) router.refresh(); })
      .catch(() => {});
  }, [router]);
  return null;
}
