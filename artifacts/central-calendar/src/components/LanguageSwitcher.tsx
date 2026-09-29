import { useI18n } from "@/i18n";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ variant = "header" }: { variant?: "header" | "ghost" }) {
  const { lang, setLang } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={
            variant === "header"
              ? "h-8 px-2 text-shell-foreground/70 hover:text-shell-foreground hover:bg-shell-foreground/10 gap-1"
              : "h-8 px-2 gap-1"
          }
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onSelect={() => setLang("en")} className={lang === "en" ? "font-semibold" : undefined}>
          EN — English
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setLang("ru")} className={lang === "ru" ? "font-semibold" : undefined}>
          RU — Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
