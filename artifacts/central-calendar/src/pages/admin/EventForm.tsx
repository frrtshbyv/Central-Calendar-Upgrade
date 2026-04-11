import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateEvent, 
  useUpdateEvent, 
  useAdminListEvents, 
  useListCountries, 
  useListTags,
  getAdminListEventsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description required"),
  previewImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  organizerLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
  countryId: z.coerce.number().min(1, "Country is required"),
  tagIds: z.array(z.number()),
});

export default function AdminEventForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = !!params.id;
  const eventId = isEditing ? parseInt(params.id!) : undefined;

  const { data: countries } = useListCountries();
  const { data: tags } = useListTags();
  const { data: allEvents, isLoading: isLoadingEvent } = useAdminListEvents({}, { query: { enabled: isEditing }});
  
  const existingEvent = isEditing ? allEvents?.find(e => e.id === eventId) : null;

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      previewImage: "",
      location: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      organizerLink: "",
      status: "draft",
      featured: false,
      countryId: 0,
      tagIds: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingEvent) {
      form.reset({
        title: existingEvent.title,
        slug: existingEvent.slug,
        description: existingEvent.description,
        previewImage: existingEvent.previewImage || "",
        location: existingEvent.location,
        startDate: existingEvent.startDate.split('T')[0], // Extract YYYY-MM-DD
        endDate: existingEvent.endDate ? existingEvent.endDate.split('T')[0] : "",
        organizerLink: existingEvent.organizerLink || "",
        status: existingEvent.status as any,
        featured: existingEvent.featured,
        countryId: existingEvent.countryId,
        tagIds: existingEvent.tags.map(t => t.id),
      });
    }
  }, [isEditing, existingEvent, form]);

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEditing && watchTitle) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchTitle, isEditing, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Format payload
    const payload = {
      ...values,
      previewImage: values.previewImage || null,
      endDate: values.endDate || null,
      organizerLink: values.organizerLink || null,
    };

    if (isEditing && eventId) {
      updateMutation.mutate(
        { id: eventId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Event updated successfully" });
            queryClient.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });
            setLocation("/control-room-7f92x/events");
          },
          onError: (err) => {
            toast({ variant: "destructive", title: "Update failed", description: err?.error || "Unknown error" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Event created successfully" });
            queryClient.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });
            setLocation("/control-room-7f92x/events");
          },
          onError: (err) => {
            toast({ variant: "destructive", title: "Creation failed", description: err?.error || "Unknown error" });
          }
        }
      );
    }
  };

  const toggleTag = (tagId: number) => {
    const currentTags = form.getValues("tagIds");
    if (currentTags.includes(tagId)) {
      form.setValue("tagIds", currentTags.filter(id => id !== tagId), { shouldValidate: true });
    } else {
      form.setValue("tagIds", [...currentTags, tagId], { shouldValidate: true });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingEvent) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/control-room-7f92x/events"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Event' : 'Create Event'}</h1>
          <p className="text-muted-foreground text-sm">{isEditing ? existingEvent?.title : 'Add a new summit to the registry'}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Core Information</h2>
            </div>

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Event Title</FormLabel>
                <FormControl><Input placeholder="e.g. Central Asia Investment Forum 2025" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl><Input placeholder="central-asia-investment-forum" {...field} /></FormControl>
                <FormDescription>Must be unique. Auto-generated from title.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="published">Published (Visible)</SelectItem>
                    <SelectItem value="archived">Archived (Hidden from main feeds)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Detailed information about the event..." className="min-h-32" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Logistics</h2>
            </div>

            <FormField control={form.control} name="countryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Host Nation</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(parseInt(val))} 
                  defaultValue={field.value ? field.value.toString() : ""} 
                  value={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>City / Venue</FormLabel>
                <FormControl><Input placeholder="e.g. Tashkent, Congress Hall" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem>
                <FormLabel>End Date (Optional)</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Media & Taxonomy</h2>
            </div>

            <FormField control={form.control} name="previewImage" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Preview Image URL</FormLabel>
                <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                <FormDescription>Leave blank to use a dynamic placeholder.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="organizerLink" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Official Website URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormDescription>Where users should go to register or learn more.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="md:col-span-2 space-y-4">
              <FormLabel>Sectors (Tags)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {tags?.map(tag => {
                  const isSelected = form.watch("tagIds").includes(tag.id);
                  return (
                    <Badge 
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Event</FormLabel>
                  <FormDescription>
                    Featured events appear on the homepage hero section.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          </div>

          <div className="flex justify-end gap-4 sticky bottom-0 bg-background/80 backdrop-blur p-4 -mx-4 border-t border-border mt-8">
            <Button variant="outline" type="button" asChild>
              <Link href="/control-room-7f92x/events">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
