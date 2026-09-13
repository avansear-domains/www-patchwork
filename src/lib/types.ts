export const GRID_COLS = 4;
export const GRID_ROWS = 2;
export const SLOT_COUNT = GRID_COLS * GRID_ROWS;
export const MUSIX_SLOT = SLOT_COUNT - 1; // bottom-right is always the song square
export const WORK_SLOTS = MUSIX_SLOT; // works may use slots 0..WORK_SLOTS-1

export type ImageItem = { src: string; caption?: string };

export type Media =
  | { type: "images"; items: ImageItem[] }
  | { type: "audio"; src: string; cover?: string };

export type Work = {
  id: string;
  title: string;
  slot: number; // 0..SLOT_COUNT-1, left-to-right, top-to-bottom
  thumbnail: string;
  link?: string; // optional external URL shown as an icon in the viewer
  description?: string; // optional text for the whole work; for carousels it replaces per-image captions
  media: Media;
};
