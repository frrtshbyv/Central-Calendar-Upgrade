import { useGetEventStats, useGetFeaturedEvents, useGetUpcomingEvents } from "@workspace/api-client-react";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function Home() {
  const { data: stats } = useGetEventStats();
  const { data: featuredEvents, isLoading: isFeaturedLoading } = useGetFeaturedEvents();
  const { data: upcomingEvents, isLoading: isUpcomingLoading } = useGetUpcomingEvents({ limit: 10 });
  const [, setLocation] = useLocation();
  
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-24 md:py-32 px-4 border-b border-border">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-serif">PLAN THE REGION.</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Strategic coordination intelligence platform for Central Asia and the Caspian region. 
            Track high-level strategic events, forums, and bilateral summits.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base font-mono opacity-80">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.totalPublished || 0}</span>
              <span className="uppercase tracking-wider text-xs">Total Events</span>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.upcomingThisMonth || 0}</span>
              <span className="uppercase tracking-wider text-xs">This Month</span>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-1">{stats?.byCountry?.length || 0}</span>
              <span className="uppercase tracking-wider text-xs">Nations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                Featured Summits
              </h2>
              {isFeaturedLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
                </div>
              ) : featuredEvents && featuredEvents.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {featuredEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground p-8 text-center border border-dashed border-border rounded-lg">
                  No featured events currently.
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                Upcoming Schedule
              </h2>
              {isUpcomingLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
                </div>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {upcomingEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground p-8 text-center border border-dashed border-border rounded-lg">
                  No upcoming events currently.
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 flex flex-col gap-8">
              
              {/* Sectors */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Strategic Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {stats?.byTag?.map(tag => (
                    <span 
                      key={tag.tagSlug} 
                      className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-xs font-medium rounded-full border border-border"
                      onClick={() => setLocation(`/?tag=${tag.tagSlug}`)}
                    >
                      #{tag.tagName}
                    </span>
                  ))}
                  {!stats && (
                    <>
                      <div className="w-20 h-8 bg-muted animate-pulse rounded-full"></div>
                      <div className="w-24 h-8 bg-muted animate-pulse rounded-full"></div>
                      <div className="w-16 h-8 bg-muted animate-pulse rounded-full"></div>
                      <div className="w-28 h-8 bg-muted animate-pulse rounded-full"></div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Nations */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Member Nations</h3>
                <div className="flex flex-col gap-2">
                  {stats?.byCountry?.map(country => (
                    <a key={country.countrySlug} href={`/${country.countrySlug}`} className="flex items-center justify-between group py-1">
                      <span className="font-medium group-hover:text-primary transition-colors">{country.countryName}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{country.count}</span>
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
