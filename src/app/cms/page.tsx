import { notFound, redirect } from "next/navigation";
import { CmsEditor } from "@/components/cms-editor";
import { cmsEnabled, isAuthed } from "@/lib/auth";
import { getWorks } from "@/lib/works";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function CmsPage() {
  if (!cmsEnabled()) notFound();
  if (!(await isAuthed())) redirect("/cms/login");
  return <CmsEditor works={await getWorks()} logout={logout} />;
}
