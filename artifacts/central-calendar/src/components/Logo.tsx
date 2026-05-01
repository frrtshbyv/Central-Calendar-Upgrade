interface LogoProps {
  size?: number;
  variant?: "horizontal" | "stacked" | "icon";
  /**
   * Force a specific color regardless of theme. Used inside the always-dark
   * header where the logo must remain white. When omitted the logo inherits
   * `currentColor`, which is themed via CSS in `index.css` (white in dark
   * theme, #3b4f43 in light theme).
   */
  tone?: "light" | "dark" | "auto";
  className?: string;
  priority?: boolean;
}

/**
 * Inline mirror of `/public/logo.svg`. The SVG uses `fill="currentColor"` /
 * `stroke="currentColor"` so the brand mark is theme-aware via plain CSS.
 * Path structure is identical to the file on disk — only fill/stroke colors
 * are driven by CSS. For horizontal / stacked variants the wordmark is
 * rendered as HTML text alongside the icon (also inheriting currentColor).
 */
export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  className = "",
  priority = false,
}: LogoProps) {
  const colorStyle =
    tone === "light"
      ? { color: "#ffffff" }
      : tone === "dark"
        ? { color: "#3b4f43" }
        : undefined;

  // `priority` is preserved on the props API for compatibility with prior
  // <img>-based logo, but inline SVGs don't go through the network so there's
  // nothing to prioritize for the icon itself.
  void priority;
  const icon = (
    <svg
      role="img"
      aria-label="Central Calendar"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g transform="translate(32 33)">
        <circle r="3.2" fill="currentColor" />
        <path
          d="M0,-12 a12,12 0 1,1 -8.485,3.515"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M0,-19 a19,19 0 1,1 -13.435,5.565"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.55"
          fill="none"
        />
      </g>
      <rect x="11" y="11" width="6" height="2" fill="currentColor" />
      <rect x="47" y="51" width="6" height="2" fill="currentColor" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <span
        className={`site-logo cc-logo inline-flex items-center ${className}`}
        style={colorStyle}
      >
        {icon}
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span
        className={`site-logo cc-logo inline-flex flex-col items-center gap-2 ${className}`}
        style={colorStyle}
      >
        {icon}
        <span
          className="font-bold tracking-[0.2em] uppercase leading-tight text-center"
          style={{ fontSize: Math.round(size * 0.22) }}
        >
          Central
          <br />
          Calendar
        </span>
      </span>
    );
  }

  // horizontal
  return (
    <span
      className={`site-logo cc-logo inline-flex items-center gap-2.5 ${className}`}
      style={colorStyle}
    >
      {icon}
      <span
        className="font-bold tracking-[0.18em] uppercase whitespace-nowrap"
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        Central Calendar
      </span>
    </span>
  );
}
