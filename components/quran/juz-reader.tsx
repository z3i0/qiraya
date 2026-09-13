"use client";

import React, { useState } from "react";
import { JuzData, Ayah } from "@/types/quran";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAudio } from "@/components/audio/audio-context";
import { useQirayaStorage } from "@/hooks/use-local-storage";
import { sanitizeAyahText } from "@/lib/api/quran-cloud";
import { ReadingSettingsDialog } from "./reading-settings-dialog";
import {
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JuzReaderProps {
  juzArabic: JuzData;
  juzTranslation?: JuzData;
}

export function JuzReader({ juzArabic, juzTranslation }: JuzReaderProps) {
  const t = useTranslations("reader");
  const j = useTranslations("juz");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const {
    settings,
    updateSettings,
    toggleBookmark,
    isAyahBookmarked,
  } = useQirayaStorage();

  const {
    playAyah,
    isPlaying,
    currentSurah,
    currentAyahNumber,
    togglePlayPause,
  } = useAudio();

  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  const handleCopy = (ayah: Ayah, surahNumber = 1) => {
    const textToCopy = sanitizeAyahText(ayah.text, surahNumber, ayah.numberInSurah);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAyah(ayah.number);
      setTimeout(() => setCopiedAyah(null), 2000);
    });
  };

  const prevJuzNum = juzArabic.number > 1 ? juzArabic.number - 1 : null;
  const nextJuzNum = juzArabic.number < 30 ? juzArabic.number + 1 : null;

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Header */}
      <header className="flex flex-col items-center text-center mb-8 sm:mb-12 border-b border-border/80 pb-8">
        <div className="flex items-center justify-between w-full mb-6">
          {prevJuzNum ? (
            <Link href={`/juz/${prevJuzNum}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                <span>{j("previousJuz")}</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <ReadingSettingsDialog
            settings={settings}
            onUpdateSettings={updateSettings}
          />

          {nextJuzNum ? (
            <Link href={`/juz/${nextJuzNum}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>{j("nextJuz")}</span>
                {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="relative inline-flex flex-col items-center py-6 px-8 sm:px-14 rounded-2xl bg-card border border-border shadow-xs w-full max-w-lg">
          <Badge
            variant="secondary"
            className="mb-3 text-xs font-mono font-normal tracking-wide px-3 py-1"
          >
            {juzArabic.ayahs.length} {common("verses")}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-arabic font-bold text-foreground mb-2">
            {j("juzTitle", { number: juzArabic.number })}
          </h1>
        </div>
      </header>

      {/* Verses Flow */}
      <section className="space-y-4 sm:space-y-6">
        {juzArabic.ayahs.map((ayah, index) => {
          const translationAyah = juzTranslation?.ayahs?.[index];
          const surah = ayah.surah!;
          const isRecitingThis =
            currentSurah?.number === surah?.number &&
            currentAyahNumber === ayah.numberInSurah;
          const bookmarked = surah
            ? isAyahBookmarked(surah.number, ayah.numberInSurah)
            : false;

          // Check if this verse is the start of a new surah
          const isFirstVerseOfSurah = ayah.numberInSurah === 1;

          return (
            <React.Fragment key={ayah.number}>
              {/* Surah Header if new surah starts in this juz */}
              {isFirstVerseOfSurah && surah && (
                <div className="pt-8 pb-4 text-center">
                  <div className="inline-flex flex-col items-center px-6 py-4 rounded-xl bg-card border border-border">
                    <h2 className="text-xl sm:text-2xl font-arabic font-bold text-foreground">
                      {surah.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {surah.englishName} ({surah.englishNameTranslation})
                    </p>
                  </div>
                  {surah.number !== 1 && surah.number !== 9 && (
                    <p className="font-quran text-xl text-primary font-medium mt-4 select-none" dir="rtl">
                      {t("bismillah")}
                    </p>
                  )}
                </div>
              )}

              <div
                className={`group relative p-4 sm:p-6 rounded-2xl transition-all duration-200 border ${
                  isRecitingThis
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/30 shadow-sm"
                    : "bg-card/60 hover:bg-card border-border/60 hover:border-border"
                }`}
              >
                {/* Verse Header Actions */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-foreground px-2 py-0.5 rounded-md bg-muted/60">
                      {surah?.englishName || "Surah"}{" "}
                      {surah?.number}:{ayah.numberInSurah}
                    </span>
                    {ayah.sajda && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-primary border-primary/30 bg-primary/5"
                      >
                        <Sparkles className="size-2.5 me-1" />
                        {t("sajdaNotice")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                    {/* Play Ayah */}
                    {surah && (
                      <Button
                        variant={isRecitingThis && isPlaying ? "default" : "ghost"}
                        size="icon-xs"
                        onClick={() => {
                          if (isRecitingThis) {
                            togglePlayPause();
                          } else {
                            playAyah(surah, ayah.numberInSurah);
                          }
                        }}
                        className="rounded-full"
                        aria-label={t("playAyah")}
                      >
                        {isRecitingThis && isPlaying ? (
                          <Pause className="size-3.5 fill-current" />
                        ) : (
                          <Play className="size-3.5 fill-current" />
                        )}
                      </Button>
                    )}

                    {/* Bookmark */}
                    {surah && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          toggleBookmark(surah, ayah, translationAyah?.text)
                        }
                        className={`rounded-full ${
                          bookmarked ? "text-primary" : "text-muted-foreground"
                        }`}
                        aria-label={bookmarked ? t("removeBookmark") : t("bookmark")}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="size-3.5 fill-current" />
                        ) : (
                          <Bookmark className="size-3.5" />
                        )}
                      </Button>
                    )}

                    {/* Copy */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleCopy(ayah, surah?.number ?? 1)}
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      aria-label={t("copyAyah")}
                    >
                      {copiedAyah === ayah.number ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div dir="rtl" className="text-start py-2">
                  <p
                    style={{
                      fontSize: `${settings.arabicFontSize}px`,
                      lineHeight: 2.2,
                    }}
                    className="font-quran text-foreground select-text"
                  >
                    {sanitizeAyahText(ayah.text, surah?.number ?? 1, ayah.numberInSurah)}
                    <span className="ayah-symbol">
                      ۝
                      <span className="text-[0.65em] font-mono px-1">
                        {ayah.numberInSurah}
                      </span>
                    </span>
                  </p>
                </div>

                {/* Translation Text */}
                {settings.showTranslation && translationAyah?.text && (
                  <div
                    dir="ltr"
                    className="mt-3 pt-3 border-t border-border/30 text-start text-muted-foreground text-sm sm:text-base leading-relaxed"
                  >
                    <p>{translationAyah.text}</p>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </section>

      {/* Footer Navigation */}
      <footer className="flex items-center justify-between pt-10 mt-10 border-t border-border">
        {prevJuzNum ? (
          <Link href={`/juz/${prevJuzNum}`}>
            <Button variant="outline" className="gap-2">
              {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              <span>{j("previousJuz")}</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextJuzNum && (
          <Link href={`/juz/${nextJuzNum}`}>
            <Button variant="outline" className="gap-2">
              <span>{j("nextJuz")}</span>
              {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
          </Link>
        )}
      </footer>
    </article>
  );
}
