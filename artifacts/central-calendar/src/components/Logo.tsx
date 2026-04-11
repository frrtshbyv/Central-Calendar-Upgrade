interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const dims = { sm: 28, md: 40, lg: 56 };
  const px = dims[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="19" cy="31" r="14" stroke="#4D6B47" strokeWidth="5" />
        <circle cx="32" cy="19" r="10.5" stroke="#4D6B47" strokeWidth="5" />
      </svg>
      {showText && (
        <span
          className={`font-bold tracking-[0.12em] uppercase text-foreground leading-none ${textSize[size]}`}
          aria-label="Central Calendar"
        >
          Central Calendar
        </span>
      )}
    </div>
  );
}
