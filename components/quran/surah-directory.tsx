"use client";

import React, { useState, useMemo } from "react";
import { Surah } from "@/types/quran";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAudio } from "@/components/audio/audio-context";
import { Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SurahCard } from "@/components/quran/surah-card";

interface SurahDirectoryProps {
  surahs: Surah[];
}

export function SurahDirectory({ surahs }: SurahDirectoryProps) {
  const t = useTranslations("quran");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { playSurah, currentSurah, isPlaying } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Meccan" | "Medinan">(
    "all"
  );

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      // Type filter
      if (filterType !== "all" && surah.revelationType !== filterType) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const numMatch = surah.number.toString() === q;
      const arabicMatch = surah.name.includes(q);
      const englishMatch = surah.englishName.toLowerCase().includes(q);
      const translationMatch = surah.englishNameTranslation
        .toLowerCase()
        .includes(q);

      return numMatch || arabicMatch || englishMatch || translationMatch;
    });
  }, [surahs, searchQuery, filterType]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-10 h-11 rounded-full bg-card border-border shadow-xs text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {common("clear")}
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-muted/60 border border-border shrink-0 self-center">
          <Button
            type="button"
            variant={filterType === "all" ? "default" : "ghost"}
            size="xs"
            onClick={() => setFilterType("all")}
            className="rounded-full text-xs"
          >
            {t("filterAll")}
          </Button>
          <Button
            type="button"
            variant={filterType === "Meccan" ? "default" : "ghost"}
            size="xs"
            onClick={() => setFilterType("Meccan")}
            className="rounded-full text-xs"
          >
            {t("filterMeccan")}
          </Button>
          <Button
            type="button"
            variant={filterType === "Medinan" ? "default" : "ghost"}
            size="xs"
            onClick={() => setFilterType("Medinan")}
            className="rounded-full text-xs"
          >
            {t("filterMedinan")}
          </Button>
        </div>
      </div>

      {/* Results Count & Surah Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="size-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            {t("noSurahsFound")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setFilterType("all");
            }}
          >
            {common("retry")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <SurahCard
              key={surah.number}
              surah={surah}
              isPlaying={currentSurah?.number === surah.number && isPlaying}
              onPlay={() => playSurah(surah)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
