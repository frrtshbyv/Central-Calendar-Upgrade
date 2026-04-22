import { Link } from "wouter";
import { Event } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ru as ruLocale, enUS as enLocale } from "date-fns/locale";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

export function EventCard({ event, index = 0 }: { event: Event; index?: number }) {
  const { t, lang, pickLocalized } = useI18n();
  const dfns = lang === "ru" ? ruLocale : enLocale;
  const isPast = new Date(event.endDate || event.startDate) < new Date();
  const title = pickLocalized(event.title, (event as any).titleRu) || event.title;
  const description = pickLocalized(event.description, (event as any).descriptionRu) || event.description;
  const location = pickLocalized(event.location, (event as any).locationRu) || event.location;

  return (
    <div
      className={`group flex flex-col sm:flex-row bg-card border border-border rounded-lg overflow-hidden
        transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5
        ${isPast ? "opacity-70" : ""}
      `}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="sm:w-32 bg-muted/50 p-4 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {format(new Date(event.startDate), "MMM", { locale: dfns })}
        </span>
        <span className="text-3xl font-bold text-foreground">
          {format(new Date(event.startDate), "dd", { locale: dfns })}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(event.startDate), "yyyy", { locale: dfns })}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="rounded-sm font-medium">
            {event.countryName}
          </Badge>
          {event.tags?.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="rounded-sm font-normal text-muted-foreground bg-transparent"
            >
              {tag.name}
            </Badge>
          ))}
          {event.featured && (
            <Badge variant="default" className="rounded-sm font-medium bg-primary text-primary-foreground">
              {t("calendar.featured")}
            </Badge>
          )}
        </div>

        <Link
          href={`/event/${event.slug}`}
          className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-150 line-clamp-2"
        >
          {title}
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{description}</p>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{location}</span>
            </div>
            {event.endDate && event.endDate !== event.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {t("event.until").replace("{date}", format(new Date(event.endDate), "MMM dd", { locale: dfns }))}
                </span>
              </div>
            )}
          </div>
          <Link
            href={`/event/${event.slug}`}
            className="text-sm font-medium text-primary flex items-center gap-1 hover:underline transition-colors duration-150"
          >
            {t("events.viewDetails")} <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
