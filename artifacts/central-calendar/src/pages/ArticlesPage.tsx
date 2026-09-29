import { Link } from "wouter";
import { useListArticles } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";
import { useI18n } from "@/i18n";

export default function ArticlesPage() {
  const { data: articles, isLoading } = useListArticles();
  const { t, pickLocalized } = useI18n();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10 border-b border-border pb-6">
        <div className="flex items-center gap-3 mb-3">
          <Newspaper className="h-7 w-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("articles.title")}</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">{t("articles.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => {
            const title = pickLocalized(a.title, (a as any).titleRu) || a.title;
            return (
              <Link key={a.id} href={`/articles/${a.slug}`} className="block group bg-card border border-border rounded-lg overflow-hidden hover-elevate transition-all">
                {a.coverImage ? (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={a.coverImage}
                      alt={title}
                      width="640"
                      height="360"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wider text-primary font-medium mb-2">
                    {a.countryName ?? t("common.regional")}
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
                    {a.author ? ` · ${a.author}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
          {t("articles.empty")}
        </div>
      )}
    </div>
  );
}
