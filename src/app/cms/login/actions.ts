"use server";

import { redirect } from "next/navigation";
import { checkKey, clearSession, setSession } from "@/lib/auth";

export async function login(formData: FormData) {
  if (!checkKey(String(formData.get("key") ?? ""))) redirect("/cms/login?error=1");
  await setSession();
  redirect("/cms");
}

export async function logout() {
  await clearSession();
  redirect("/cms/login");
}
