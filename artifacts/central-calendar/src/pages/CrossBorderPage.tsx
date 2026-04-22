import { useGetCrossBorderEvents, useGetEventStats } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";

export default function CrossBorderPage() {
  const { data: events, isLoading } = useGetCrossBorderEvents();
  const { data: stats } = useGetEventStats();
  const { t } = useI18n();

  return (
    <div className="w-full">
      <section className="bg-primary text-primary-foreground py-16 md:py-24 px-4 border-b border-primary-border">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-serif">{t("crossBorder.title")}</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">{t("crossBorder.subtitle")}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold">{t("crossBorder.heading")}</h2>
              <span className="text-sm text-muted-foreground font-mono">
                {events?.length || 0} {t("country.records")}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="flex flex-col gap-4">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">{t("crossBorder.empty")}</p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">{t("crossBorder.members")}</h3>
                <div className="flex flex-col gap-2">
                  {stats?.byCountry?.map(c => (
                    <a key={c.countrySlug} href={`/${c.countrySlug}`} className="flex items-center justify-between group py-1">
                      <span className="font-medium group-hover:text-primary transition-colors">{c.countryName}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.count}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
