import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  useAdminListEvents, 
  usePublishEvent, 
  useArchiveEvent, 
  useDeleteEvent,
  getAdminListEventsQueryKey,
  useGetAdminLogs
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Search, Edit, Trash2, Eye, Archive, CheckCircle, Globe, Activity } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading } = useAdminListEvents({});
  const { data: logs } = useGetAdminLogs({ limit: 5 });
  
  const publishEvent = usePublishEvent();
  const archiveEvent = useArchiveEvent();
  const deleteEvent = useDeleteEvent();

  const filteredEvents = events?.filter(e => 
    e.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    e.countryName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleAction = (action: any, id: number, message: string) => {
    action.mutate({ id }, {
      onSuccess: () => {
        toast({ title: message });
        queryClient.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Action failed" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground text-sm">Manage, publish, and track all regional events.</p>
        </div>
        <Button asChild>
          <Link href="/control-room-7f92x/events/new">Add New Event</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or country..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading registry data...
                    </TableCell>
                  </TableRow>
                ) : filteredEvents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No events found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents?.map((event) => (
                    <TableRow key={event.id} className="group">
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        <div className="flex gap-1 mt-1">
                          {event.featured && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Featured</Badge>}
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{event.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">{event.countryName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{format(new Date(event.startDate), "MMM d, yyyy")}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={event.status === 'published' ? 'default' : event.status === 'draft' ? 'secondary' : 'outline'}
                          className={event.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : ''}
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/event/${event.slug}`} target="_blank" className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View Public
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/control-room-7f92x/events/edit/${event.id}`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            
                            {event.status !== 'published' && (
                              <DropdownMenuItem onClick={() => handleAction(publishEvent, event.id, "Event published")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Publish
                              </DropdownMenuItem>
                            )}
                            
                            {event.status !== 'archived' && (
                              <DropdownMenuItem onClick={() => handleAction(archiveEvent, event.id, "Event archived")}>
                                <Archive className="mr-2 h-4 w-4 text-amber-500" /> Archive
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to permanently delete this event?")) {
                                  handleAction(deleteEvent, event.id, "Event deleted");
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-card border border-border rounded-lg shadow-sm p-4 sticky top-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {logs?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No recent activity.</div>
              ) : (
                logs?.map((log) => (
                  <div key={log.id} className="text-sm">
                    <div className="font-medium">{log.action}</div>
                    <div className="text-muted-foreground line-clamp-1">{log.eventTitle || 'Unknown Event'}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.timestamp), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
