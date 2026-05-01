import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSearchEvents, getSearchEventsQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/i18n";

const COUNTRIES: { href: string; key: string; accent?: boolean }[] = [
  { href: "/uzbekistan", key: "nav.uzbekistan" },
  { href: "/kazakhstan", key: "nav.kazakhstan" },
  { href: "/kyrgyzstan", key: "nav.kyrgyzstan" },
  { href: "/turkmenistan", key: "nav.turkmenistan" },
  { href: "/caucasus", key: "nav.caucasus" },
  { href: "/cross-border", key: "nav.crossBorder", accent: true },
];

const NAV_LINKS: { href: string; key: string }[] = [
  { href: "/", key: "nav.home" },
  { href: "/calendar", key: "nav.calendar" },
  { href: "/online", key: "nav.online" },
  { href: "/articles", key: "nav.articles" },
  { href: "/submit-event", key: "nav.submit" },
  { href: "/about", key: "nav.about" },
];

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t, pickLocalized } = useI18n();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [mobileCountriesOpen, setMobileCountriesOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: isSearching } = useSearchEvents(
    { q: debouncedSearch },
    { query: { enabled: debouncedSearch.length > 2, queryKey: getSearchEventsQueryKey({ q: debouncedSearch }) } }
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

  // Close mobile drawer on Escape for keyboard users.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

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
        className={`sticky top-0 z-50 w-full bg-shell border-b border-shell-foreground/10 transition-shadow duration-200 ${
          scrolled ? "shadow-lg shadow-black/20" : ""
        }`}
      >
        <div
          className={`container mx-auto px-4 md:px-8 flex items-center gap-4 transition-all duration-200 ${
            scrolled ? "h-14" : "h-20"
          }`}
        >
          <Link href="/" className="shrink-0 mr-4 text-shell-foreground" aria-label="Central Calendar home">
            <Logo size={scrolled ? 24 : 32} variant="horizontal" priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-shell-foreground/70 mr-auto">
            <Link href="/" className={`transition-colors hover:text-shell-foreground duration-150 ${location === "/" ? "text-shell-foreground" : ""}`}>
              {t("nav.home")}
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setCountriesOpen(true)}
              onMouseLeave={() => setCountriesOpen(false)}
            >
              <button className="cursor-pointer hover:text-shell-foreground flex items-center gap-1 transition-colors duration-150">
                {t("nav.countries")} <ChevronDown className="h-3 w-3" />
              </button>
              <div
                className={`absolute left-0 top-full pt-2 w-52 transition-all duration-150 origin-top ${
                  countriesOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                }`}
              >
                <div className="bg-popover border border-border shadow-lg rounded-md p-2 flex flex-col gap-0.5">
                  {COUNTRIES.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={`p-2 hover:bg-muted rounded text-sm transition-colors duration-150 ${
                        c.accent ? "font-medium text-foreground border-t border-border mt-1 pt-3" : "text-foreground"
                      }`}
                    >
                      {t(c.key)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/calendar" className={`hover:text-shell-foreground duration-150 ${location === "/calendar" ? "text-shell-foreground" : ""}`}>{t("nav.calendar")}</Link>
            <Link href="/online" className={`hover:text-shell-foreground duration-150 ${location === "/online" ? "text-shell-foreground" : ""}`}>{t("nav.online")}</Link>
            <Link href="/articles" className={`hover:text-shell-foreground duration-150 ${location.startsWith("/articles") ? "text-shell-foreground" : ""}`}>{t("nav.articles")}</Link>
            <Link href="/submit-event" className={`hover:text-shell-foreground duration-150 ${location === "/submit-event" ? "text-shell-foreground" : ""}`}>{t("nav.submit")}</Link>
            <Link href="/about" className={`hover:text-shell-foreground duration-150 ${location === "/about" ? "text-shell-foreground" : ""}`}>{t("nav.about")}</Link>
          </nav>

          <div ref={searchRef} className="hidden md:flex relative items-center w-56 ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-shell-foreground/50 pointer-events-none" />
            <Input
              type="search"
              placeholder={t("nav.search")}
              className="pl-9 bg-shell-foreground/10 border-shell-foreground/20 text-shell-foreground placeholder:text-shell-foreground/40 h-9 text-sm focus-visible:ring-shell-foreground/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search events"
            />
            {debouncedSearch.length > 2 && (
              <div className="absolute top-full mt-2 right-0 w-[320px] bg-popover border border-border rounded-md shadow-lg p-2 max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {searchResults.map((event) => (
                      <Link key={event.id} href={`/event/${event.slug}`} className="p-2 hover:bg-muted rounded-md cursor-pointer block transition-colors duration-150" onClick={() => setSearch("")}>
                        <div className="font-medium text-sm truncate">{pickLocalized(event.title, (event as any).titleRu)}</div>
                        <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{event.countryName}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">{t("events.none", "No results found")}</div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1 ml-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <button
            className="ml-auto lg:hidden p-2 rounded-md text-shell-foreground/70 hover:text-shell-foreground hover:bg-shell-foreground/10 transition-colors duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="cc-mobile-drawer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div
            id="cc-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="lg:hidden border-t border-shell-foreground/10 bg-shell animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-shell-foreground/50 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={t("nav.search")}
                  className="pl-9 bg-shell-foreground/10 border-shell-foreground/20 text-shell-foreground placeholder:text-shell-foreground/40 h-9 text-sm w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`py-2.5 px-3 rounded-md text-sm font-medium transition-colors duration-150 ${
                    location === l.href
                      ? "bg-shell-foreground/15 text-shell-foreground"
                      : "text-shell-foreground/70 hover:bg-shell-foreground/10 hover:text-shell-foreground"
                  }`}
                >
                  {t(l.key)}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-shell-foreground/10">
                <button
                  type="button"
                  onClick={() => setMobileCountriesOpen((v) => !v)}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold uppercase tracking-wider text-shell-foreground/40 hover:text-shell-foreground/70"
                  aria-expanded={mobileCountriesOpen}
                >
                  <span>{t("nav.countries")}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${mobileCountriesOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileCountriesOpen && (
                  <div className="flex flex-col">
                    {COUNTRIES.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`py-2 px-3 rounded-md text-sm transition-colors duration-150 block ${
                          c.accent ? "text-shell-foreground/90 font-medium" : "text-shell-foreground/70 hover:bg-shell-foreground/10 hover:text-shell-foreground"
                        }`}
                      >
                        {t(c.key)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2 pt-3 border-t border-shell-foreground/10 flex items-center justify-between px-1">
                <span className="text-xs uppercase tracking-wider text-shell-foreground/40">{t("common.language")}</span>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-shell border-t border-shell-foreground/10 py-12 mt-12">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
          <div className="max-w-xs text-center md:text-left text-shell-foreground">
            <Link href="/" aria-label="Central Calendar home" className="inline-block">
              <Logo size={36} variant="horizontal" />
            </Link>
            <p className="text-sm text-shell-foreground/50 mt-3">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-shell-foreground mb-1">{t("footer.explore")}</span>
              <Link href="/" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.home")}</Link>
              <Link href="/calendar" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.calendar")}</Link>
              <Link href="/online" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.online")}</Link>
              <Link href="/articles" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.articles")}</Link>
              <Link href="/cross-border" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.crossBorder")}</Link>
              <Link href="/submit-event" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.submit")}</Link>
              <Link href="/about" className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">{t("nav.about")}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-shell-foreground mb-1">{t("footer.region")}</span>
              {COUNTRIES.slice(0, 5).map((c) => (
                <Link key={c.href} href={c.href} className="text-shell-foreground/50 hover:text-shell-foreground transition-colors duration-150">
                  {t(c.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-10 pt-6 border-t border-shell-foreground/10 text-center text-xs text-shell-foreground/30">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </div>
      </footer>
    </div>
  );
}
