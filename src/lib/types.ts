export const GRID_COLS = 4;
export const GRID_ROWS = 2;
export const SLOT_COUNT = GRID_COLS * GRID_ROWS;

export type Media =
  | { type: "images"; srcs: string[] }
  | { type: "audio"; src: string; cover?: string };

export type Work = {
  id: string;
  title: string;
  slot: number; // 0..SLOT_COUNT-1, left-to-right, top-to-bottom
  thumbnail: string;
  link?: string; // optional external URL shown as an icon in the viewer
  media: Media;
};
