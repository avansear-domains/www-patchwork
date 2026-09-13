import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const logo = await fetch(new URL("/logo.png", request.url)).then((res) =>
    res.arrayBuffer(),
  );

  return new ImageResponse(
    (
      <div tw="flex w-full h-full items-center justify-center bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo as unknown as string} alt="avan" tw="w-full h-full object-contain" />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
