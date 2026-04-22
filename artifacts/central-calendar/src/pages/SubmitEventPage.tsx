import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitEvent, useListCountries, useListTags } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";

export default function SubmitEventPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);

  const schema = z.object({
    title: z.string().min(3, t("submit.validation.title")),
    description: z.string().min(20, t("submit.validation.description")),
    countryId: z.coerce.number().min(1, t("submit.validation.country")),
    startDate: z.string().min(1, t("submit.validation.startDate")),
    endDate: z.string().optional().or(z.literal("")),
    location: z.string().min(2, t("submit.validation.location")),
    organizerLink: z.string().url(t("submit.validation.url")).optional().or(z.literal("")),
    contactEmail: z.string().email(t("submit.validation.email")),
    previewImage: z.string().url(t("submit.validation.url")).optional().or(z.literal("")),
    eventFormat: z.enum(["offline", "online", "hybrid"]),
    tagIds: z.array(z.number()),
  });
  const { data: countries } = useListCountries();
  const { data: tags } = useListTags();
  const submit = useSubmitEvent();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", description: "", countryId: 0, startDate: "", endDate: "",
      location: "", organizerLink: "", contactEmail: "", previewImage: "",
      eventFormat: "offline", tagIds: [],
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    submit.mutate(
      {
        data: {
          ...values,
          previewImage: values.previewImage || null,
          organizerLink: values.organizerLink || null,
          endDate: values.endDate || null,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: t("submit.failed"), description: err?.error || t("submit.failed.body") });
        },
      }
    );
  };

  const toggleTag = (id: number) => {
    const cur = form.getValues("tagIds");
    form.setValue("tagIds", cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id]);
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">{t("submit.received.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("submit.received.body")}</p>
        <Button onClick={() => setSubmitted(false)}>{t("submit.another")}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t("submit.title")}</h1>
        <p className="text-muted-foreground">{t("submit.subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("submit.field.title")}</FormLabel>
                <FormControl><Input placeholder={t("submit.placeholder.title")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("submit.field.description")}</FormLabel>
                <FormControl><Textarea placeholder={t("submit.placeholder.description")} className="min-h-32" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="countryId" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("submit.field.country")}</FormLabel>
                <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value ? String(field.value) : ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t("submit.field.country.placeholder")} /></SelectTrigger></FormControl>
                  <SelectContent>
                    {countries?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="eventFormat" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("submit.field.format")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="offline">{t("filter.format.offline")}</SelectItem>
                    <SelectItem value="online">{t("filter.format.online")}</SelectItem>
                    <SelectItem value="hybrid">{t("filter.format.hybrid")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("submit.field.location")}</FormLabel>
                <FormControl><Input placeholder={t("submit.field.location.placeholder")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("submit.field.startDate")}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("submit.field.endDate")}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("submit.field.contactEmail")}</FormLabel>
                <FormControl><Input type="email" placeholder={t("submit.placeholder.email")} {...field} /></FormControl>
                <FormDescription>{t("submit.field.contactEmail.help")}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="organizerLink" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("submit.field.organizerLink")}</FormLabel>
                <FormControl><Input placeholder={t("submit.placeholder.url")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previewImage" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("submit.field.coverImage")}</FormLabel>
                <FormControl><Input placeholder={t("submit.placeholder.url")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">{t("submit.field.tags")}</label>
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
            <Button type="submit" disabled={submit.isPending} size="lg">
              {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {t("submit.button")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
