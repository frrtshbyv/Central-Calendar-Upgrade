import { ShieldCheck, Map, Network } from "lucide-react";
import { useI18n } from "@/i18n";

export default function About() {
  const { t } = useI18n();
  return (
    <div className="w-full pb-24">
      <section className="bg-primary text-primary-foreground py-20 md:py-32 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-serif">{t("about.tagline")}</h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">{t("about.lead")}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">{t("about.body1")}</p>
          <p>
            <strong>Central Calendar</strong>
            {" — "}
            {t("about.body2")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 border-t border-border pt-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t("about.pillar.authoritative.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("about.pillar.authoritative.body")}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t("about.pillar.regional.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("about.pillar.regional.body")}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Network className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t("about.pillar.strategic.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("about.pillar.strategic.body")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
