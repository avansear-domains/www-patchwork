import { notFound, redirect } from "next/navigation";
import { cmsEnabled, isAuthed } from "@/lib/auth";
import { login } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/cms/login">) {
  if (!cmsEnabled()) notFound();
  if (await isAuthed()) redirect("/cms");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">cms</h1>
      <form action={login} className="flex flex-col gap-3">
        <input
          name="key"
          type="password"
          autoComplete="current-password"
          placeholder="key"
          required
          autoFocus
          className="w-full border-2 border-fg bg-bg px-2 py-1"
        />
        {error && <span className="text-sm">wrong key</span>}
        <button type="submit" className="border-2 border-fg bg-fg px-3 py-1 text-bg cursor-pointer">
          enter
        </button>
      </form>
    </main>
  );
}
