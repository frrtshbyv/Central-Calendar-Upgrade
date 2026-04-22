import { useMemo, useState } from "react";
import { useListTranslations, useUpsertTranslation, getListTranslationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Search } from "lucide-react";
import { DICTIONARIES } from "@/i18n/dictionaries";

export default function AdminTranslations() {
  const { data: overrides, isLoading } = useListTranslations();
  const upsert = useUpsertTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [newKey, setNewKey] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: getListTranslationsQueryKey() });

  const overrideMap = useMemo(() => {
    const m: Record<string, { en: string; ru: string }> = {};
    overrides?.forEach((o) => { m[o.key] = { en: o.en, ru: o.ru }; });
    return m;
  }, [overrides]);

  const allKeys = useMemo(() => {
    const keys = new Set<string>([
      ...Object.keys(DICTIONARIES),
      ...(overrides?.map((o) => o.key) ?? []),
    ]);
    return Array.from(keys).sort();
  }, [overrides]);

  const filtered = filter
    ? allKeys.filter((k) =>
        k.toLowerCase().includes(filter.toLowerCase()) ||
        (DICTIONARIES[k]?.en ?? "").toLowerCase().includes(filter.toLowerCase()) ||
        (overrideMap[k]?.en ?? "").toLowerCase().includes(filter.toLowerCase())
      )
    : allKeys;

  const save = (key: string, en: string, ru: string) => {
    upsert.mutate(
      { data: { key, en, ru } },
      {
        onSuccess: () => {
          toast({ title: "Saved" });
          invalidate();
        },
        onError: (e: any) => toast({ variant: "destructive", title: "Save failed", description: e?.error }),
      }
    );
  };

  const addNew = () => {
    if (!newKey || !/^[a-zA-Z0-9._-]+$/.test(newKey)) {
      toast({ variant: "destructive", title: "Invalid key", description: "Use letters, digits, dots, underscores, hyphens." });
      return;
    }
    save(newKey, "", "");
    setNewKey("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Translations</h1>
        <p className="text-muted-foreground text-sm">Override the built-in EN/RU labels used across the public site, or add new keys.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Filter by key or text…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Input placeholder="new.key.name" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="md:w-64" />
          <Button onClick={addNew} variant="outline"><Plus className="h-4 w-4 mr-1" />Add Key</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((key) => (
            <Row
              key={key}
              tkey={key}
              defaultEn={overrideMap[key]?.en ?? DICTIONARIES[key]?.en ?? ""}
              defaultRu={overrideMap[key]?.ru ?? DICTIONARIES[key]?.ru ?? ""}
              builtinEn={DICTIONARIES[key]?.en}
              builtinRu={DICTIONARIES[key]?.ru}
              isOverridden={!!overrideMap[key]}
              onSave={(en, ru) => save(key, en, ru)}
              isSaving={upsert.isPending}
            />
          ))}
          {filtered.length === 0 && <div className="text-muted-foreground text-center p-8 border border-dashed rounded">No keys match.</div>}
        </div>
      )}
    </div>
  );
}

function Row({
  tkey,
  defaultEn,
  defaultRu,
  builtinEn,
  builtinRu,
  isOverridden,
  onSave,
  isSaving,
}: {
  tkey: string;
  defaultEn: string;
  defaultRu: string;
  builtinEn?: string;
  builtinRu?: string;
  isOverridden: boolean;
  onSave: (en: string, ru: string) => void;
  isSaving: boolean;
}) {
  const [en, setEn] = useState(defaultEn);
  const [ru, setRu] = useState(defaultRu);
  const dirty = en !== defaultEn || ru !== defaultRu;

  return (
    <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-[220px_1fr_1fr_auto] gap-3 items-start">
      <div>
        <code className="text-xs font-mono break-all">{tkey}</code>
        {isOverridden && <div className="mt-1 text-[10px] uppercase tracking-wider text-primary font-semibold">Custom</div>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">English</Label>
        <Textarea rows={2} value={en} onChange={(e) => setEn(e.target.value)} />
        {builtinEn && builtinEn !== en && <div className="text-[10px] text-muted-foreground truncate">default: {builtinEn}</div>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Russian</Label>
        <Textarea rows={2} value={ru} onChange={(e) => setRu(e.target.value)} />
        {builtinRu && builtinRu !== ru && <div className="text-[10px] text-muted-foreground truncate">default: {builtinRu}</div>}
      </div>
      <Button size="sm" onClick={() => onSave(en, ru)} disabled={!dirty || isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      </Button>
    </div>
  );
}
