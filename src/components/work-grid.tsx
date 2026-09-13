"use client";

import Image from "next/image";
import { useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { ImageCarousel } from "@/components/image-carousel";
import { Link as LinkIcon, X } from "@/components/icons";
import { SLOT_COUNT, type Work } from "@/lib/types";

const chrome =
  "grid size-9 place-items-center rounded-full bg-bg/70 text-fg opacity-70 transition-opacity hover:opacity-100 cursor-pointer";

export function WorkGrid({ works }: { works: Work[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = works.find((w) => w.id === selected);

  return (
    <section className="page">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: SLOT_COUNT }, (_, slot) => {
          const w = works.find((x) => x.slot === slot);
          if (!w) return <div key={slot} className="aspect-square" aria-hidden />;
          return (
            <button
              key={w.id}
              type="button"
              aria-label={w.title}
              aria-pressed={selected === w.id}
              onClick={() => setSelected(selected === w.id ? null : w.id)}
              className="group relative aspect-square overflow-hidden cursor-pointer border-2 border-transparent aria-pressed:border-fg"
            >
              <Image src={w.thumbnail} alt={w.title} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover transition-transform duration-300 ease-out group-hover:scale-105" />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-left text-sm text-white opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="translate-y-2 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">{w.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div key={active.id} className="relative mt-2">
          <div className="absolute inset-x-0 top-0 z-10 flex justify-between p-2">
            {active.link ? (
              <a href={active.link} target="_blank" rel="noopener noreferrer" aria-label="Open link" className={chrome}>
                <LinkIcon className="size-5" />
              </a>
            ) : (
              <span />
            )}
            <button type="button" aria-label="Close" onClick={() => setSelected(null)} className={chrome}>
              <X className="size-5" />
            </button>
          </div>
          {active.media.type === "images" ? (
            <ImageCarousel items={active.media.items} title={active.title} description={active.description} />
          ) : (
            <AudioPlayer src={active.media.src} cover={active.media.cover} title={active.title} description={active.description} />
          )}
        </div>
      )}
    </section>
  );
}
