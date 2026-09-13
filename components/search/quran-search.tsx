"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Surah, SearchMatch } from "@/types/quran";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAudio } from "@/components/audio/audio-context";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Play,
  Loader2,
  Sparkles,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  createComboboxItems,
} from "@/components/ui/combobox";

interface QuranSearchProps {
  surahs: Surah[];
}

function normalizeSearch(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآء]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

export function QuranSearch({ surahs }: QuranSearchProps) {
  const t = useTranslations("search");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { playAyah } = useAudio();

  const [query, setQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [searchedQuery, setSearchedQuery] = useState<string>("");

  // Surah Collection for Combobox
  const surahCollection = useMemo(() => {
    const options = [
      {
        value: "all",
        label: t("allSurahs"),
        secondary: "",
      },
      ...surahs.map((s) => ({
        value: String(s.number),
        label: `${s.number}. ${isRtl ? s.name : s.englishName}`,
        secondary: isRtl ? s.englishName : s.name,
      })),
    ];

    return createComboboxItems(options, {
      getValue: (item) => item.value,
      getLabel: (item) => item.label,
    });
  }, [surahs, isRtl, t]);

  const surahFilter = useMemo(() => {
    return (
      item: { value: string; label: string; secondary?: string },
      searchQuery: string
    ) => {
      if (!searchQuery.trim()) return true;
      const q = normalizeSearch(searchQuery);
      const l = normalizeSearch(item.label);
      const s = item.secondary ? normalizeSearch(item.secondary) : "";
      const v = item.value;
      return l.includes(q) || s.includes(q) || v === q;
    };
  }, []);

  // Instant surah matches via useMemo
  const matchingSurahs = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return surahs
      .filter(
        (s) =>
          s.number.toString() === q ||
          s.name.includes(q) ||
          s.englishName.toLowerCase().includes(q) ||
          s.englishNameTranslation.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [query, surahs]);

  // Debounced verse search via API
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const cleanQuery = encodeURIComponent(trimmed);
        const isArabicInput = /[\u0600-\u06FF]/.test(trimmed);
        const searchEdition = isArabicInput ? "quran-simple" : "en.sahih";

        const res = await fetch(
          `https://api.alquran.cloud/v1/search/${cleanQuery}/${selectedSurah}/${searchEdition}`
        );
        const json = await res.json();
        if (json.code === 200 && json.data?.matches) {
          setMatches(json.data.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setMatches([]);
      } finally {
        setIsLoading(false);
        setSearchedQuery(trimmed);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query, selectedSurah]);

  const hasSearched = searchedQuery.length >= 2 && searchedQuery === query.trim();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-arabic font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      {/* Search Bar & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="size-4 absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="ps-11 pe-10 h-13 rounded-full bg-card border-border shadow-xs text-sm sm:text-base"
          />
          {isLoading && (
            <Loader2 className="size-4 absolute end-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          )}
          {!isLoading && query && (
            <button
              onClick={() => {
                setQuery("");
                setMatches([]);
                setSearchedQuery("");
              }}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {common("clear")}
            </button>
          )}
        </div>

        {/* Surah Filter Combobox */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-primary/70" />
            <span className="font-medium">{t("inSurah")}:</span>
          </div>
          <Combobox
            items={surahCollection}
            value={selectedSurah}
            onValueChange={(val) => setSelectedSurah(val || "all")}
            filter={surahFilter}
          >
            <ComboboxInput
              placeholder={t("allSurahs")}
              showClear={selectedSurah !== "all"}
              className="w-48 sm:w-56 h-8 text-xs rounded-lg bg-card border-border shadow-2xs hover:border-primary/40 focus-within:border-primary/60 transition-colors [&_input]:h-7 [&_input]:text-xs"
            />
            <ComboboxContent
              align={isRtl ? "start" : "end"}
              className="w-56 sm:w-64 max-h-64 z-50 p-1"
            >
              <ComboboxList className="max-h-60 overflow-y-auto">
                {(item: { value: string; label: string; secondary?: string }) => (
                  <ComboboxItem
                    key={item.value}
                    value={item.value}
                    className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer"
                  >
                    <span className="font-medium truncate">{item.label}</span>
                    {item.secondary && (
                      <span className="text-[11px] text-muted-foreground ms-2 opacity-70 shrink-0 font-arabic">
                        {item.secondary}
                      </span>
                    )}
                  </ComboboxItem>
                )}
              </ComboboxList>
              <ComboboxEmpty className="py-3 px-2 text-xs text-muted-foreground text-center">
                {t("noResults")}
              </ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      {/* Matching Surahs (Quick Jump) */}
      {matchingSurahs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("surahMatches")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingSurahs.map((surah) => (
              <Link key={surah.number} href={`/quran/${surah.number}`}>
                <Card className="p-3.5 hover:border-primary/50 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-muted-foreground size-7 rounded-md bg-muted/60 flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {isRtl ? surah.name : surah.englishName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {surah.numberOfAyahs} {common("verses")}
                      </p>
                    </div>
                  </div>
                  <span className="font-arabic text-base text-muted-foreground" dir="rtl">
                    {surah.name}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Results Area */}
      <section className="space-y-4">
        {isLoading && matches.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <Loader2 className="size-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">{t("searching")}</p>
          </div>
        )}

        {!isLoading && !hasSearched && query.trim().length === 0 && (
          <div className="text-center py-16 space-y-3 border border-dashed border-border/70 rounded-3xl p-8">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <Sparkles className="size-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground">
              {t("initialPrompt")}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {["الرحمة", "النور", "السلام", "الصبر", "mercy", "peace", "light", "patience"].map(
                (term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="xs"
                    onClick={() => setQuery(term)}
                    className="rounded-full text-xs"
                  >
                    {term}
                  </Button>
                )
              )}
            </div>
          </div>
        )}

        {!isLoading && hasSearched && matches.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              {t("noResults")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              {t("noResultsDesc")}
            </p>
          </div>
        )}

        {!isLoading && matches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
              <span>{t("resultsFound", { count: matches.length })}</span>
            </div>

            {matches.map((match) => (
              <Card
                key={`${match.surah.number}:${match.numberInSurah}`}
                className="p-5 hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {isRtl ? match.surah.name : match.surah.englishName} • {match.surah.number}:{match.numberInSurah}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        playAyah(match.surah, match.numberInSurah)
                      }
                      title="Play Ayah"
                      className="rounded-full"
                    >
                      <Play className="size-3.5 fill-current" />
                    </Button>
                    <Link
                      href={`/quran/${match.surah.number}`}
                      className="text-primary font-medium text-xs inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{t("goToAyah")}</span>
                      {isRtl ? <ArrowLeft className="size-3" /> : <ArrowRight className="size-3" />}
                    </Link>
                  </div>
                </div>

                <div
                  dir={/[\u0600-\u06FF]/.test(match.text) ? "rtl" : "ltr"}
                  className="text-start"
                >
                  <p className="font-quran text-base sm:text-lg leading-relaxed text-foreground">
                    {match.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
