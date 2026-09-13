"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@/components/icons";
import type { NowPlaying, Song } from "@/lib/musix";

const API = "https://www.youtube.com/iframe_api";

function loadYT(): Promise<typeof YT> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    if (!document.querySelector(`script[src="${API}"]`)) {
      const s = document.createElement("script");
      s.src = API;
      document.head.appendChild(s);
    }
  });
}

/** Hidden YouTube player. Lives at grid level so playback survives opening/closing the panel. */
export function useMusixPlayer(youtubeId: string | null) {
  const holder = useRef<HTMLDivElement>(null);
  const player = useRef<YT.Player | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!youtubeId || !holder.current) return;
    let dead = false;
    loadYT().then((yt) => {
      if (dead || !holder.current) return;
      player.current = new yt.Player(holder.current, {
        host: "https://www.youtube-nocookie.com",
        width: 480,
        height: 270,
        videoId: youtubeId,
        playerVars: { controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: () => !dead && setReady(true),
          onStateChange: (e) => !dead && setPlaying(e.data === yt.PlayerState.PLAYING),
        },
      } as YT.PlayerOptions);
    });
    return () => {
      dead = true;
      try { player.current?.destroy(); } catch {}
      player.current = null;
      setReady(false);
      setPlaying(false);
    };
  }, [youtubeId]);

  const toggle = () => {
    const p = player.current;
    if (!p || !ready) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const element = (
    <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 h-[270px] w-[480px] overflow-hidden">
      <div ref={holder} />
    </div>
  );

  return { element, ready, playing, toggle, canPlay: Boolean(youtubeId) };
}

type Player = ReturnType<typeof useMusixPlayer>;

/** The bottom-right grid square: full-bleed album art, hover shows play/pause + song name. */
export function MusixTile({ now, player, open, onOpen }: { now: NowPlaying | null; player: Player; open: boolean; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={open}
      aria-label={now ? `${now.songName} by ${now.artist}` : "song of the week"}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="group relative aspect-square overflow-hidden cursor-pointer border-2 border-transparent aria-pressed:border-4 aria-pressed:border-fg"
    >
      {now?.albumArt ? (
        <Image src={now.albumArt} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover transition-transform duration-300 ease-out group-hover:scale-105" />
      ) : (
        <span className="grid size-full place-items-center bg-fg/10 text-4xl">♪</span>
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
        {player.canPlay && (
          <button
            type="button"
            aria-label={player.playing ? "Pause" : "Play"}
            onClick={(e) => { e.stopPropagation(); player.toggle(); }}
            className="grid size-14 place-items-center rounded-full bg-white/15 backdrop-blur-sm cursor-pointer hover:bg-white/25"
          >
            {player.playing ? <Pause className="size-7" /> : <Play className="size-7 ml-0.5" />}
          </button>
        )}
        {now && <span className="absolute bottom-3 left-3 right-3 truncate text-left text-sm">{now.songName.toLowerCase()}</span>}
      </span>
    </div>
  );
}

const lower = (s: string) => s.toLowerCase();
const maybeLink = (text: string, href: string | null) =>
  href ? <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{text}</a> : text;

/** Expanded view under the grid: this week's song, then the archive. */
export function MusixPanel({ now, songs, player }: { now: NowPlaying | null; songs: Song[]; player: Player }) {
  if (!now) return <div className="grid h-[40vh] place-items-center text-sm opacity-60">nothing playing right now</div>;
  const rest = songs.filter((s) => s.week !== now.week);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold tracking-tighter">songs i love &lt;3; i add a new one every week</h2>

      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <button
          type="button"
          onClick={player.toggle}
          disabled={!player.canPlay}
          aria-label={player.playing ? "Pause" : "Play"}
          className="group relative size-40 shrink-0 overflow-hidden border-2 border-fg cursor-pointer disabled:cursor-default"
        >
          {now.albumArt ? <Image src={now.albumArt} alt="" fill sizes="160px" className="object-cover" /> : <span className="grid size-full place-items-center text-4xl">♪</span>}
          {player.canPlay && (
            <span className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              {player.playing ? <Pause className="size-8" /> : <Play className="size-8 ml-0.5" />}
            </span>
          )}
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide opacity-60">{now.week}</span>
          <span className="text-2xl font-semibold tracking-tighter">{maybeLink(lower(now.songName), now.trackUrl)}</span>
          <span className="text-base opacity-80">{maybeLink(lower(now.artist), now.artistUrl)}</span>
          {now.albumName && <span className="text-sm italic opacity-60">{maybeLink(lower(now.albumName), now.albumUrl)}</span>}
          {player.canPlay && <span className="mt-2 text-xs opacity-60">{player.playing ? "playing" : "click the cover to play"}</span>}
        </div>
      </div>

      {rest.length > 0 && (
        <ol className="max-h-[40vh] overflow-y-auto border-t-2 border-fg">
          {rest.map((s) => (
            <li key={s.week} className="flex items-baseline gap-4 border-b border-fg/20 py-2 text-sm">
              <span className="w-16 shrink-0 text-xs uppercase tracking-wide opacity-60">{s.week}</span>
              <span className="truncate">{maybeLink(lower(s.songName), s.trackUrl)}</span>
              <span className="ml-auto shrink-0 truncate opacity-60">{lower(s.artist)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
