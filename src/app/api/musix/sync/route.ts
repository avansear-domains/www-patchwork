import { revalidatePath } from "next/cache";
import { syncSongs, takeSyncSlot } from "@/lib/musix";

// Pinged by <MusixSync /> on every homepage visit. If the playlist gained a track,
// bust the ISR'd homepage so the next render shows it.
export async function GET() {
  try {
    if (!(await takeSyncSlot())) return Response.json({ added: false, log: ["Rate limit exceeded"] }, { status: 429 });
    const log = await syncSongs();
    const added = log.some((l) => l.startsWith("Added "));
    if (added) revalidatePath("/");
    return Response.json({ added, log });
  } catch (e) {
    console.error("musix sync:", e);
    return Response.json({ added: false, log: [String(e)] }, { status: 500 });
  }
}
