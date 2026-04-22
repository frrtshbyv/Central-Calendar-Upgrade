import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useListTranslations } from "@workspace/api-client-react";
import { DICTIONARIES, type Lang } from "./dictionaries";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
  pickLocalized: (en: string | null | undefined, ru: string | null | undefined) => string;
};

const I18nContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "cc.lang";

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "ru" || stored === "en") return stored;
  if (typeof navigator !== "undefined" && /^ru/i.test(navigator.language || "")) return "ru";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readInitialLang());
  const { data: overrides } = useListTranslations();

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, lang);
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const overrideMap = useMemo(() => {
    const m: Record<string, { en: string; ru: string }> = {};
    overrides?.forEach((o) => { m[o.key] = { en: o.en, ru: o.ru }; });
    return m;
  }, [overrides]);

  const t = useCallback((key: string, fallback?: string) => {
    const fromDb = overrideMap[key];
    if (fromDb) {
      const v = fromDb[lang];
      if (v && v.length > 0) return v;
    }
    const local = DICTIONARIES[key];
    if (local) {
      const v = local[lang];
      if (v && v.length > 0) return v;
      // fallback to English if Russian missing
      if (local.en) return local.en;
    }
    return fallback ?? key;
  }, [lang, overrideMap]);

  const pickLocalized = useCallback((en: string | null | undefined, ru: string | null | undefined) => {
    if (lang === "ru" && ru && ru.trim().length > 0) return ru;
    return en ?? "";
  }, [lang]);

  const value = useMemo<Ctx>(() => ({ lang, setLang: setLangState, t, pickLocalized }), [lang, t, pickLocalized]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(I18nContext);
  if (!v) throw new Error("useI18n must be used inside I18nProvider");
  return v;
}

export function useT() {
  return useI18n().t;
}
