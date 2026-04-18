import { useEffect, useMemo, useRef, useState } from "react";
import {
  useListEvents,
  useListCountries,
  useListTags,
} from "@workspace/api-client-react";
import {
  format,
  addDays,
  isSameDay,
  parseISO,
  startOfDay,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { Link } from "wouter";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DATE_STRIP_DAYS = 120;

export default function CalendarPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const { data: events, isLoading } = useListEvents();
  const { data: countries } = useListCountries();
  const { data: tags } = useListTags();

  const dateStrip = useMemo(
    () => Array.from({ length: DATE_STRIP_DAYS }, (_, i) => addDays(today, i)),
    [today]
  );

  const stripRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedDate]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter((event) => {
        const start = startOfDay(parseISO(event.startDate));
        const end = event.endDate
          ? startOfDay(parseISO(event.endDate))
          : start;
        const inRange =
          isSameDay(selectedDate, start) ||
          isSameDay(selectedDate, end) ||
          isWithinInterval(selectedDate, { start, end });
        if (!inRange) return false;
        if (selectedCountryId && event.countryId !== selectedCountryId)
          return false;
        if (
          selectedTagId &&
          !event.tags?.some((t) => t.id === selectedTagId)
        )
          return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }, [events, selectedDate, selectedCountryId, selectedTagId]);

  const groupedDates = useMemo(() => {
    const groups: { monthLabel: string; dates: Date[] }[] = [];
    let currentMonthKey = "";
    for (const d of dateStrip) {
      const key = format(d, "yyyy-MM");
      if (key !== currentMonthKey) {
        groups.push({ monthLabel: format(startOfMonth(d), "MMM").toUpperCase(), dates: [] });
        currentMonthKey = key;
      }
      groups[groups.length - 1].dates.push(d);
    }
    return groups;
  }, [dateStrip]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">
            Events on {format(selectedDate, "MMMM d, yyyy")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Strategic events across Central Asia and the Caspian Region
          </p>
        </div>

        {/* Date strip — afisha-style horizontal scroller */}
        <div
          ref={stripRef}
          className="flex items-end gap-1 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-thin scroll-smooth border-b border-border"
          data-testid="date-strip"
        >
          {groupedDates.map((group, gi) => (
            <div key={gi} className="flex items-end gap-1 shrink-0">
              <div className="px-2 pb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase shrink-0">
                {group.monthLabel}
              </div>
              {group.dates.map((d) => {
                const isSelected = isSameDay(d, selectedDate);
                const isToday = isSameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    ref={isSelected ? selectedRef : undefined}
                    onClick={() => setSelectedDate(d)}
                    data-testid={`date-${format(d, "yyyy-MM-dd")}`}
                    className={`flex flex-col items-center justify-center min-w-[44px] py-2 px-1 rounded-md transition-colors shrink-0 ${
                      isSelected
                        ? "bg-foreground text-background"
                        : isToday
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide opacity-80">
                      {format(d, "EEE")}
                    </span>
                    <span className="text-base font-semibold leading-tight">
                      {format(d, "d")}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <FilterPill
            active={selectedCountryId === null}
            onClick={() => setSelectedCountryId(null)}
            label="All Regions"
          />
          {countries?.map((c) => (
            <FilterPill
              key={c.id}
              active={selectedCountryId === c.id}
              onClick={() =>
                setSelectedCountryId(selectedCountryId === c.id ? null : c.id)
              }
              label={c.name}
            />
          ))}
          {tags && tags.length > 0 && (
            <>
              <div className="w-px h-6 bg-border mx-2" />
              <FilterPill
                active={selectedTagId === null}
                onClick={() => setSelectedTagId(null)}
                label="All Topics"
                muted
              />
              {tags.slice(0, 8).map((t) => (
                <FilterPill
                  key={t.id}
                  active={selectedTagId === t.id}
                  onClick={() =>
                    setSelectedTagId(selectedTagId === t.id ? null : t.id)
                  }
                  label={t.name}
                  muted
                />
              ))}
            </>
          )}
        </div>

        {/* Event grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-lg">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No events on this date</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Try selecting another day or clearing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <AfishaCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  muted = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors border ${
        active
          ? "bg-foreground text-background border-foreground"
          : muted
          ? "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          : "bg-card text-foreground border-border hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function AfishaCard({
  event,
}: {
  event: import("@workspace/api-client-react").Event;
}) {
  const start = parseISO(event.startDate);
  const end = event.endDate ? parseISO(event.endDate) : null;
  const dateLabel =
    end && !isSameDay(start, end)
      ? `${format(start, "MMM d")} – ${format(end, "MMM d")}`
      : format(start, "MMM d, yyyy");

  const primaryTag = event.tags?.[0]?.name;

  return (
    <Link
      href={`/event/${event.slug}`}
      className="group flex flex-col bg-card rounded-lg overflow-hidden border border-border hover:border-foreground/40 hover:shadow-lg transition-all duration-200"
      data-testid={`event-card-${event.id}`}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {event.previewImage ? (
          <img
            src={event.previewImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/40">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-background/90 backdrop-blur text-foreground text-[10px] font-semibold uppercase tracking-wider rounded">
          {event.countryName}
        </div>
        {event.featured && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider rounded">
            Featured
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {primaryTag && (
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {primaryTag}
          </span>
        )}
        <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="mt-auto pt-2 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3 h-3 shrink-0" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
