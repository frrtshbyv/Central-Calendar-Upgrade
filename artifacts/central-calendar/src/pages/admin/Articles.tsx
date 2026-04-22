import { Link } from "wouter";
import { useAdminListArticles, useDeleteArticle, getAdminListArticlesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, Newspaper } from "lucide-react";

export default function AdminArticles() {
  const { data: articles, isLoading } = useAdminListArticles();
  const del = useDeleteArticle();
  const { toast } = useToast();
  const qc = useQueryClient();

  const onDelete = (id: number, title: string) => {
    if (!confirm(`Delete article "${title}"? This cannot be undone.`)) return;
    del.mutate({ id }, {
      onSuccess: () => {
        toast({ title: `Deleted: ${title}` });
        qc.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Delete failed", description: err?.error }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
            <p className="text-muted-foreground text-sm">Editorial coverage and analysis.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/control-room-7f92x/articles/new"><PlusCircle className="h-4 w-4 mr-2" /> New Article</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : !articles || articles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
          No articles yet. Create one to get started.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {articles.map((a, i) => (
            <div key={a.id} className={`p-4 flex items-center gap-4 ${i > 0 ? "border-t border-border" : ""}`}>
              {a.coverImage ? (
                <img src={a.coverImage} alt="" className="h-14 w-20 object-cover rounded shrink-0" />
              ) : (
                <div className="h-14 w-20 bg-muted rounded shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={a.status === "published" ? "default" : "outline"}>{a.status}</Badge>
                  {a.countryName && <Badge variant="secondary">{a.countryName}</Badge>}
                </div>
                <h3 className="font-semibold truncate">{a.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {a.author ?? "Unknown author"} · {new Date(a.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/control-room-7f92x/articles/edit/${a.id}`}><Pencil className="h-4 w-4" /></Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(a.id, a.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
