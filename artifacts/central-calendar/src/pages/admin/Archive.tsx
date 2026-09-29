import { useAdminListEvents, usePublishEvent, getAdminListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Archive as ArchiveIcon } from "lucide-react";

export default function AdminArchive() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useAdminListEvents({ status: "archived" });
  const publishEvent = usePublishEvent();

  const handleRepublish = (id: number) => {
    publishEvent.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Event restored to published status" });
        queryClient.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to restore event" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ArchiveIcon className="h-6 w-6 text-muted-foreground" /> Event Archive
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Concluded or hidden events removed from public feeds.</p>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Accessing archives...
                </TableCell>
              </TableRow>
            ) : events?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  The archive is currently empty.
                </TableCell>
              </TableRow>
            ) : (
              events?.map((event) => (
                <TableRow key={event.id} className="opacity-70 hover:opacity-100 transition-opacity">
                  <TableCell>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">Archived</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{event.countryName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{format(new Date(event.startDate), "MMM d, yyyy")}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRepublish(event.id)}
                      disabled={publishEvent.isPending}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-2" /> Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
