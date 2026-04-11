import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useSearchEvents } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Info, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function Shell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: searchResults, isLoading: isSearching } = useSearchEvents(
    { q: debouncedSearch },
    { query: { enabled: debouncedSearch.length > 2 } }
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 mr-8">
            <span className="font-bold tracking-tight text-xl text-primary">CENTRAL CALENDAR</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-auto">
            <Link href="/" className={`transition-colors hover:text-foreground ${location === "/" ? "text-foreground" : ""}`}>Overview</Link>
            <div className="relative group">
              <span className="cursor-pointer hover:text-foreground flex items-center gap-1">
                Countries
              </span>
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block w-48">
                <div className="bg-popover border border-border shadow-md rounded-md p-2 flex flex-col gap-1">
                  <Link href="/uzbekistan" className="p-2 hover:bg-muted rounded text-sm text-foreground">Uzbekistan</Link>
                  <Link href="/kazakhstan" className="p-2 hover:bg-muted rounded text-sm text-foreground">Kazakhstan</Link>
                  <Link href="/kyrgyzstan" className="p-2 hover:bg-muted rounded text-sm text-foreground">Kyrgyzstan</Link>
                  <Link href="/turkmenistan" className="p-2 hover:bg-muted rounded text-sm text-foreground">Turkmenistan</Link>
                  <Link href="/caspian-region" className="p-2 hover:bg-muted rounded text-sm text-foreground">Caspian Region</Link>
                  <div className="h-px bg-border my-1" />
                  <Link href="/cross-border" className="p-2 hover:bg-muted rounded text-sm font-medium text-primary">Cross-Border</Link>
                </div>
              </div>
            </div>
            <Link href="/calendar" className={`transition-colors hover:text-foreground ${location === "/calendar" ? "text-foreground" : ""}`}>Calendar</Link>
            <Link href="/about" className={`transition-colors hover:text-foreground ${location === "/about" ? "text-foreground" : ""}`}>About</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search events..." 
                className="pl-9 bg-muted border-none h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {debouncedSearch.length > 2 && (
                <div className="absolute top-full mt-2 w-full max-w-md bg-popover border border-border rounded-md shadow-lg p-2 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {searchResults.map(event => (
                        <Link key={event.id} href={`/event/${event.slug}`} className="p-2 hover:bg-muted rounded-md cursor-pointer block" onClick={() => setSearch("")}>
                          <div className="font-medium text-sm truncate">{event.title}</div>
                          <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{event.countryName}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                  )}
                </div>
              )}
            </div>
            <Link href="/control-room-7f92x/login" className="text-muted-foreground/30 hover:text-muted-foreground transition-colors" title="Admin Access">
              <ShieldAlert className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-border bg-card py-12 mt-12">
        <div className="container mx-auto px-4 md:px-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="max-w-xs">
            <h3 className="font-bold text-lg mb-2">CENTRAL CALENDAR</h3>
            <p className="text-sm text-muted-foreground">Strategic coordination intelligence for Central Asia and the Caspian region. Plan the region.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground mb-1">Platform</span>
              <Link href="/" className="text-muted-foreground hover:text-foreground">Overview</Link>
              <Link href="/calendar" className="text-muted-foreground hover:text-foreground">Calendar</Link>
              <Link href="/cross-border" className="text-muted-foreground hover:text-foreground">Cross-Border</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground mb-1">Regions</span>
              <Link href="/uzbekistan" className="text-muted-foreground hover:text-foreground">Uzbekistan</Link>
              <Link href="/kazakhstan" className="text-muted-foreground hover:text-foreground">Kazakhstan</Link>
              <Link href="/kyrgyzstan" className="text-muted-foreground hover:text-foreground">Kyrgyzstan</Link>
              <Link href="/turkmenistan" className="text-muted-foreground hover:text-foreground">Turkmenistan</Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Central Calendar. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
