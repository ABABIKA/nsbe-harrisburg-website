import Image from "next/image";
import Link from "next/link";
import ExternalLink from "../../../components/portal/ExternalLink";
import PageHeader from "../../../components/portal/PageHeader";
import PhotoCarousel from "../../../components/portal/PhotoCarousel";
import { card, darkButton } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { SOCIAL_LINKS } from "../../../lib/portal/content";
import { listGalleryImages } from "../../../lib/portal/gallery";

export const metadata = { title: "About NSBE | NSBE Penn State Harrisburg" };

export default async function AboutPage() {
  await verifySession();
  const images = listGalleryImages();

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

      {images.length > 0 && (
        <section aria-labelledby="photos-h" className={`${card} mt-4 p-6`}>
          <h2 id="photos-h" className="mb-4 text-xl font-bold">Chapter photos</h2>
          <PhotoCarousel images={images} />
        </section>
      )}

      <section aria-labelledby="social-h" className={`${card} mt-4 p-6`}>
        <h2 id="social-h" className="text-xl font-bold">Follow the chapter</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {SOCIAL_LINKS.map((s) => (
            <li key={s.name}>
              {s.url ? (
                <ExternalLink href={s.url}>{s.name}</ExternalLink>
              ) : (
                <span className="inline-flex rounded-[8px] border border-dashed border-[color:var(--border-light)] px-4 py-2.5 text-sm text-[color:var(--ink-muted)]">
                  {s.name}: link coming soon
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
