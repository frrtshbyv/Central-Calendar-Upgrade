import { useGetEventBySlug, getGetEventBySlugQueryKey, useGetRelatedEvents, getGetRelatedEventsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { MapPin, Calendar, ExternalLink, ArrowLeft, Tag as TagIcon, Globe } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/EventCard";
import { useI18n } from "@/i18n";
import { splitTagName } from "@/lib/utils";
import { ru as ruLocale, enUS as enLocale } from "date-fns/locale";

export default function EventDetail({ params }: { params: { slug: string } }) {
  const { t, lang, pickLocalized } = useI18n();
  const dfnsLocale = lang === "ru" ? ruLocale : enLocale;
  const { data: event, isLoading, error } = useGetEventBySlug(params.slug, {
    query: { enabled: !!params.slug, queryKey: getGetEventBySlugQueryKey(params.slug) }
  });

  const { data: relatedEvents } = useGetRelatedEvents(params.slug, {
    query: { enabled: !!params.slug, queryKey: getGetRelatedEventsQueryKey(params.slug) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">{t("event.notFound")}</h1>
        <p className="text-muted-foreground mb-8">{t("event.notFound.body")}</p>
        <Button asChild>
          <Link href="/">{t("event.return")}</Link>
        </Button>
      </div>
    );
  }

  const isPast = new Date(event.endDate || event.startDate) < new Date();

  return (
    <article className="pb-24">
      {/* Header Hero */}
      <header className="bg-card border-b border-border pt-12 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("event.back")}
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="rounded-sm text-sm py-1 px-3">
              {event.countryName}
            </Badge>
            {event.featured && (
              <Badge variant="default" className="bg-primary rounded-sm text-sm py-1 px-3">
                {t("event.featuredSummit")}
              </Badge>
            )}
            {isPast && (
              <Badge variant="outline" className="rounded-sm text-sm py-1 px-3 bg-muted">
                {t("event.concluded")}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-serif leading-tight">
            {pickLocalized(event.title, (event as any).titleRu) || event.title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-muted-foreground bg-muted/50 p-6 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">{t("event.date")}</div>
                <div>{format(new Date(event.startDate), "MMMM d, yyyy", { locale: dfnsLocale })}</div>
                {event.endDate && event.endDate !== event.startDate && (
                  <div className="text-sm">
                    {t("event.dateTo").replace("{date}", format(new Date(event.endDate), "MMMM d, yyyy", { locale: dfnsLocale }))}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:block w-px bg-border"></div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">{t("event.location")}</div>
                <div>{pickLocalized(event.location, (event as any).locationRu) || event.location}</div>
                <div className="text-sm">{event.countryName}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            {event.previewImage ? (
              <img
                src={event.previewImage}
                alt={event.title}
                width="1200"
                height="675"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full aspect-[16/9] object-cover rounded-xl border border-border mb-8 shadow-sm"
              />
            ) : (
              <div className="w-full aspect-[21/9] bg-muted rounded-xl border border-border mb-8 flex items-center justify-center">
                <Globe className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
            
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif">
              <h2 className="text-2xl font-bold mb-4">{t("event.about")}</h2>
              {(pickLocalized(event.description, (event as any).descriptionRu) || event.description).split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-muted-foreground whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          </div>
          
          <aside className="md:col-span-1">
            <div className="sticky top-24 flex flex-col gap-6">
              
              {/* Actions */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="font-bold mb-4">{t("event.participation")}</h3>
                {event.organizerLink ? (
                  <Button className="w-full" size="lg" asChild>
                    <a href={event.organizerLink} target="_blank" rel="noopener noreferrer">
                      {t("event.officialSite")} <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    {t("event.registrationClosed")}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {t("event.officialNote")}
                </p>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" /> {t("event.sectors")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.flatMap((tag) =>
                      splitTagName(tag.name).map((token) => (
                        <Link key={`${tag.id}-${token}`} href={`/?tag=${tag.slug}`}>
                          <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors rounded-sm font-normal lowercase">
                            #{token}
                          </Badge>
                        </Link>
                      )),
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related Events */}
      {relatedEvents && relatedEvents.length > 0 && (
        <section className="bg-muted border-t border-border mt-24 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold font-serif mb-8 text-center">{t("event.related")}</h2>
            <div className="flex flex-col gap-4">
              {relatedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
