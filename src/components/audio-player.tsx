import Image from "next/image";

export function AudioPlayer({ src, cover, title, description }: { src: string; cover?: string; title: string; description?: string }) {
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
      {cover && (
        <div className="relative min-h-0 flex-1 aspect-square">
          <Image src={cover} alt={title} fill sizes="256px" className="object-cover" />
        </div>
      )}
      <span className="font-medium">{title}</span>
      {description && <p className="max-w-md text-center text-sm opacity-80">{description}</p>}
      <audio controls preload="metadata" src={src} className="w-full max-w-md" />
    </div>
  );
}
