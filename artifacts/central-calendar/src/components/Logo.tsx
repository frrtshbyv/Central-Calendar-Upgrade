interface LogoProps {
  size?: number;
  variant?: "horizontal" | "stacked" | "icon";
  tone?: "light" | "dark" | "auto";
  className?: string;
  priority?: boolean;
}

/**
 * Inline SVG brand logo. Uses `currentColor` so theme-aware color switching
 * works via CSS. The light theme overrides currentColor to #3b4f43 (see index.css);
 * in dark theme it stays the inherited foreground (typically white on the dark header).
 *
 * `tone` lets a caller force a color (used inside the always-dark header) regardless
 * of the resolved theme. `auto` defers to currentColor.
 */
export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  className = "",
  priority = false,
}: LogoProps) {
  const colorStyle = tone === "light"
    ? { color: "#ffffff" }
    : tone === "dark"
      ? { color: "#3b4f43" }
      : undefined;

  const commonProps = {
    role: "img" as const,
    "aria-label": "Central Calendar",
    fill: "currentColor",
    style: colorStyle,
    className: `cc-logo flex-shrink-0 ${className}`,
    fetchPriority: priority ? ("high" as const) : undefined,
  };

  if (variant === "icon") {
    return (
      <svg
        {...commonProps}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SpiralIcon />
      </svg>
    );
  }

  if (variant === "stacked") {
    return (
      <svg
        {...commonProps}
        width={size}
        height={size * 1.05}
        viewBox="0 0 200 210"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(50 5)">
          <SpiralIcon />
        </g>
        <text
          x="100"
          y="148"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="26"
          letterSpacing="2"
        >
          CENTRAL
        </text>
        <text
          x="100"
          y="180"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="26"
          letterSpacing="2"
        >
          CALENDAR
        </text>
      </svg>
    );
  }

  // horizontal — viewBox is sized so "CENTRAL CALENDAR" never clips.
  const aspect = 5.6;
  return (
    <svg
      {...commonProps}
      width={size * aspect}
      height={size}
      viewBox="0 0 560 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(0 10)">
        <SpiralIcon />
      </g>
      <text
        x="110"
        y="62"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="34"
        letterSpacing="1.5"
      >
        CENTRAL CALENDAR
      </text>
    </svg>
  );
}

function SpiralIcon() {
  // Two interlocking spirals/loops, drawn with strokes inheriting currentColor.
  return (
    <g transform="translate(40 40)" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <circle cx="-10" cy="0" r="22" />
      <circle cx="10" cy="0" r="22" />
      <path d="M -10 -22 a 22 22 0 0 1 0 44" strokeWidth="6" />
      <path d="M 10 22 a 22 22 0 0 1 0 -44" strokeWidth="6" />
    </g>
  );
}
