import { useEffect, useState } from "react";

interface LogoProps {
  size?: number;
  variant?: "horizontal" | "stacked";
  tone?: "light" | "dark";
  className?: string;
}

export function Logo({ size = 40, variant = "horizontal", tone = "light", className = "" }: LogoProps) {
  const [base, setBase] = useState("/");
  useEffect(() => {
    setBase(import.meta.env.BASE_URL || "/");
  }, []);
  const file = variant === "stacked" ? "/logo-stacked.png" : "/logo-horizontal.png";
  const src = base.replace(/\/$/, "") + file;
  const height = size;
  const filter =
    tone === "light"
      ? "brightness(0) saturate(100%) invert(100%)"
      : undefined;
  return (
    <img
      src={src}
      alt="Central Calendar"
      style={{ height, width: "auto", flexShrink: 0, filter }}
      className={className}
    />
  );
}
