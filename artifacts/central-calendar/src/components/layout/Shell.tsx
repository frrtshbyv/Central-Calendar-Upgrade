import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSearchEvents } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/calendar", label: "Calendar" },
  { href: "/about", label: "About" },
];

const COUNTRIES = [
  { href: "/uzbekistan", label: "Uzbekistan" },
  { href: "/kazakhstan", label: "Kazakhstan" },
  { href: "/kyrgyzstan", label: "Kyrgyzstan" },
  { href: "/turkmenistan", label: "Turkmenistan" },
  { href: "/caspian-region", label: "Caspian Region" },
  { href: "/cross-border", label: "Cross-Border Events", accent: true },
];

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: isSearching } = useSearchEvents(
    { q: debouncedSearch },
    { query: { enabled: debouncedSearch.length > 2 } }
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearch("");
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header
        className={`sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div
          className={`container mx-auto px-4 md:px-8 flex items-center gap-4 transition-all duration-200 ${
            scrolled ? "h-12" : "h-16"
          }`}
        >
          <Link href="/" className="flex items-center shrink-0 mr-6">
            <Logo size={scrolled ? "sm" : "md"} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-auto">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground duration-150 ${location === "/" ? "text-foreground" : ""}`}
            >
              Overview
            </Link>

            <div
              className="relative group"
              onMouseEnter={() => setCountriesOpen(true)}
              onMouseLeave={() => setCountriesOpen(false)}
            >
              <button className="cursor-pointer hover:text-foreground flex items-center gap-1 transition-colors duration-150">
                Countries <ChevronDown className="h-3 w-3" />
              </button>
              <div
                className={`absolute left-0 top-full pt-2 w-52 transition-all duration-150 origin-top ${
                  countriesOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                }`}
              >
                <div className="bg-popover border border-border shadow-md rounded-md p-2 flex flex-col gap-0.5">
                  {COUNTRIES.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={`p-2 hover:bg-muted rounded text-sm transition-colors duration-150 ${
                        c.accent ? "font-medium text-primary border-t border-border mt-1 pt-2" : "text-foreground"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/calendar"
              className={`transition-colors hover:text-foreground duration-150 ${location === "/calendar" ? "text-foreground" : ""}`}
            >
              Calendar
            </Link>
            <Link
              href="/about"
              className={`transition-colors hover:text-foreground duration-150 ${location === "/about" ? "text-foreground" : ""}`}
            >
              About
            </Link>
          </nav>

          <div ref={searchRef} className="hidden md:flex relative items-center w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 bg-muted border-none h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search events"
            />
            {debouncedSearch.length > 2 && (
              <div className="absolute top-full mt-2 left-0 w-full min-w-[320px] bg-popover border border-border rounded-md shadow-lg p-2 max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {searchResults.map((event) => (
                      <Link
                        key={event.id}
                        href={`/event/${event.slug}`}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer block transition-colors duration-150"
                        onClick={() => setSearch("")}
                      >
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          <span>·</span>
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

          <button
            className="ml-auto md:hidden p-2 rounded-md hover:bg-muted transition-colors duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-9 bg-muted border-none h-9 text-sm w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {search.length > 2 && searchResults && searchResults.length > 0 && (
                <div className="mb-3 bg-card border border-border rounded-md p-2 flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                  {searchResults.map((event) => (
                    <Link key={event.id} href={`/event/${event.slug}`} className="p-2 hover:bg-muted rounded text-sm block">
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.countryName}</div>
                    </Link>
                  ))}
                </div>
              )}
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`py-2.5 px-3 rounded-md text-sm font-medium transition-colors duration-150 ${
                    location === l.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">Countries</p>
                {COUNTRIES.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="py-2 px-3 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 block"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-12 mt-12">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="max-w-xs text-center md:text-left">
            <Link href="/" className="inline-block mb-3">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Strategic coordination intelligence for Central Asia and the Caspian region.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground mb-1">Platform</span>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Overview</Link>
              <Link href="/calendar" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Calendar</Link>
              <Link href="/cross-border" className="text-muted-foreground hover:text-foreground transition-colors duration-150">Cross-Border</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-150">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground mb-1">Regions</span>
              {COUNTRIES.slice(0, 4).map((c) => (
                <Link key={c.href} href={c.href} className="text-muted-foreground hover:text-foreground transition-colors duration-150">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Central Calendar. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
