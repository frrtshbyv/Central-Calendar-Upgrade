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

// Original brand artwork — these PNGs are the canonical source of the logo.
// We project them through a CSS mask so `currentColor` (driven by the theme
// rules in index.css) becomes the visible color. The PNG paths/shapes are
// never modified.
const HORIZONTAL_SRC = "/logo-horizontal.png";
const HORIZONTAL_ASPECT = 1112 / 224; // ≈ 4.96
const STACKED_SRC = "/logo-stacked.png";
const STACKED_ASPECT = 540 / 594; // ≈ 0.91

export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  className = "",
  priority = false,
}: LogoProps) {
  // `priority` was used by the legacy <img>-based logo; CSS-mask logos don't
  // need a fetchPriority hint (the image loads as a background asset).
  void priority;

  const colorStyle =
    tone === "light"
      ? "#ffffff"
      : tone === "dark"
        ? "#3b4f43"
        : undefined;

  const src = variant === "stacked" ? STACKED_SRC : HORIZONTAL_SRC;
  const aspect = variant === "stacked" ? STACKED_ASPECT : HORIZONTAL_ASPECT;

  // For "icon" variant we render a square crop of the horizontal logo's icon
  // portion. The horizontal artwork has the spiral icon in roughly the first
  // ~22% of its width. We crop with a wider mask + offset so only the icon
  // shows in a square box.
  if (variant === "icon") {
    return (
      <span
        role="img"
        aria-label="Central Calendar"
        className={`site-logo cc-logo inline-block align-middle ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: colorStyle ?? "currentColor",
          color: colorStyle,
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: `${HORIZONTAL_ASPECT * 100}% auto`,
          maskSize: `${HORIZONTAL_ASPECT * 100}% auto`,
          WebkitMaskPosition: "left center",
          maskPosition: "left center",
        }}
      />
    );
  }

  const width = variant === "stacked" ? size * STACKED_ASPECT : size * aspect;
  const height = size;

  return (
    <span
      role="img"
      aria-label="Central Calendar"
      className={`site-logo cc-logo inline-block align-middle shrink-0 ${className}`}
      style={{
        width,
        height,
        backgroundColor: colorStyle ?? "currentColor",
        color: colorStyle,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
