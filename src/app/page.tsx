import { Footer } from "@/components/footer";
import { Intro } from "@/components/intro";
import { WorkGrid } from "@/components/work-grid";
import { getMusix } from "@/lib/musix";
import { getWorks } from "@/lib/works";

// Cached; the CMS calls revalidatePath("/") after every save.
export const revalidate = 3600;

export default async function Home() {
  const [works, musix] = await Promise.all([getWorks(), getMusix()]);
  return (
    <>
      <Intro />
      <WorkGrid works={works} musix={musix} />
      <Footer />
    </>
  );
}
