"use client";

import Image from "next/image";
import { useState } from "react";
import { deleteWork, saveWork } from "@/app/cms/actions";
import { GRID_COLS, SLOT_COUNT, type ImageItem, type Work } from "@/lib/types";

const input = "w-full border-2 border-fg bg-bg px-2 py-1";
const btn = "border-2 border-fg px-3 py-1 cursor-pointer";

function SlotGrid({
  works,
  value,
  onChange,
  size,
}: {
  works: Work[];
  value: number | null;
  onChange: (slot: number) => void;
  size: string;
}) {
  return (
    <div className={`grid gap-1 ${size}`} style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
      {Array.from({ length: SLOT_COUNT }, (_, slot) => {
        const w = works.find((x) => x.slot === slot);
        const selected = slot === value;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onChange(slot)}
            aria-label={w ? `Slot ${slot + 1}: ${w.title}` : `Slot ${slot + 1}: empty`}
            className={`relative aspect-square overflow-hidden border-2 ${selected ? "border-fg" : "border-fg/30 border-dashed"}`}
          >
            {w && <Image src={w.thumbnail} alt="" fill sizes="200px" className={`object-cover ${selected ? "" : "opacity-60"}`} />}
            {selected && <span className="absolute inset-0 grid place-items-center bg-bg/60 text-2xl font-bold">XX</span>}
          </button>
        );
      })}
    </div>
  );
}

function FileList({ label, items, onChange, captionsDisabled }: { label: string; items: ImageItem[]; onChange: (next: ImageItem[]) => void; captionsDisabled?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setSelected(j);
  };
  const remove = (i: number) => {
    onChange(items.filter((_, k) => k !== i));
    setSelected(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (selected === null) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); move(selected, -1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); move(selected, 1); }
    else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(selected); }
    else if (e.key === "Escape") setSelected(null);
  };

  return (
    <div
      className="flex flex-col gap-1"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSelected(null); }}
    >
      <ul
        role="listbox"
        aria-label={`${label}s`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2 outline-none"
      >
        {items.map(({ src, caption }, i) => {
          const isSel = i === selected;
          return (
            <li
              key={src}
              role="option"
              aria-selected={isSel}
              onClick={() => setSelected(isSel ? null : i)}
              className={`relative size-20 cursor-pointer border-fg transition-[border-width] ${isSel ? "border-[6px]" : "border-2"}`}
            >
              <Image src={src} alt={`${label} ${i + 1}`} fill sizes="80px" className="object-cover" />
              <span className="absolute left-0 top-0 bg-bg/80 px-1 text-xs">{i + 1}{caption ? " ✎" : ""}</span>
              <button
                type="button"
                aria-label="Remove"
                onClick={(e) => { e.stopPropagation(); remove(i); }}
                className="absolute right-0 top-0 bg-bg/80 px-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
      {items.length > 0 && (
        <span className="text-xs opacity-60">Click an image to select it, then ← → to move, Delete to remove.</span>
      )}
      {selected !== null && items[selected] && captionsDisabled && (
        <span className="text-xs opacity-60">Per-image captions are off while the work has a description.</span>
      )}
      {selected !== null && items[selected] && !captionsDisabled && (
        <label className="flex flex-col gap-1">
          <span>Caption for image {selected + 1} <span className="opacity-60">(optional)</span></span>
          <textarea
            rows={2}
            value={items[selected].caption ?? ""}
            onChange={(e) => onChange(items.map((it, k) => (k === selected ? { ...it, caption: e.target.value } : it)))}
            onKeyDown={(e) => e.stopPropagation()}
            className={input}
          />
        </label>
      )}
    </div>
  );
}

function WorkForm({ works, work, slot: initialSlot }: { works: Work[]; work?: Work; slot: number }) {
  const [slot, setSlot] = useState(initialSlot);
  const [type, setType] = useState<"images" | "audio">(work?.media.type ?? "images");
  const [images, setImages] = useState<ImageItem[]>(work?.media.type === "images" ? work.media.items : []);
  const [audio, setAudio] = useState(work?.media.type === "audio" ? work.media.src : "");
  const [cover, setCover] = useState(work?.media.type === "audio" ? (work.media.cover ?? "") : "");
  const [thumb, setThumb] = useState(work?.thumbnail ?? "");
  const [description, setDescription] = useState(work?.description ?? "");
  const hasCaptions = images.some((i) => i.caption);

  return (
    <form action={saveWork} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={work?.id ?? ""} />
      <input type="hidden" name="slot" value={slot} />
      <input type="hidden" name="type" value={type} />

      <h2 className="text-xl font-semibold">{work ? `Editing “${work.title}”` : `New work in slot ${slot + 1}`}</h2>

      <label className="flex flex-col gap-1">
        <span>Title</span>
        <input name="title" required defaultValue={work?.title ?? ""} className={input} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Link <span className="opacity-60">(optional — e.g. https://avansear.com/unsplash)</span></span>
        <input name="link" type="url" defaultValue={work?.link ?? ""} className={input} />
      </label>

      <label className="flex flex-col gap-1">
        <span>
          Description <span className="opacity-60">(optional — shown for the whole work; replaces per-image captions)</span>
        </span>
        <textarea name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={input} />
        {description && hasCaptions && (
          <span className="text-xs opacity-60">Saving with a description will discard the existing per-image captions.</span>
        )}
      </label>

      <div className="flex flex-col gap-1">
        <span>Type</span>
        <div className="flex gap-2">
          {(["images", "audio"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t} className={`${btn} aria-pressed:bg-fg aria-pressed:text-bg`}>
              {t === "images" ? "carousel" : "audio"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span>Position</span>
        <SlotGrid works={works.filter((w) => w.id !== work?.id)} value={slot} onChange={setSlot} size="max-w-xs" />
        <span className="text-xs opacity-60">Picking an occupied slot swaps the two.</span>
      </div>

      <div className="flex flex-col gap-1">
        <span>Thumbnail <span className="opacity-60">(optional — defaults to first image / cover)</span></span>
        {thumb && (
          <div className="relative size-20 border-2 border-fg">
            <Image src={thumb} alt="thumbnail" fill sizes="80px" className="object-cover" />
            <button type="button" onClick={() => setThumb("")} className="absolute right-0 top-0 bg-bg/80 px-1 text-xs cursor-pointer">✕</button>
          </div>
        )}
        <input type="hidden" name="existingThumbnail" value={thumb} />
        <input type="file" name="thumbnail" accept="image/*" />
      </div>

      {type === "images" ? (
        <div className="flex flex-col gap-1">
          <span>Images <span className="opacity-60">(in order)</span></span>
          {images.map(({ src, caption }) => (
            <span key={src}>
              <input type="hidden" name="existingImages" value={src} />
              <input type="hidden" name="existingCaptions" value={caption ?? ""} />
            </span>
          ))}
          <FileList label="image" items={images} onChange={setImages} captionsDisabled={description.trim().length > 0} />
          <input type="file" name="newImages" accept="image/*" multiple />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <span>Audio</span>
            {audio && (
              <div className="flex items-center gap-2">
                <audio controls src={audio} className="h-8" />
                <button type="button" onClick={() => setAudio("")} className={btn}>✕</button>
              </div>
            )}
            <input type="hidden" name="existingAudio" value={audio} />
            <input type="file" name="newAudio" accept="audio/*" />
          </div>
          <div className="flex flex-col gap-1">
            <span>Cover <span className="opacity-60">(optional)</span></span>
            {cover && (
              <div className="relative size-20 border-2 border-fg">
                <Image src={cover} alt="cover" fill sizes="80px" className="object-cover" />
                <button type="button" onClick={() => setCover("")} className="absolute right-0 top-0 bg-bg/80 px-1 text-xs cursor-pointer">✕</button>
              </div>
            )}
            <input type="hidden" name="existingCover" value={cover} />
            <input type="file" name="newCover" accept="image/*" />
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button type="submit" className={`${btn} bg-fg text-bg`}>Save</button>
        {work && (
          <button type="submit" formAction={deleteWork} className={btn} onClick={(e) => { if (!confirm(`Delete “${work.title}” and its files?`)) e.preventDefault(); }}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

export function CmsEditor({ works, logout }: { works: Work[]; logout: () => Promise<void> }) {
  const [slot, setSlot] = useState<number | null>(null);
  const work = slot === null ? undefined : works.find((w) => w.slot === slot);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">cms</h1>
        <form action={logout}>
          <button type="submit" className={btn}>sign out</button>
        </form>
      </header>

      <section className="flex flex-col gap-2">
        <span>Click a slot to edit it, or an empty one to add a work there.</span>
        <SlotGrid works={works} value={slot} onChange={setSlot} size="max-w-2xl" />
      </section>

      {slot !== null && (
        <section className="border-t-2 border-fg pt-6">
          <WorkForm key={`${slot}:${work ? JSON.stringify(work) : "new"}`} works={works} work={work} slot={slot} />
        </section>
      )}
    </main>
  );
}
