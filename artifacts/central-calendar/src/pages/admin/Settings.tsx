import { useEffect, useState } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ImageOff } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const update = useUpdateSiteSettings();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    if (settings) setBannerUrl(settings.homepageBannerUrl ?? "");
  }, [settings]);

  const save = () => {
    update.mutate(
      { data: { homepageBannerUrl: bannerUrl || null } },
      {
        onSuccess: () => {
          toast({ title: "Settings saved" });
          qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Save failed", description: err?.error || "Try again" });
        },
      }
    );
  };

  const clear = () => setBannerUrl("");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground text-sm">Control public-facing branding and homepage banner.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Homepage Banner Image</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Optional background image displayed behind the hero on the homepage. Leave blank to use the default solid background.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Image URL</label>
          <Input
            placeholder="https://example.com/banner.jpg"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {bannerUrl ? (
          <div className="aspect-[3/1] w-full bg-muted rounded-md overflow-hidden border border-border">
            <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[3/1] w-full bg-muted/50 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground gap-2">
            <ImageOff className="h-5 w-5" /> No banner set
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
          {bannerUrl && (
            <Button variant="outline" onClick={clear}>Clear</Button>
          )}
        </div>
      </div>
    </div>
  );
}
