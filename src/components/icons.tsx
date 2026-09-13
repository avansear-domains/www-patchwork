import type { SVGProps } from "react";

const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" } as const;

export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>;
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>;
export const X = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>;
export const Link = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
export const Play = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p} fill="currentColor"><path d="M6 4v16l14-8z" /></svg>;
export const Pause = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p} fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>;
