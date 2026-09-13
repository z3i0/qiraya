"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Ayah } from "@/types/quran";
import { Sparkles, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

interface VerseOfDayProps {
  dailyVerseData: { arabic: Ayah; translation?: Ayah } | null;
}

export function VerseOfDay({ dailyVerseData }: VerseOfDayProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [verseData, setVerseData] = useState(dailyVerseData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (dailyVerseData) {
      setVerseData(dailyVerseData);
    }
  }, [dailyVerseData]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/random-verse?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.arabic) {
          setIsFading(true);
          setTimeout(() => {
            setVerseData(data);
            setIsFading(false);
          }, 150);
        }
      }
    } catch (err) {
      console.error("Failed to fetch random verse:", err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 300);
    }
  };

  if (!verseData) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 p-6 sm:p-10 shadow-xs transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-foreground">
              {t("verseOfTheDay")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("verseOfTheDayDesc")}
            </p>
          </div>
        </div>

        {/* Badges & Refresh Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {verseData.arabic.surah && (
            <Badge
              variant="outline"
              className="text-xs font-mono border-primary/30 text-primary bg-primary/5 px-3 py-1 rounded-full"
            >
              {isRtl
                ? verseData.arabic.surah.name
                : verseData.arabic.surah.englishName}{" "}
              ({verseData.arabic.numberInSurah})
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={t("refreshVerse")}
            aria-label={t("refreshVerse")}
            className="h-7 px-2.5 gap-1.5 text-xs rounded-full border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
          >
            <RotateCw
              className={cn(
                "size-3.5 transition-transform duration-500",
                isRefreshing && "animate-spin text-primary"
              )}
            />
            <span className="hidden xs:inline text-[11px] font-medium">
              {t("refreshVerse")}
            </span>
          </Button>
        </div>
      </div>

      {/* Content with smooth fade */}
      <div
        className={cn(
          "transition-opacity duration-200",
          isFading ? "opacity-20 scale-[0.99]" : "opacity-100 scale-100"
        )}
      >
        {/* Arabic Verse */}
        <div dir="rtl" className="text-center py-4 sm:py-6 max-w-4xl mx-auto">
          <p className="font-quran text-2xl sm:text-3xl lg:text-4xl leading-loose sm:leading-loose text-foreground select-text">
            {verseData.arabic.text}
            <span className="ayah-symbol inline-block text-primary/80 ms-2">
              ۝
              <span className="text-[0.65em] font-mono px-1 text-foreground">
                {verseData.arabic.numberInSurah}
              </span>
            </span>
          </p>
        </div>

        {/* Translation (if available) */}
        {verseData.translation && (
          <div
            dir="ltr"
            className="mt-4 pt-4 border-t border-border/40 text-center max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed italic"
          >
            <p>&ldquo;{verseData.translation.text}&rdquo;</p>
          </div>
        )}

        {verseData.arabic.surah && (
          <div className="mt-6 flex justify-center">
            <Link href={`/quran/${verseData.arabic.surah.number}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-xs text-primary hover:text-primary/90 rounded-full"
              >
                <span>{t("readInSurah")}</span>
                {isRtl ? (
                  <ArrowLeft className="size-3.5" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
