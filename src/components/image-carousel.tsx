"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

const arrow =
  "absolute top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-bg/70 text-fg opacity-70 transition-opacity hover:opacity-100 cursor-pointer";

export function ImageCarousel({ srcs, title }: { srcs: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = srcs.length;
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-[40vh]">
        <Image
          key={srcs[index]}
          src={srcs[index]}
          alt={`${title} ${index + 1} of ${count}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
        {count > 1 && (
          <>
            <button type="button" aria-label="Previous" onClick={prev} className={`${arrow} left-2`}>
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" aria-label="Next" onClick={next} className={`${arrow} right-2`}>
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {srcs.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Go to ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="relative size-16 shrink-0 cursor-pointer border-2 border-transparent aria-[current=true]:border-fg"
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
