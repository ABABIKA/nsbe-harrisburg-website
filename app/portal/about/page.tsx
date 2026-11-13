import Image from "next/image";
import Link from "next/link";
import PageHeader from "../../../components/portal/PageHeader";
import { card, darkButton } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";

export const metadata = { title: "About NSBE | NSBE Penn State Harrisburg" };

export default async function AboutPage() {
  await verifySession();
  return (
    <>
      <PageHeader title="About NSBE" subtitle="The organization behind the chapter." />
      <section aria-labelledby="chapter-h" className={`${card} flex flex-wrap items-center gap-6 p-6`}>
        <Image
          src="/images/nsbe-pennstatehbg-logo.jpeg"
          alt="NSBE Penn State Harrisburg chapter logo"
          width={120}
          height={120}
          className="h-28 w-28 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest">Penn State Harrisburg student chapter</p>
          <h2 id="chapter-h" className="mt-1 text-2xl font-bold">About NSBE</h2>
          <p className="mt-2 max-w-2xl text-[color:var(--ink-muted)]">
            NSBE&apos;s mission is to increase the number of culturally responsible Black engineers who excel
            academically, succeed professionally, and positively impact the community.
          </p>
          <Link href="/" className={`${darkButton} mt-4`}>Visit the public chapter website</Link>
        </div>
      </section>
    </>
  );
}
