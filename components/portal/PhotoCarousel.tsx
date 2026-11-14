"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { GalleryImage } from "../../lib/portal/gallery";
import { outlineButton } from "./styles";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const prefersReducedMotion = () => window.matchMedia(QUERY).matches;

// Cycles through the chapter's photos. It moves on its own every 5 seconds,
// but pauses while someone hovers or focuses it, has a Pause button, and
// never moves by itself for people who asked their device to reduce motion.
export default function PhotoCarousel({ images }: { images: GalleryImage[] }) {
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const count = images.length;
  const autoplay = !reduced && !userPaused && !hovering && count > 1;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [autoplay, count]);

  if (count === 0) return null;
  const current = images[index % count];
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Chapter photos"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div
        role="group"
        aria-roledescription="slide"
        aria-label={`Photo ${index + 1} of ${count}`}
        aria-live={autoplay ? "off" : "polite"}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-[6px] bg-[color:var(--nsbe-black)]"
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-contain"
          priority={index === 0}
        />
      </div>
      {count > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => go(-1)} className={outlineButton}>Previous photo</button>
          <button type="button" onClick={() => go(1)} className={outlineButton}>Next photo</button>
          {!reduced && (
            <button type="button" onClick={() => setUserPaused((p) => !p)} className={outlineButton}>
              {userPaused ? "Play slideshow" : "Pause slideshow"}
            </button>
          )}
          <p className="ml-auto text-sm text-[color:var(--ink-muted)]">
            Photo {index + 1} of {count}
          </p>
        </div>
      )}
    </section>
  );
}
