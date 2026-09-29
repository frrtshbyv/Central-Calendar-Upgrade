import { Link, useParams } from "wouter";
import { useGetArticleBySlug } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n";

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: article, isLoading, isError } = useGetArticleBySlug(slug);
  const { t, lang, pickLocalized } = useI18n();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-72 w-full mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">{t("articles.notFound")}</h1>
        <Link href="/articles" className="text-primary hover:underline">← {t("articles.back")}</Link>
      </div>
    );
  }

  const title = pickLocalized(article.title, (article as any).titleRu) || article.title;
  const content = pickLocalized(article.content, (article as any).contentRu) || article.content;

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> {t("articles.back")}
      </Link>

      <div className="text-xs uppercase tracking-wider text-primary font-medium mb-3">
        {article.countryName ?? t("common.regional")}
      </div>
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-serif">{title}</h1>
      <div className="text-sm text-muted-foreground mb-8 flex items-center gap-3 flex-wrap">
        {article.author && <span>{t("articles.by").replace("{author}", article.author)}</span>}
        {article.publishedAt && (
          <>
            <span>·</span>
            <time>{new Date(article.publishedAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
          </>
        )}
        {article.tags.length > 0 && (
          <>
            <span>·</span>
            <span className="flex flex-wrap gap-1">
              {article.tags.map((tg) => (
                <span key={tg.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">#{tg.name}</span>
              ))}
            </span>
          </>
        )}
      </div>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={title}
          width="1200"
          height="675"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full aspect-video object-cover rounded-lg mb-8"
        />
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
        {content}
      </div>
    </article>
  );
}
