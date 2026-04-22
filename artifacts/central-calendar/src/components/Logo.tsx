import { useEffect, useState } from "react";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

export function Logo({ size = 36, showWordmark = true, variant = "light", className = "" }: LogoProps) {
  const [base, setBase] = useState("/");
  useEffect(() => {
    setBase(import.meta.env.BASE_URL || "/");
  }, []);
  const src = base.replace(/\/$/, "") + "/logo.svg";
  const wordmarkColor = variant === "light" ? "text-primary-foreground" : "text-foreground";
  const taglineColor = variant === "light" ? "text-primary-foreground/60" : "text-muted-foreground";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={src} width={size} height={size} alt="Central Calendar" style={{ flexShrink: 0 }} />
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold tracking-tight ${wordmarkColor}`} style={{ fontSize: Math.round(size * 0.42) }}>
            Central Calendar
          </span>
          <span className={`text-[10px] uppercase tracking-[0.18em] ${taglineColor}`}>Plan the region</span>
        </div>
      )}
    </div>
  );
}
