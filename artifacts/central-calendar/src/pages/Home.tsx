import { useState, useCallback } from "react";
import { useGetEventStats, useListEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

const COUNTRIES = [
  { slug: "uzbekistan", name: "Uzbekistan" },
  { slug: "kazakhstan", name: "Kazakhstan" },
  { slug: "kyrgyzstan", name: "Kyrgyzstan" },
  { slug: "turkmenistan", name: "Turkmenistan" },
  { slug: "caspian-region", name: "Caspian Region" },
  { slug: "cross-border", name: "Cross-Border" },
];

export default function Home() {
  const { data: stats } = useGetEventStats();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const { data: events, isLoading } = useListEvents({
    ...(selectedCountry ? { country: selectedCountry } : {}),
    ...(selectedTags.length === 1 ? { tag: selectedTags[0] } : {}),
  });

  const filteredEvents = events
    ? selectedTags.length > 1
      ? events.filter((ev) =>
          selectedTags.every((t) => ev.tags?.some((tag) => tag.slug === t))
        )
      : events
    : undefined;

  const toggleTag = useCallback((slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  }, []);

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCountry("");
  };

  const hasFilters = selectedTags.length > 0 || selectedCountry !== "";

  return (
    <div className="w-full">
      <section className="bg-primary text-primary-foreground py-20 md:py-28 px-4 border-b border-border">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-serif">PLAN THE REGION.</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Strategic coordination intelligence platform for Central Asia and the Caspian region.
            Track high-level strategic events, forums, and bilateral summits.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base font-mono opacity-80">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.totalPublished ?? 0}</span>
              <span className="uppercase tracking-wider text-xs">Total Events</span>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.upcomingThisMonth ?? 0}</span>
              <span className="uppercase tracking-wider text-xs">This Month</span>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.byCountry?.length ?? 0}</span>
              <span className="uppercase tracking-wider text-xs">Nations</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-10">

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/60 rounded-lg border border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filtering:</span>
                {selectedCountry && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {COUNTRIES.find((c) => c.slug === selectedCountry)?.name}
                    <button onClick={() => setSelectedCountry("")} aria-label="Remove country filter">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedTags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/80 text-primary-foreground text-xs font-medium rounded-full">
                    #{stats?.byTag?.find((tg) => tg.tagSlug === t)?.tagName ?? t}
                    <button onClick={() => toggleTag(t)} aria-label={`Remove tag ${t}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  Clear all
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h2 className="text-2xl font-bold">
                  {hasFilters ? "Filtered Events" : "All Events"}
                </h2>
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  {filteredEvents ? `${filteredEvents.length} records` : "Loading…"}
                </span>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-lg" />
                  ))}
                </div>
              ) : filteredEvents && filteredEvents.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground p-10 text-center border border-dashed border-border rounded-lg">
                  {hasFilters
                    ? "No events match the current filters."
                    : "No events currently listed."}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 flex flex-col gap-6">

              <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Filter by Country
                </h3>
                <div className="flex flex-col gap-1">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() =>
                        setSelectedCountry((prev) => (prev === c.slug ? "" : c.slug))
                      }
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 flex items-center justify-between group ${
                        selectedCountry === c.slug
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span>{c.name}</span>
                      {stats?.byCountry?.find((s) => s.countrySlug === c.slug) && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            selectedCountry === c.slug
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {stats.byCountry.find((s) => s.countrySlug === c.slug)?.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Filter by Sector
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats?.byTag?.map((tag) => {
                    const active = selectedTags.includes(tag.tagSlug);
                    return (
                      <button
                        key={tag.tagSlug}
                        onClick={() => toggleTag(tag.tagSlug)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-foreground border-border hover:border-primary hover:text-primary"
                        }`}
                      >
                        #{tag.tagName}
                      </button>
                    );
                  })}
                  {!stats && (
                    <>
                      {[20, 24, 16, 28].map((w) => (
                        <div
                          key={w}
                          className="h-7 bg-muted animate-pulse rounded-full"
                          style={{ width: `${w * 4}px` }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
