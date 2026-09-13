// Server-only. "Song of the week": rows in Supabase `musix_songs`, newest = now playing.
// Album art from Spotify, playback via a YouTube id (searched with youtube-sr, cached in the row).
import { createClient } from "@supabase/supabase-js";
import { YouTube } from "youtube-sr";

export type Song = {
  week: string;
  songName: string;
  artist: string;
  spotifyTrackId: string | null;
  trackUrl: string | null;
};

export type NowPlaying = {
  week: string;
  songName: string;
  artist: string;
  youtubeId: string | null;
  albumArt: string | null;
  albumName: string | null;
  trackUrl: string | null;
  albumUrl: string | null;
  artistUrl: string | null;
};

type Row = { week: string; song_name: string; artist: string; youtube_id: string | null; spotify_track_id: string | null };

function supabase() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export const musixConfigured = () => Boolean(supabase());

export async function getSpotifyToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (!res.ok) return null;
  return ((await res.json()) as { access_token: string }).access_token;
}

async function spotifyTrack(trackId: string) {
  const empty = { albumArt: null, albumName: null, trackUrl: null, albumUrl: null, artistUrl: null };
  try {
    const token = await getSpotifyToken();
    if (!token) return empty;
    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return empty;
    const d = (await res.json()) as {
      external_urls: { spotify: string };
      artists: { external_urls: { spotify: string } }[];
      album: { name: string; external_urls: { spotify: string }; images: { url: string }[] };
    };
    return {
      albumArt: d.album?.images?.[0]?.url ?? null,
      albumName: d.album?.name ?? null,
      trackUrl: d.external_urls?.spotify ?? null,
      albumUrl: d.album?.external_urls?.spotify ?? null,
      artistUrl: d.artists?.[0]?.external_urls?.spotify ?? null,
    };
  } catch {
    return empty;
  }
}

async function findYoutubeId(songName: string, artist: string) {
  try {
    const r = await YouTube.search(`${songName} - ${artist}`, { limit: 1, type: "video" });
    return r[0]?.id ?? null;
  } catch {
    return null;
  }
}

const trackUrl = (id: string | null) => (id ? `https://open.spotify.com/track/${id}` : null);

export async function getMusix(): Promise<{ now: NowPlaying | null; songs: Song[] }> {
  const db = supabase();
  if (!db) return { now: null, songs: [] };
  try {
    const { data: rows } = await db
      .from("musix_songs")
      .select("week, song_name, artist, youtube_id, spotify_track_id")
      .order("week", { ascending: false })
      .returns<Row[]>();
    const songs: Song[] = (rows ?? []).map((r) => ({
      week: r.week, songName: r.song_name, artist: r.artist, spotifyTrackId: r.spotify_track_id, trackUrl: trackUrl(r.spotify_track_id),
    }));
    const data = rows?.[0];
    if (!data) return { now: null, songs };

    let youtubeId = data.youtube_id;
    if (!youtubeId) {
      youtubeId = await findYoutubeId(data.song_name, data.artist);
      if (youtubeId && data.spotify_track_id) {
        await db.from("musix_songs").update({ youtube_id: youtubeId }).eq("spotify_track_id", data.spotify_track_id);
      }
    }

    const spotify = data.spotify_track_id ? await spotifyTrack(data.spotify_track_id) : { albumArt: null, albumName: null, trackUrl: null, albumUrl: null, artistUrl: null };
    return { now: { week: data.week, songName: data.song_name, artist: data.artist, youtubeId, ...spotify }, songs };
  } catch (e) {
    console.error("musix:", e);
    return { now: null, songs: [] };
  }
}

// Cap on playlist syncs, same as the old site: 50 per rolling 24h, tracked in `musix_rate_limit`.
const SYNC_MAX = 50;
const SYNC_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Records a sync attempt; returns false (and records nothing) when the cap is hit. */
export async function takeSyncSlot(): Promise<boolean> {
  const db = supabase();
  if (!db) return false;
  const cutoff = new Date(Date.now() - SYNC_WINDOW_MS).toISOString();
  await db.from("musix_rate_limit").delete().lt("executed_at", cutoff);
  const { count } = await db.from("musix_rate_limit").select("*", { count: "exact", head: true }).gte("executed_at", cutoff);
  if ((count ?? 0) >= SYNC_MAX) return false;
  await db.from("musix_rate_limit").insert({ executed_at: new Date().toISOString() });
  return true;
}

/** Pull new tracks from the Spotify playlist into musix_songs. Returns a log. */
export async function syncSongs(): Promise<string[]> {
  const log: string[] = [];
  const db = supabase();
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  if (!db) return ["Supabase not configured"];
  if (!playlistId) return ["SPOTIFY_PLAYLIST_ID not set"];
  const token = await getSpotifyToken();
  if (!token) return ["Spotify credentials missing or invalid"];

  type Item = { track: { id: string; name: string; artists: { name: string }[] } | null };
  const tracks: NonNullable<Item["track"]>[] = [];
  let next: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
  while (next) {
    const res = await fetch(next, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return [...log, `Spotify error ${res.status}: ${await res.text()}`];
    const page = (await res.json()) as { items: Item[]; next: string | null };
    for (const i of page.items ?? []) if (i.track) tracks.push(i.track);
    next = page.next;
  }
  log.push(`Playlist has ${tracks.length} tracks`);

  const { data: rows } = await db.from("musix_songs").select("week, song_name, artist, spotify_track_id");
  const byId = new Set((rows ?? []).map((r) => r.spotify_track_id).filter(Boolean));
  const byName = new Set((rows ?? []).map((r) => `${r.song_name.toLowerCase().trim()}|${r.artist.toLowerCase().trim()}`));
  let week = Math.max(0, ...(rows ?? []).map((r) => parseInt(String(r.week).replace(/\D/g, "")) || 0));

  let added = 0;
  for (const t of tracks) {
    const artist = t.artists.map((a) => a.name).join(", ");
    const key = `${t.name.toLowerCase().trim()}|${artist.toLowerCase().trim()}`;
    if (byId.has(t.id) || byName.has(key)) continue;
    week++;
    const w = `week ${String(week).padStart(2, "0")}`;
    const youtubeId = await findYoutubeId(t.name, artist);
    const { error } = await db.from("musix_songs").insert({ week: w, song_name: t.name, artist, spotify_track_id: t.id, youtube_id: youtubeId });
    if (error) { log.push(`Failed: ${t.name} — ${error.message}`); week--; continue; }
    log.push(`Added ${w}: ${t.name} — ${artist}`);
    added++;
  }
  log.push(added ? `Added ${added} song(s)` : "No new songs");
  return log;
}
