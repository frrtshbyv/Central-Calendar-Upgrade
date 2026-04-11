import { Link } from "wouter";
import { Event } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function EventCard({ event, index = 0 }: { event: Event, index?: number }) {
  const isPast = new Date(event.endDate || event.startDate) < new Date();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group flex flex-col sm:flex-row bg-card border border-border rounded-lg overflow-hidden transition-all hover:border-primary/50 hover:shadow-md ${isPast ? 'opacity-70' : ''}`}
    >
      {/* Date block */}
      <div className="sm:w-32 bg-muted/50 p-4 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {format(new Date(event.startDate), "MMM")}
        </span>
        <span className="text-3xl font-bold text-foreground">
          {format(new Date(event.startDate), "dd")}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(event.startDate), "yyyy")}
        </span>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="rounded-sm font-medium">
            {event.countryName}
          </Badge>
          {event.tags?.map(tag => (
            <Badge key={tag.id} variant="outline" className="rounded-sm font-normal text-muted-foreground bg-transparent">
              {tag.name}
            </Badge>
          ))}
          {event.featured && (
            <Badge variant="default" className="rounded-sm font-medium bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
        </div>
        
        <Link href={`/event/${event.slug}`} className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{event.location}</span>
            </div>
            {event.endDate && event.endDate !== event.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Until {format(new Date(event.endDate), "MMM dd")}</span>
              </div>
            )}
          </div>
          
          <Link 
            href={`/event/${event.slug}`}
            className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
          >
            Details <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
