"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useQirayaStorage } from "@/hooks/use-local-storage";
import { useAudio } from "@/components/audio/audio-context";
import {
  Bookmark,
  Trash2,
  Play,
  Copy,
  Check,
  Compass,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BookmarksManager() {
  const t = useTranslations("bookmarks");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const { bookmarks, removeBookmark, clearBookmarks, isLoaded } =
    useQirayaStorage();
  const { playAyah } = useAudio();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatDate = (timestamp: number) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(timestamp));
    } catch {
      return "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="text-center sm:text-start">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm(t("clearConfirm"))) {
                clearBookmarks();
              }
            }}
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5 me-1.5" />
            <span>{t("clearAll")}</span>
          </Button>
        )}
      </header>

      {/* Bookmarks List or Empty State */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-20 space-y-4 border border-dashed border-border/80 rounded-3xl p-8">
          <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Bookmark className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground">
              {t("emptyTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {t("emptyDesc")}
            </p>
          </div>
          <Link href="/quran">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground mt-2">
              <Compass className="size-4" />
              <span>{t("startReading")}</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => (
            <Card
              key={b.id}
              className="p-5 sm:p-6 hover:border-primary/40 transition-all space-y-4"
            >
              {/* Verse Header & Actions */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {isRtl ? b.surahNameArabic : b.surahNameEnglish} • {b.surahNumber}:{b.ayahNumber}
                  </Badge>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3" />
                    <span>{formatDate(b.dateAdded)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Play Verse Audio */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      playAyah(
                        {
                          number: b.surahNumber,
                          name: b.surahNameArabic,
                          englishName: b.surahNameEnglish,
                          englishNameTranslation: "",
                          numberOfAyahs: 0,
                          revelationType: "Meccan",
                        },
                        b.ayahNumber
                      )
                    }
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    title={common("play")}
                  >
                    <Play className="size-3.5 fill-current" />
                  </Button>

                  {/* Copy */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleCopy(b.id, b.textArabic)}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                    title={common("copy")}
                  >
                    {copiedId === b.id ? (
                      <Check className="size-3.5 text-primary" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>

                  {/* Open in Reader */}
                  <Link href={`/quran/${b.surahNumber}`}>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      title={t("goToSurah")}
                    >
                      <Compass className="size-3.5" />
                    </Button>
                  </Link>

                  {/* Remove Bookmark */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeBookmark(b.id)}
                    className="rounded-full text-muted-foreground hover:text-destructive"
                    title={common("clear")}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Arabic Verse Text */}
              <div dir="rtl" className="text-start py-1">
                <p className="font-quran text-xl sm:text-2xl leading-loose text-foreground select-text">
                  {b.textArabic}
                  <span className="ayah-symbol">
                    ۝
                    <span className="text-[0.65em] font-mono px-1">
                      {b.ayahNumber}
                    </span>
                  </span>
                </p>
              </div>

              {/* Translation Text (if available) */}
              {b.textTranslation && (
                <div dir="ltr" className="pt-2 border-t border-border/30 text-start text-sm text-muted-foreground leading-relaxed">
                  <p>{b.textTranslation}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
