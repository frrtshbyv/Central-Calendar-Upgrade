import { useState } from "react";
import { useListEvents } from "@workspace/api-client-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, List as ListIcon, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const { data: events, isLoading } = useListEvents();

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    if (!events) return [];
    return events.filter(event => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
      return (date >= eventStart && date <= eventEnd) || isSameDay(date, eventStart) || isSameDay(date, eventEnd);
    });
  };

  const getEventsForMonth = () => {
    if (!events) return [];
    return events.filter(event => {
      const eventStart = parseISO(event.startDate);
      return isSameMonth(eventStart, currentDate);
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const monthEvents = getEventsForMonth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-1">Regional Calendar</h1>
          <p className="text-muted-foreground text-sm">Strategic events schedule across Central Asia</p>
        </div>
        
        <div className="flex items-center gap-4 bg-muted p-1 rounded-md">
          <Button 
            variant={viewMode === "calendar" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("calendar")}
            className="text-xs h-8"
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> Month
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("list")}
            className="text-xs h-8"
          >
            <ListIcon className="w-4 h-4 mr-2" /> Agenda
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-card border border-border p-4 rounded-lg">
        <h2 className="text-xl font-bold font-serif">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg border border-border" />
      ) : viewMode === "calendar" ? (
        <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-muted p-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Empty cells for padding start of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-card min-h-[120px] p-2 opacity-50" />
          ))}
          
          {/* Days */}
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={day.toISOString()} className={`bg-card min-h-[120px] p-2 border-t border-transparent hover:bg-muted/30 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                <div className={`text-right text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(day, "d")}
                </div>
                <div className="flex flex-col gap-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <Link key={event.id} href={`/event/${event.slug}`} className="text-xs truncate bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground px-1.5 py-1 rounded transition-colors" title={event.title}>
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center font-medium mt-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {monthEvents.length > 0 ? (
            monthEvents.map(event => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <CalendarIcon className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium">No events scheduled</h3>
              <p className="text-muted-foreground">There are no events listed for {format(currentDate, "MMMM yyyy")}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
