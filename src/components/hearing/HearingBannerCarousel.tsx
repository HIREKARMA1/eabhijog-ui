"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

type Props = {
  images: string[];
  className?: string;
};

/** Banner carousel: fixed frame height; static when one image; 3s autoplay + arrows when multiple. */
export function HearingBannerCarousel({ images, className }: Props) {
  const slides = images.length > 0 ? images : [];
  const multi = slides.length > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [slides.join("|")]);

  useEffect(() => {
    if (!multi || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [multi, paused, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[Math.min(index, slides.length - 1)]!;

  return (
    <div
      className={cn(
        "relative h-[12.5rem] w-full overflow-hidden sm:h-full sm:min-h-[20rem] lg:min-h-[24rem]",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {multi ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 sm:left-3"
            onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
          >
            <Icon name="chevron-right" size={16} className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 sm:right-3"
            onClick={() => setIndex((current) => (current + 1) % slides.length)}
          >
            <Icon name="chevron-right" size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to banner ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
