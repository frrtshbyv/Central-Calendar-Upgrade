import { useAdminListEvents, usePublishEvent, useRejectEvent, getAdminListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Inbox, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function AdminPending() {
  const { data: events, isLoading } = useAdminListEvents({ status: "pending_review" });
  const publish = usePublishEvent();
  const reject = useRejectEvent();
  const { toast } = useToast();
  const qc = useQueryClient();

  const refresh = () => qc.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });

  const onApprove = (id: number, title: string) => {
    publish.mutate({ id }, {
      onSuccess: () => { toast({ title: `Published: ${title}` }); refresh(); },
      onError: (err: any) => toast({ variant: "destructive", title: "Publish failed", description: err?.error }),
    });
  };

  const onReject = (id: number, title: string) => {
    reject.mutate({ id }, {
      onSuccess: () => { toast({ title: `Rejected: ${title}` }); refresh(); },
      onError: (err: any) => toast({ variant: "destructive", title: "Reject failed", description: err?.error }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-6 flex items-center gap-3">
        <Inbox className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Submissions</h1>
          <p className="text-muted-foreground text-sm">Review public submissions before they are published.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : !events || events.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
          No pending submissions. Nice and quiet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{ev.countryName}</Badge>
                    <Badge variant="secondary">{ev.eventFormat}</Badge>
                    {ev.tags.map((t) => <Badge key={t.id} variant="outline" className="text-xs">{t.name}</Badge>)}
                  </div>
                  <h3 className="text-lg font-semibold">{ev.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(ev.startDate).toLocaleDateString()} · {ev.location}
                  </p>
                  {ev.contactEmail && (
                    <p className="text-xs text-muted-foreground mt-1">Contact: {ev.contactEmail}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" asChild variant="outline">
                    <Link href={`/control-room-7f92x/events/edit/${ev.id}`}><ExternalLink className="h-4 w-4" /></Link>
                  </Button>
                  <Button size="sm" onClick={() => onApprove(ev.id, ev.title)} disabled={publish.isPending}>
                    <Check className="h-4 w-4 mr-1" /> Approve & Publish
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onReject(ev.id, ev.title)} disabled={reject.isPending}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground/80 line-clamp-3">{ev.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
