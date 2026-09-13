import { Intro } from "@/components/intro";
import { WorkGrid } from "@/components/work-grid";
import { getWorks } from "@/lib/works";

// Cached; the CMS calls revalidatePath("/") after every save.
export const revalidate = 3600;

export default async function Home() {
  return (
    <>
      <Intro />
      <WorkGrid works={await getWorks()} />
    </>
  );
}
