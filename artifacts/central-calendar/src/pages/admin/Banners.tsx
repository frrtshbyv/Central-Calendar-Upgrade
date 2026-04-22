import { useState } from "react";
import {
  useAdminListBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  getAdminListBannersQueryKey, getListBannersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2, ArrowUp, ArrowDown, ImageOff } from "lucide-react";

type FormState = {
  imageUrl: string;
  title: string;
  titleRu: string;
  subtitle: string;
  subtitleRu: string;
  linkUrl: string;
  isActive: boolean;
};

const empty: FormState = {
  imageUrl: "",
  title: "",
  titleRu: "",
  subtitle: "",
  subtitleRu: "",
  linkUrl: "",
  isActive: true,
};

export default function AdminBanners() {
  const { data: banners, isLoading } = useAdminListBanners();
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const remove = useDeleteBanner();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [draft, setDraft] = useState<FormState>(empty);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
    qc.invalidateQueries({ queryKey: getListBannersQueryKey() });
  };

  const submitNew = () => {
    if (!draft.imageUrl) {
      toast({ variant: "destructive", title: "Image URL required" });
      return;
    }
    create.mutate(
      {
        data: {
          imageUrl: draft.imageUrl,
          title: draft.title || null,
          titleRu: draft.titleRu || null,
          subtitle: draft.subtitle || null,
          subtitleRu: draft.subtitleRu || null,
          linkUrl: draft.linkUrl || null,
          isActive: draft.isActive,
          sortOrder: (banners?.length ?? 0) + 1,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Banner added" });
          setDraft(empty);
          invalidate();
        },
        onError: (e: any) => toast({ variant: "destructive", title: "Failed", description: e?.error }),
      }
    );
  };

  const updateBanner = (id: number, data: any) => {
    update.mutate(
      { id, data },
      { onSuccess: invalidate, onError: (e: any) => toast({ variant: "destructive", title: "Update failed", description: e?.error }) }
    );
  };

  const move = (idx: number, dir: -1 | 1) => {
    if (!banners) return;
    const a = banners[idx];
    const b = banners[idx + dir];
    if (!a || !b) return;
    update.mutate({ id: a.id, data: { sortOrder: b.sortOrder } }, { onSuccess: invalidate });
    update.mutate({ id: b.id, data: { sortOrder: a.sortOrder } }, { onSuccess: invalidate });
  };

  const del = (id: number) => {
    if (!confirm("Delete this banner?")) return;
    remove.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Banner deleted" });
          invalidate();
        },
        onError: (e: any) => toast({ variant: "destructive", title: "Delete failed", description: e?.error }),
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Hero Banners</h1>
        <p className="text-muted-foreground text-sm">Manage homepage hero slider. Add multiple banners with optional bilingual captions and external links.</p>
      </div>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Add new banner</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Image URL *</Label>
            <Input value={draft.imageUrl} onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>Title (EN)</Label>
            <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Title (RU)</Label>
            <Input value={draft.titleRu} onChange={(e) => setDraft((d) => ({ ...d, titleRu: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle (EN)</Label>
            <Input value={draft.subtitle} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle (RU)</Label>
            <Input value={draft.subtitleRu} onChange={(e) => setDraft((d) => ({ ...d, subtitleRu: e.target.value }))} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Link URL (optional)</Label>
            <Input value={draft.linkUrl} onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))} placeholder="/calendar or https://..." />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={draft.isActive} onCheckedChange={(v) => setDraft((d) => ({ ...d, isActive: v }))} />
            <Label>Active</Label>
          </div>
        </div>
        <Button onClick={submitNew} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Banner
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Existing banners {banners ? `(${banners.length})` : ""}</h2>
        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : !banners || banners.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <ImageOff className="h-6 w-6" />
            No banners yet. Add the first one above.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {banners.map((b, idx) => (
              <BannerRow
                key={b.id}
                banner={b}
                onSave={(data) => updateBanner(b.id, data)}
                onDelete={() => del(b.id)}
                onMoveUp={idx > 0 ? () => move(idx, -1) : undefined}
                onMoveDown={idx < banners.length - 1 ? () => move(idx, 1) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BannerRow({
  banner,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  banner: any;
  onSave: (data: any) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [edit, setEdit] = useState({
    imageUrl: banner.imageUrl as string,
    title: (banner.title ?? "") as string,
    titleRu: (banner.titleRu ?? "") as string,
    subtitle: (banner.subtitle ?? "") as string,
    subtitleRu: (banner.subtitleRu ?? "") as string,
    linkUrl: (banner.linkUrl ?? "") as string,
    isActive: banner.isActive as boolean,
  });

  const save = () =>
    onSave({
      imageUrl: edit.imageUrl,
      title: edit.title || null,
      titleRu: edit.titleRu || null,
      subtitle: edit.subtitle || null,
      subtitleRu: edit.subtitleRu || null,
      linkUrl: edit.linkUrl || null,
      isActive: edit.isActive,
    });

  return (
    <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-4 items-start">
      <div className="aspect-[3/2] bg-muted rounded overflow-hidden border border-border">
        {edit.imageUrl ? (
          <img src={edit.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageOff className="h-5 w-5" /></div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input placeholder="Image URL" value={edit.imageUrl} onChange={(e) => setEdit((s) => ({ ...s, imageUrl: e.target.value }))} className="md:col-span-2" />
        <Input placeholder="Title EN" value={edit.title} onChange={(e) => setEdit((s) => ({ ...s, title: e.target.value }))} />
        <Input placeholder="Title RU" value={edit.titleRu} onChange={(e) => setEdit((s) => ({ ...s, titleRu: e.target.value }))} />
        <Input placeholder="Subtitle EN" value={edit.subtitle} onChange={(e) => setEdit((s) => ({ ...s, subtitle: e.target.value }))} />
        <Input placeholder="Subtitle RU" value={edit.subtitleRu} onChange={(e) => setEdit((s) => ({ ...s, subtitleRu: e.target.value }))} />
        <Input placeholder="Link URL" value={edit.linkUrl} onChange={(e) => setEdit((s) => ({ ...s, linkUrl: e.target.value }))} className="md:col-span-2" />
        <div className="flex items-center gap-2">
          <Switch checked={edit.isActive} onCheckedChange={(v) => setEdit((s) => ({ ...s, isActive: v }))} />
          <span className="text-sm text-muted-foreground">{edit.isActive ? "Active" : "Hidden"}</span>
        </div>
      </div>
      <div className="flex md:flex-col gap-2 md:items-end">
        <Button size="sm" onClick={save}><Save className="h-4 w-4 mr-1" />Save</Button>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={onMoveUp} disabled={!onMoveUp} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" onClick={onMoveDown} disabled={!onMoveDown} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
        </div>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
      </div>
    </div>
  );
}
