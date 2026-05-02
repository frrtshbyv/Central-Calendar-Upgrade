interface LogoProps {
  size?: number;
  variant?: "horizontal" | "stacked" | "icon";
  tone?: "light" | "dark" | "auto";
  className?: string;
  priority?: boolean;
}

const HORIZONTAL_SRC = "/logo-horizontal.png";
const HORIZONTAL_ASPECT = 1112 / 224;
const STACKED_SRC = "/logo-stacked.png";
const STACKED_ASPECT = 540 / 594;

export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  className = "",
  priority = false,
}: LogoProps) {
  const src = variant === "stacked" ? STACKED_SRC : HORIZONTAL_SRC;
  const aspect = variant === "stacked" ? STACKED_ASPECT : HORIZONTAL_ASPECT;

  const inlineFilter =
    tone === "light"
      ? "brightness(0) invert(1)"
      : tone === "dark"
        ? "brightness(0)"
        : undefined;

  if (variant === "icon") {
    return (
      <span
        role="img"
        aria-label="Central Calendar"
        className={`site-logo cc-logo inline-block align-middle overflow-hidden relative ${className}`}
        style={{ width: size, height: size }}
        data-tone={tone !== "auto" ? tone : undefined}
      >
        <img
          src={HORIZONTAL_SRC}
          alt=""
          aria-hidden="true"
          width={Math.round(size * HORIZONTAL_ASPECT)}
          height={size}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size * HORIZONTAL_ASPECT,
            height: size,
            filter: inlineFilter,
          }}
        />
      </span>
    );
  }

  const width = size * aspect;
  const height = size;

  return (
    <img
      src={src}
      alt="Central Calendar"
      width={Math.round(width)}
      height={Math.round(height)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`site-logo cc-logo inline-block align-middle shrink-0 ${className}`}
      data-tone={tone !== "auto" ? tone : undefined}
      style={{ width, height, objectFit: "contain", filter: inlineFilter }}
    />
  );
}
