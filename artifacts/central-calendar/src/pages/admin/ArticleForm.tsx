import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateArticle,
  useUpdateArticle,
  useAdminListArticles,
  useListCountries,
  useListTags,
  getAdminListArticlesQueryKey,
  getAdminListArticlesQueryKey as _adminArticlesKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";

function slugify(s: string) {
  const base = s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  return base.length >= 3 ? base : `article-${Date.now()}`;
}

const schema = z.object({
  title: z.string().min(3),
  titleRu: z.string().optional().or(z.literal("")),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  coverImage: z.string().url().optional().or(z.literal("")),
  content: z.string().min(20),
  contentRu: z.string().optional().or(z.literal("")),
  countryId: z.coerce.number().optional(),
  author: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  tagIds: z.array(z.number()),
});

export default function AdminArticleForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEditing = !!params.id;
  const articleId = isEditing ? parseInt(params.id!) : undefined;

  const { data: countries } = useListCountries();
  const { data: tags } = useListTags();
  const { data: allArticles, isLoading } = useAdminListArticles({ query: { enabled: isEditing, queryKey: getAdminListArticlesQueryKey() } });
  const existing = isEditing ? allArticles?.find((a) => a.id === articleId) : null;

  const create = useCreateArticle();
  const update = useUpdateArticle();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", titleRu: "", slug: "", coverImage: "", content: "", contentRu: "",
      countryId: undefined, author: "", status: "draft", tagIds: [],
    },
  });

  useEffect(() => {
    if (isEditing && existing) {
      form.reset({
        title: existing.title,
        titleRu: (existing as any).titleRu ?? "",
        slug: existing.slug,
        coverImage: existing.coverImage ?? "",
        content: existing.content,
        contentRu: (existing as any).contentRu ?? "",
        countryId: existing.countryId ?? undefined,
        author: existing.author ?? "",
        status: (existing.status as any) ?? "draft",
        tagIds: existing.tags.map((t) => t.id),
      });
    }
  }, [isEditing, existing, form]);

  const watchTitle = form.watch("title");
  const watchSlug = form.watch("slug");
  const slugManualRef = useRef(false);
  const lastAutoRef = useRef("");

  useEffect(() => {
    if (isEditing) return;
    if (watchSlug === "") slugManualRef.current = false;
    else if (watchSlug !== lastAutoRef.current) slugManualRef.current = true;
  }, [watchSlug, isEditing]);

  useEffect(() => {
    if (isEditing || slugManualRef.current || !watchTitle) return;
    const s = slugify(watchTitle);
    lastAutoRef.current = s;
    form.setValue("slug", s, { shouldValidate: true });
  }, [watchTitle, isEditing, form]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    const payload = {
      ...values,
      titleRu: values.titleRu || null,
      contentRu: values.contentRu || null,
      coverImage: values.coverImage || null,
      author: values.author || null,
      countryId: values.countryId ? values.countryId : null,
    };
    if (isEditing && articleId) {
      update.mutate({ id: articleId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Article updated" });
          qc.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
          setLocation("/control-room-7f92x/articles");
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Update failed", description: err?.error }),
      });
    } else {
      create.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Article created" });
          qc.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
          setLocation("/control-room-7f92x/articles");
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Create failed", description: err?.error }),
      });
    }
  };

  const toggleTag = (id: number) => {
    const cur = form.getValues("tagIds");
    form.setValue("tagIds", cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id], { shouldValidate: true });
  };

  const isPending = create.isPending || update.isPending;
  if (isEditing && isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/control-room-7f92x/articles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Edit Article" : "Create Article"}</h1>
          <p className="text-muted-foreground text-sm">{isEditing ? existing?.title : "Add a new editorial piece"}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Tabs defaultValue="en" className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Label>Title</Label>
                  <TabsList className="h-8">
                    <TabsTrigger value="en" className="text-xs h-6 px-3">EN</TabsTrigger>
                    <TabsTrigger value="ru" className="text-xs h-6 px-3">RU</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="en" className="mt-0">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="ru" className="mt-0">
                  <FormField control={form.control} name="titleRu" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Заголовок (необязательно)" {...field} /></FormControl>
                      <FormDescription>Optional — falls back to English when empty.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
              </Tabs>
            </div>
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormDescription>Auto-generated. Lowercase letters, numbers, hyphens.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="author" render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl><Input placeholder="e.g. Editorial Team" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="countryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Country (optional)</FormLabel>
                <Select onValueChange={(v) => field.onChange(v === "_none" ? undefined : parseInt(v))} value={field.value ? String(field.value) : "_none"}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="_none">— Regional / None —</SelectItem>
                    {countries?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="coverImage" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Cover image URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="md:col-span-2">
              <Tabs defaultValue="en" className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Label>Content</Label>
                  <TabsList className="h-8">
                    <TabsTrigger value="en" className="text-xs h-6 px-3">EN</TabsTrigger>
                    <TabsTrigger value="ru" className="text-xs h-6 px-3">RU</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="en" className="mt-0">
                  <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea className="min-h-[300px] font-mono text-sm" {...field} /></FormControl>
                      <FormDescription>Plain text. Line breaks preserved.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="ru" className="mt-0">
                  <FormField control={form.control} name="contentRu" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea className="min-h-[300px] font-mono text-sm" placeholder="Текст статьи (необязательно)" {...field} /></FormControl>
                      <FormDescription>Optional Russian translation.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
              </Tabs>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => {
                  const active = form.watch("tagIds").includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={active ? "default" : "outline"}
                      className={`cursor-pointer ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild type="button"><Link href="/control-room-7f92x/articles">Cancel</Link></Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Article"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
