import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useGetEventStats, useListEvents, useGetSiteSettings, useListArticles, useListTags } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Send } from "lucide-react";
import { HeroSlider } from "@/components/HeroSlider";
import { useI18n } from "@/i18n";
import { splitTagName } from "@/lib/utils";

const COUNTRIES: { slug: string; key: string }[] = [
  { slug: "uzbekistan", key: "nav.uzbekistan" },
  { slug: "kazakhstan", key: "nav.kazakhstan" },
  { slug: "kyrgyzstan", key: "nav.kyrgyzstan" },
  { slug: "turkmenistan", key: "nav.turkmenistan" },
  { slug: "caucasus", key: "nav.caucasus" },
  { slug: "cross-border", key: "nav.crossBorder" },
];

const FORMATS: { value: string; key: string }[] = [
  { value: "offline", key: "filter.format.offline" },
  { value: "online", key: "filter.format.online" },
  { value: "hybrid", key: "filter.format.hybrid" },
];

export default function Home() {
  const { t, pickLocalized } = useI18n();
  const { data: stats } = useGetEventStats();
  const { data: settings } = useGetSiteSettings();
  const { data: articles } = useListArticles({ limit: 3 });
  const { data: allTags } = useListTags();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const { data: events, isLoading } = useListEvents({
    ...(selectedCountry ? { country: selectedCountry } : {}),
    ...(selectedTags.length === 1 ? { tag: selectedTags[0] } : {}),
  });

  const filteredEvents = (() => {
    if (!events) return undefined;
    let list = events;
    if (selectedTags.length > 1) {
      list = list.filter((ev) => selectedTags.every((tg) => ev.tags?.some((tag) => tag.slug === tg)));
    }
    if (selectedFormat) {
      list = list.filter((ev) => ev.eventFormat === selectedFormat);
    }
    return list;
  })();

  const toggleTag = useCallback((slug: string) => {
    setSelectedTags((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  }, []);

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCountry("");
    setSelectedFormat("");
  };

  const hasFilters = selectedTags.length > 0 || selectedCountry !== "" || selectedFormat !== "";

  return (
    <div className="w-full">
      <section className="relative bg-hero text-hero-foreground border-b border-border overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
        <HeroSlider fallbackUrl={settings?.homepageBannerUrl ?? null} />
        <div className="relative container mx-auto max-w-5xl text-center py-20 sm:py-24 md:py-36 px-4 w-full">
          <div className="inline-block mb-6 px-3 py-1 border border-hero-foreground/25 rounded-full text-xs font-medium uppercase tracking-[0.2em] text-hero-foreground/80">
            {t("hero.eyebrow")}
          </div>
          <div className="flex justify-center mb-6">
            <Logo size={200} variant="stacked" className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.18)] max-w-[60vw] h-auto" />
          </div>
          <h1 className="sr-only">Central Calendar</h1>
          {/* Frosted glass panel — softens the busy city image behind the
              copy and gives the title + description a unified, editorial
              container that reads in both themes. */}
          <div className="inline-block mb-10 max-w-3xl backdrop-blur-xl bg-hero-foreground/[0.06] border border-hero-foreground/15 rounded-3xl px-6 sm:px-12 py-7 sm:py-9 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)]">
            <p className="text-lg sm:text-xl md:text-2xl text-hero-foreground/90 font-mono uppercase tracking-[0.2em] mb-5">
              {t("hero.tagline")}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-hero-foreground/80 leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-hero-foreground text-hero hover:bg-hero-foreground/90">
              <Link href="/calendar">{t("hero.browse")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-hero-foreground/30 text-hero-foreground hover:bg-hero-foreground hover:text-hero">
              <Link href="/submit-event"><Send className="mr-2 h-4 w-4" /> {t("hero.submit")}</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base font-mono opacity-90">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.totalPublished ?? 0}</span>
              <span className="uppercase tracking-wider text-xs">{t("hero.totalEvents", "Total Events")}</span>
            </div>
            <div className="w-px h-12 bg-hero-foreground/25 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.upcomingThisMonth ?? 0}</span>
              <span className="uppercase tracking-wider text-xs">{t("hero.thisMonth", "This Month")}</span>
            </div>
            <div className="w-px h-12 bg-hero-foreground/25 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.byCountry?.length ?? 0}</span>
              <span className="uppercase tracking-wider text-xs">{t("hero.nations", "Nations")}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-10 order-2 lg:order-1">
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/60 rounded-lg border border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("filter.title")}:</span>
                {selectedCountry && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {t(COUNTRIES.find((c) => c.slug === selectedCountry)?.key ?? "")}
                    <button onClick={() => setSelectedCountry("")} aria-label="Remove country filter">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedFormat && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {t(FORMATS.find((f) => f.value === selectedFormat)?.key ?? "")}
                    <button onClick={() => setSelectedFormat("")} aria-label="Remove format filter">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedTags.map((tg) => {
                  const display = stats?.byTag?.find((tag) => tag.tagSlug === tg)?.tagName ?? tg;
                  return (
                    <span key={tg} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/80 text-primary-foreground text-xs font-medium rounded-full lowercase">
                      #{splitTagName(display).join(" #") || display.toLowerCase()}
                      <button onClick={() => toggleTag(tg)} aria-label={`Remove tag ${tg}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button onClick={clearFilters} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
                  {t("filter.clear")}
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h2 className="text-2xl font-bold">{hasFilters ? t("events.upcoming") : t("events.upcoming")}</h2>
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  {filteredEvents ? `${filteredEvents.length}` : "…"}
                </span>
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
                </div>
              ) : filteredEvents && filteredEvents.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
                </div>
              ) : (
                <div className="text-muted-foreground p-10 text-center border border-dashed border-border rounded-lg">
                  {t("events.none")}
                </div>
              )}
            </div>

            {articles && articles.length > 0 && (
              <div>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <h2 className="text-2xl font-bold">{t("articles.latest", "Latest Articles")}</h2>
                  <Link href="/articles" className="text-sm text-primary hover:underline">{t("articles.viewAll", "View all")} →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {articles.map((a) => (
                    <Link key={a.id} href={`/articles/${a.slug}`} className="block group bg-card border border-border rounded-lg overflow-hidden hover-elevate transition-all">
                      {a.coverImage && (
                        <div className="aspect-video bg-muted overflow-hidden">
                          <img
                            src={a.coverImage}
                            alt={a.title}
                            width="640"
                            height="360"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-hover-accent transition-colors">
                          {pickLocalized(a.title, (a as any).titleRu)}
                        </h3>
                        <p className="text-xs text-muted-foreground">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}{a.author ? ` · ${a.author}` : ""}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 xl:col-span-3 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("filter.country")}</h3>
                <div className="flex flex-col gap-1">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCountry((prev) => (prev === c.slug ? "" : c.slug))}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 flex items-center justify-between ${
                        selectedCountry === c.slug ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span>{t(c.key)}</span>
                      {stats?.byCountry?.find((s) => s.countrySlug === c.slug) && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCountry === c.slug ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {stats.byCountry.find((s) => s.countrySlug === c.slug)?.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("filter.format")}</h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedFormat("")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                      selectedFormat === "" ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {t("filter.format.all")}
                  </button>
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSelectedFormat((prev) => (prev === f.value ? "" : f.value))}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                        selectedFormat === f.value ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {t(f.key)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("filter.tag")}</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags?.map((tag) => {
                    const active = selectedTags.includes(tag.slug);
                    const count = stats?.byTag?.find((s) => s.tagSlug === tag.slug)?.count ?? 0;
                    const tokens = splitTagName(tag.name);
                    const label = tokens.length > 0 ? tokens.map((t) => `#${t}`).join(" ") : `#${tag.name.toLowerCase()}`;
                    return (
                      <button
                        key={tag.slug}
                        onClick={() => toggleTag(tag.slug)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 inline-flex items-center gap-1 lowercase ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground border-border hover:border-primary hover:text-primary"
                        } ${count === 0 ? "opacity-60" : ""}`}
                      >
                        {label}
                        {count > 0 && <span className={`text-[10px] ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
