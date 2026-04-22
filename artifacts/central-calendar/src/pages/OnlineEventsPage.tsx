import { useListEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";

export default function OnlineEventsPage() {
  const { data: events, isLoading } = useListEvents({ format: "online" });
  const { data: hybrid } = useListEvents({ format: "hybrid" });

  const all = [...(events ?? []), ...(hybrid ?? [])];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 border-b border-border pb-6">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="h-7 w-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Online Events</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Webinars, virtual summits, and hybrid sessions you can join from anywhere in the region.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
        </div>
      ) : all.length > 0 ? (
        <div className="flex flex-col gap-4">
          {all.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
          No online events scheduled at the moment.
        </div>
      )}
    </div>
  );
}
