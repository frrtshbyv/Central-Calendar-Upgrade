import { Link, useParams } from "wouter";
import { useGetArticleBySlug } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: article, isLoading, isError } = useGetArticleBySlug(slug);

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
        <h1 className="text-2xl font-bold mb-3">Article not found</h1>
        <Link href="/articles" className="text-primary hover:underline">← Back to Articles</Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Articles
      </Link>

      <div className="text-xs uppercase tracking-wider text-primary font-medium mb-3">
        {article.countryName ?? "Regional"}
      </div>
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-serif">{article.title}</h1>
      <div className="text-sm text-muted-foreground mb-8 flex items-center gap-3 flex-wrap">
        {article.author && <span>By {article.author}</span>}
        {article.publishedAt && (
          <>
            <span>·</span>
            <time>{new Date(article.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</time>
          </>
        )}
        {article.tags.length > 0 && (
          <>
            <span>·</span>
            <span className="flex flex-wrap gap-1">
              {article.tags.map((t) => (
                <span key={t.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">#{t.name}</span>
              ))}
            </span>
          </>
        )}
      </div>

      {article.coverImage && (
        <img src={article.coverImage} alt={article.title} className="w-full aspect-video object-cover rounded-lg mb-8" />
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
        {article.content}
      </div>
    </article>
  );
}
