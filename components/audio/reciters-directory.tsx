"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Riwayah, Mp3Reciter, getSurahAudioUrl } from "@/lib/api/mp3quran";
import { Surah } from "@/types/quran";
import { useAudio } from "@/components/audio/audio-context";
import { SheikhAvatar } from "@/components/audio/sheikh-avatar";
import { getReciterProfile, CURATED_RECITER_IDS } from "@/lib/data/reciters";
import { ReciterCard } from "@/components/audio/reciter-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

interface RecitersDirectoryProps {
  riwayat: Riwayah[];
  reciters: Mp3Reciter[];
  surahs: Surah[];
}

// The core, authentic and essential recitation categories
interface RecitationFilter {
  key: string;
  labelKey: string;
  riwayaIds: number[];
}

const IMPORTANT_CATEGORIES: RecitationFilter[] = [
  { key: "all", labelKey: "filterAll", riwayaIds: [] },
  { key: "hafs", labelKey: "riwayahHafs", riwayaIds: [1] },
  { key: "mujawwad", labelKey: "riwayahMujawwad", riwayaIds: [22] },
  { key: "warsh", labelKey: "riwayahWarsh", riwayaIds: [2, 18, 10] },
  { key: "qalun", labelKey: "riwayahQalun", riwayaIds: [5, 8] },
  { key: "muallim", labelKey: "riwayahMuallim", riwayaIds: [21] },
];

export function RecitersDirectory({
  riwayat,
  reciters,
  surahs,
}: RecitersDirectoryProps) {
  const t = useTranslations("recitations");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const {
    currentSurah,
    currentReciterName,
    isPlaying,
    playDirectSurah,
    togglePlayPause,
  } = useAudio();

  const [activeCategoryKey, setActiveCategoryKey] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFullQuranOnly, setShowFullQuranOnly] = useState<boolean>(false);
  const [curatedOnly, setCuratedOnly] = useState<boolean>(true);

  // Active filter definition
  const activeCategory = useMemo(() => {
    return (
      IMPORTANT_CATEGORIES.find((c) => c.key === activeCategoryKey) ||
      IMPORTANT_CATEGORIES[0]
    );
  }, [activeCategoryKey]);

  // Filter reciters according to active category, search, full quran, and curated filter
  const filteredReciters = useMemo(() => {
    let list = reciters;

    // Filter by canonical category
    if (activeCategory.riwayaIds.length > 0) {
      list = list.filter((r) =>
        r.moshaf.some((m) =>
          activeCategory.riwayaIds.includes(m.rewaya_id ?? -1)
        )
      );
    }

    // Filter by complete 114 surahs
    if (showFullQuranOnly) {
      list = list.filter((r) => {
        const m =
          activeCategory.riwayaIds.length > 0
            ? r.moshaf.find((item) =>
              activeCategory.riwayaIds.includes(item.rewaya_id ?? -1)
            ) || r.moshaf[0]
            : r.moshaf[0];
        return m && m.surah_total >= 114;
      });
    }

    // Filter by search query (Arabic or English) if entered
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        if (r.name.toLowerCase().includes(q)) return true;
        const profile = getReciterProfile(r.id);
        if (profile) {
          if (profile.nameArabic.toLowerCase().includes(q)) return true;
          if (profile.nameEnglish.toLowerCase().includes(q)) return true;
          if (profile.aliases?.some((a) => a && a.toLowerCase().includes(q)))
            return true;
        }
        return false;
      });
    } else if (curatedOnly) {
      // Default: Display ONLY the prominent, important recitations
      const curatedSet = new Set(CURATED_RECITER_IDS);
      list = list.filter((r) => curatedSet.has(r.id));
    }

    // Sort: Always prioritize the prestigious order of CURATED_RECITER_IDS
    return list.slice().sort((a, b) => {
      const idxA = CURATED_RECITER_IDS.indexOf(a.id);
      const idxB = CURATED_RECITER_IDS.indexOf(b.id);
      const valA = idxA === -1 ? 999 : idxA;
      const valB = idxB === -1 ? 999 : idxB;
      if (valA !== valB) return valA - valB;
      return a.name.localeCompare(b.name, isRtl ? "ar" : "en");
    });
  }, [reciters, activeCategory, showFullQuranOnly, searchQuery, curatedOnly, isRtl]);

  // Handle Quick Play for a reciter: plays Surah Al-Fatihah
  const handleQuickPlay = (
    e: React.MouseEvent,
    reciter: Mp3Reciter,
    moshafServer: string,
    riwayaTitle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!moshafServer) return;

    const fatihahSurah = surahs[0] || {
      number: 1,
      name: "سورة الفاتحة",
      englishName: "Al-Faatiha",
      englishNameTranslation: "The Opening",
      numberOfAyahs: 7,
      revelationType: "Meccan",
    };

    const isThisPlaying =
      currentSurah?.number === 1 &&
      currentReciterName === reciter.name &&
      isPlaying;

    if (isThisPlaying) {
      togglePlayPause();
    } else {
      const audioUrl = getSurahAudioUrl(moshafServer, 1);
      playDirectSurah(
        fatihahSurah,
        audioUrl,
        reciter.name,
        riwayaTitle,
        reciter.imageUrl
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header - Identical clean style as Surahs and Juz pages */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className={`text-3xl sm:text-4xl font-bold text-foreground ${isRtl ? "font-arabic" : "font-sans"}`}>
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </header>

      {/* Search & Filter Toolbar - Identical style as Surahs Directory */}
      <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
        {/* Search Bar & Toggles */}
        <div className="flex items-center gap-2.5 w-full">
          <div className="relative flex-1">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchReciter")}
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

          <Button
            type="button"
            variant={curatedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setCuratedOnly((p) => !p)}
            className="rounded-full h-11 px-3.5 sm:px-4 text-xs shrink-0 gap-1.5 cursor-pointer shadow-xs"
            title={curatedOnly ? t("curatedOnly") : t("allRecitersArchive")}
          >
            <Sparkles className="size-3.5" />
            <span>{curatedOnly ? t("curatedOnly") : t("allRecitersArchive")}</span>
          </Button>

          <Button
            type="button"
            variant={showFullQuranOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFullQuranOnly((p) => !p)}
            className="rounded-full h-11 px-3.5 sm:px-4 text-xs shrink-0 gap-1.5 cursor-pointer shadow-xs"
            title={isRtl ? "عرض المصحف كاملاً فقط" : "Show full Quran only"}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">{t("fullQuran")}</span>
          </Button>
        </div>

        {/* Essential Recitation Categories Only (Segmented Capsule) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl sm:rounded-full bg-muted/60 border border-border">
          {IMPORTANT_CATEGORIES.map((cat) => {
            const isActive = activeCategoryKey === cat.key;
            return (
              <Button
                key={cat.key}
                type="button"
                variant={isActive ? "default" : "ghost"}
                size="xs"
                onClick={() => setActiveCategoryKey(cat.key)}
                className={`rounded-full text-xs font-medium cursor-pointer transition-all ${isActive ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t(cat.labelKey as any)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Reciters Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <span>
            {t("recitersCount", { count: filteredReciters.length })}
          </span>
          {curatedOnly && !searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
              <Sparkles className="size-3" />
              {t("curatedOnly")}
            </span>
          )}
        </div>
        {activeCategoryKey !== "all" && (
          <span className="font-medium text-foreground">
            {t(activeCategory.labelKey as any)}
          </span>
        )}
      </div>

      {/* Reciters Grid - Clean Cards Matching Quran/Juz Pages */}
      {filteredReciters.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-muted/20 rounded-3xl border border-dashed border-border max-w-xl mx-auto">
          <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="size-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            {t("noRecitersFound")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? "لم نعثر على قارئ يطابق بحثك، جرب كتابة اسم آخر أو تصفح جميع القرّاء."
              : "No reciter matches your search, try another name or browse all reciters."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveCategoryKey("all");
              setShowFullQuranOnly(false);
            }}
            className="rounded-full text-xs"
          >
            {common("clear")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReciters.map((reciter) => {
            // Pick most relevant moshaf based on active category
            const currentMoshaf =
              activeCategory.riwayaIds.length > 0
                ? reciter.moshaf.find((m) =>
                  activeCategory.riwayaIds.includes(m.rewaya_id ?? -1)
                ) || reciter.moshaf[0]
                : reciter.moshaf[0];

            const resolvedRiwayah = riwayat.find(
              (r) => r.id === currentMoshaf?.rewaya_id
            );
            const riwayaTitle = resolvedRiwayah?.name || currentMoshaf?.name || (isRtl ? "حفص عن عاصم" : "Hafs");

            const totalSurahs = currentMoshaf?.surah_total || 0;
            const isFullQuran = totalSurahs >= 114;

            const isThisReciterPlaying =
              currentReciterName === reciter.name && isPlaying;

            const targetRiwayaParam = currentMoshaf?.rewaya_id
              ? `?riwaya=${currentMoshaf.rewaya_id}`
              : "";

            return (
              <ReciterCard
                key={reciter.id}
                reciter={reciter}
                riwayaTitle={riwayaTitle}
                totalSurahs={totalSurahs}
                isFullQuran={isFullQuran}
                href={`/recitations/${reciter.id}${targetRiwayaParam}`}
                isPlaying={isThisReciterPlaying}
                onPlay={(e) =>
                  handleQuickPlay(
                    e,
                    reciter,
                    currentMoshaf?.server || "",
                    riwayaTitle
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
