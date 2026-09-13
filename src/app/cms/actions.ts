"use server";

import { basename } from "node:path";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { deleteKeys, listKeys, upload } from "@/lib/r2";
import { SLOT_COUNT, type ImageItem, type Media, type Work } from "@/lib/types";
import { getWorks, writeWorks } from "@/lib/works";


const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "work";

const safeName = (s: string) => basename(s).replace(/[^a-zA-Z0-9._-]+/g, "-");

const isFile = (v: FormDataEntryValue | null): v is File => v instanceof File && v.size > 0;

function revalidate() {
  revalidatePath("/");
  revalidatePath("/cms");
}

export async function saveWork(formData: FormData) {
  await requireAuth();
  const works = await getWorks();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  let id = String(formData.get("id") ?? "");
  const existing = works.find((w) => w.id === id);
  if (!existing) {
    const base = slugify(title);
    id = base;
    for (let n = 2; works.some((w) => w.id === id); n++) id = `${base}-${n}`;
  }

  const slot = Math.min(Math.max(Number(formData.get("slot")) || 0, 0), SLOT_COUNT - 1);
  const type = formData.get("type") === "audio" ? "audio" : "images";
  const link = String(formData.get("link") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const prefix = `works/${id}/`;

  async function store(v: FormDataEntryValue | null): Promise<string | null> {
    if (!isFile(v)) return null;
    return upload(prefix + safeName(v.name), v);
  }
  async function storeAll(vs: FormDataEntryValue[]) {
    const out: string[] = [];
    for (const v of vs) {
      const src = await store(v);
      if (src) out.push(src);
    }
    return out;
  }
  const keep = (k: string) => formData.getAll(k).map(String).filter(Boolean);

  let media: Media;
  if (type === "images") {
    const srcs = formData.getAll("existingImages").map(String);
    const captions = formData.getAll("existingCaptions").map(String);
    // A work-level description and per-image captions are mutually exclusive.
    const existing: ImageItem[] = srcs.filter(Boolean).map((src, i) => {
      const caption = description ? "" : captions[i]?.trim();
      return caption ? { src, caption } : { src };
    });
    const added: ImageItem[] = (await storeAll(formData.getAll("newImages"))).map((src) => ({ src }));
    const items = [...existing, ...added];
    if (items.length === 0) throw new Error("Add at least one image");
    media = { type: "images", items };
  } else {
    const src = (await store(formData.get("newAudio"))) ?? keep("existingAudio")[0];
    if (!src) throw new Error("Add an audio file");
    const cover = (await store(formData.get("newCover"))) ?? keep("existingCover")[0];
    media = cover ? { type: "audio", src, cover } : { type: "audio", src };
  }

  const thumbnail =
    (await store(formData.get("thumbnail"))) ??
    keep("existingThumbnail")[0] ??
    (media.type === "images" ? media.items[0].src : media.cover);
  if (!thumbnail) throw new Error("Add a thumbnail");

  // Delete objects under this work's prefix that are no longer referenced.
  const referenced = new Set(
    [thumbnail, ...(media.type === "images" ? media.items.map((i) => i.src) : [media.src, media.cover ?? ""])].filter(Boolean).map((u) => basename(u)),
  );
  const stale = (await listKeys(prefix)).filter((k) => !referenced.has(basename(k)));
  await deleteKeys(stale);

  // If another work occupies the target slot, swap.
  const other = works.find((w) => w.slot === slot && w.id !== id);
  if (other) {
    const used = new Set(works.filter((w) => w.id !== id).map((w) => w.slot));
    other.slot = existing?.slot ?? [...Array(SLOT_COUNT).keys()].find((s) => !used.has(s) && s !== slot) ?? other.slot;
  }

  const work: Work = { id, title, slot, thumbnail, media, ...(link ? { link } : {}), ...(description ? { description } : {}) };
  await writeWorks([...works.filter((w) => w.id !== id), work]);
  revalidate();
}

export async function deleteWork(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteKeys(await listKeys(`works/${id}/`));
  await writeWorks((await getWorks()).filter((w) => w.id !== id));
  revalidate();
}
