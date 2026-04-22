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

const schema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(20, "Please provide at least a short description"),
  countryId: z.coerce.number().min(1, "Country required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().optional().or(z.literal("")),
  location: z.string().min(2, "Location required"),
  organizerLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Valid email required"),
  previewImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  eventFormat: z.enum(["offline", "online", "hybrid"]),
  tagIds: z.array(z.number()),
});

export default function SubmitEventPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
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
          toast({ variant: "destructive", title: "Submission failed", description: err?.error || "Please try again." });
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
        <h1 className="text-3xl font-bold mb-3">Submission received</h1>
        <p className="text-muted-foreground mb-8">
          Thank you. Your event is queued for editorial review. We'll publish it on Central Calendar once verified.
        </p>
        <Button onClick={() => setSubmitted(false)}>Submit another event</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Submit an Event</h1>
        <p className="text-muted-foreground">
          Help shape the regional calendar. Submissions are reviewed by our editors before publication.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Event title *</FormLabel>
                <FormControl><Input placeholder="e.g. Tashkent Energy Forum 2026" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description *</FormLabel>
                <FormControl><Textarea placeholder="What is the event about? Who is it for?" className="min-h-32" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="countryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value ? String(field.value) : ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {countries?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="eventFormat" render={({ field }) => (
              <FormItem>
                <FormLabel>Format *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="offline">In-person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl><Input placeholder="City, venue (or 'Online')" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Start date *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem>
                <FormLabel>End date (optional)</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact email *</FormLabel>
                <FormControl><Input type="email" placeholder="you@organization.com" {...field} /></FormControl>
                <FormDescription>Used by editors to verify and follow up. Not published.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="organizerLink" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Official website</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previewImage" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Cover image URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Topics (tags)</label>
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
              Submit for review
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
