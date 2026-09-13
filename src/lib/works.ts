// Server-only. All content lives in R2: media under works/<id>/, metadata in works.json.
// Edit via /cms (gated by AVAN_KEY).
import { getText, putText } from "@/lib/r2";
import type { Work } from "@/lib/types";

const KEY = "works.json";

export async function getWorks(): Promise<Work[]> {
  const text = await getText(KEY);
  if (!text) return [];
  const { works } = JSON.parse(text) as { works: Work[] };
  return works.sort((a, b) => a.slot - b.slot);
}

export async function writeWorks(works: Work[]) {
  await putText(KEY, JSON.stringify({ works: works.sort((a, b) => a.slot - b.slot) }, null, 2) + "\n");
}
