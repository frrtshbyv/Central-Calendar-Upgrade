import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Scrolls the window to the top whenever the route changes. Wouter (like most
 * lightweight SPA routers) preserves scroll position across navigations, which
 * makes deep-linked content land halfway down the page when you click into it
 * from a scrolled list. Mount this once inside the router so every internal
 * navigation starts from the top.
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}
