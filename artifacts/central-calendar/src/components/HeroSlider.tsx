import { useEffect, useState } from "react";
import { useListBanners } from "@workspace/api-client-react";
import { useI18n } from "@/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ROTATE_MS = 6000;

export function HeroSlider({ fallbackUrl }: { fallbackUrl?: string | null }) {
  const { data: banners } = useListBanners();
  const { pickLocalized } = useI18n();
  const [idx, setIdx] = useState(0);

  const items = banners ?? [];
  const hasSlides = items.length > 0;

  useEffect(() => {
    if (idx >= items.length) setIdx(0);
  }, [items.length, idx]);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [items.length]);

  // Background image fallback (single legacy banner) shown when no banner records
  if (!hasSlides) {
    if (!fallbackUrl) return null;
    return (
      <>
        <img
          src={fallbackUrl}
          alt=""
          aria-hidden="true"
          width="1920"
          height="800"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/95" />
        <div className="absolute inset-0 bg-black/20" />
      </>
    );
  }

  const goPrev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setIdx((i) => (i + 1) % items.length);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {items.map((b, i) => (
          <img
            key={b.id}
            src={b.imageUrl}
            alt=""
            aria-hidden={i !== idx}
            width="1920"
            height="800"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-primary/95" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {(() => {
        const cur = items[idx];
        const title = pickLocalized(cur.title, cur.titleRu);
        const subtitle = pickLocalized(cur.subtitle, cur.subtitleRu);
        if (!title && !subtitle && !cur.linkUrl) return null;
        const inner = (
          <div className="bg-primary/80 backdrop-blur-md border border-primary-foreground/15 rounded-lg px-5 py-3 text-left max-w-md transition-opacity">
            {title && <div className="text-sm font-semibold text-primary-foreground">{title}</div>}
            {subtitle && <div className="text-xs text-primary-foreground/70 mt-0.5">{subtitle}</div>}
          </div>
        );
        return (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
            {cur.linkUrl ? (
              <a href={cur.linkUrl} target={/^https?:/i.test(cur.linkUrl) ? "_blank" : undefined} rel="noopener noreferrer">
                {inner}
              </a>
            ) : inner}
          </div>
        );
      })()}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-primary/40 hover:bg-primary/70 text-primary-foreground border border-primary-foreground/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-primary/40 hover:bg-primary/70 text-primary-foreground border border-primary-foreground/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {items.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary-foreground" : "w-1.5 bg-primary-foreground/40 hover:bg-primary-foreground/70"}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
