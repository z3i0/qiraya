"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { SurahDetail, Ayah } from "@/types/quran";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAudio, AudioAyahItem } from "@/components/audio/audio-context";
import { useQirayaStorage } from "@/hooks/use-local-storage";
import { sanitizeAyahText } from "@/lib/api/quran-cloud";
import { ReadingSettingsDialog } from "./reading-settings-dialog";
import {
  getReciterAudioUrl,
  resolveReciter,
  getReciterDisplayName,
} from "@/lib/data/reciters";
import { downloadAudio } from "@/lib/download";
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
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SurahReaderProps {
  surahArabic: SurahDetail;
  surahTranslation?: SurahDetail;
  totalSurahs?: number;
}

export function SurahReader({
  surahArabic,
  surahTranslation,
  totalSurahs = 114,
}: SurahReaderProps) {
  const t = useTranslations("reader");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const {
    settings,
    updateSettings,
    toggleBookmark,
    isAyahBookmarked,
    saveLastRead,
  } = useQirayaStorage();

  const {
    playAyah,
    isPlaying,
    currentSurah,
    currentAyahNumber,
    togglePlayPause,
  } = useAudio();

  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Resolved reciter info from user settings
  const currentReciterInfo = useMemo(
    () => resolveReciter(settings.audioReciter),
    [settings.audioReciter]
  );

  // Pre-generate full ayah audio playlist for instant zero-latency playback
  const ayahsAudioPlaylist: AudioAyahItem[] = useMemo(() => {
    if (!surahArabic.ayahs) return [];
    return surahArabic.ayahs.map((a) => ({
      ayahNumberInSurah: a.numberInSurah,
      audioUrl: `https://cdn.islamic.network/quran/audio/128/${currentReciterInfo.editionId}/${a.number}.mp3`,
    }));
  }, [surahArabic.ayahs, currentReciterInfo.editionId]);

  const handleTogglePlayAyah = useCallback(
    (ayahNum: number) => {
      const isRecitingThis =
        currentSurah?.number === surahArabic.number &&
        currentAyahNumber === ayahNum;

      if (isRecitingThis) {
        togglePlayPause();
      } else {
        const target = ayahsAudioPlaylist.find(
          (p) => p.ayahNumberInSurah === ayahNum
        );
        const directUrl =
          target?.audioUrl ||
          `https://cdn.islamic.network/quran/audio/128/${currentReciterInfo.editionId}/${
            surahArabic.ayahs.find((a) => a.numberInSurah === ayahNum)?.number ||
            ayahNum
          }.mp3`;
        playAyah(surahArabic, ayahNum, directUrl, ayahsAudioPlaylist);
      }
    },
    [
      currentSurah,
      currentAyahNumber,
      surahArabic,
      ayahsAudioPlaylist,
      currentReciterInfo.editionId,
      togglePlayPause,
      playAyah,
    ]
  );

  // Record last read when opening or scrolling
  useEffect(() => {
    saveLastRead(surahArabic, 1);
  }, [surahArabic, saveLastRead]);

  // Scroll to reciting ayah if it changes
  useEffect(() => {
    if (
      currentSurah?.number === surahArabic.number &&
      currentAyahNumber !== null
    ) {
      const el = ayahRefs.current.get(currentAyahNumber);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        saveLastRead(surahArabic, currentAyahNumber);
      }
    }
  }, [currentSurah, currentAyahNumber, surahArabic, saveLastRead]);

  const handleCopy = (ayah: Ayah) => {
    const textToCopy = sanitizeAyahText(
      ayah.text,
      surahArabic.number,
      ayah.numberInSurah
    );
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAyah(ayah.numberInSurah);
      setTimeout(() => setCopiedAyah(null), 2000);
    });
  };

  const handleDownloadSurah = () => {
    const info = resolveReciter(settings.audioReciter);
    let url = getReciterAudioUrl(info.numericId, surahArabic.number);
    if (!url) {
      url = `https://cdn.islamic.network/quran/audio/128/${info.editionId}/${surahArabic.ayahs[0]?.number || 1}.mp3`;
    }
    const localizedReciterName =
      getReciterDisplayName(info.numericId, locale) || info.nameArabic;
    const filename = isRtl
      ? `سورة ${surahArabic.name} - ${localizedReciterName}.mp3`
      : `Surah ${surahArabic.englishName} - ${localizedReciterName}.mp3`;

    downloadAudio(url, filename);
  };

  const handleDownloadAyah = (ayahNum: number) => {
    const info = resolveReciter(settings.audioReciter);
    const targetAyah = surahArabic.ayahs.find((a) => a.numberInSurah === ayahNum);
    if (!targetAyah) return;
    const url = `https://cdn.islamic.network/quran/audio/128/${info.editionId}/${targetAyah.number}.mp3`;
    const localizedReciterName =
      getReciterDisplayName(info.numericId, locale) || info.nameArabic;
    const filename = isRtl
      ? `سورة ${surahArabic.name} - آية ${ayahNum} - ${localizedReciterName}.mp3`
      : `Surah ${surahArabic.englishName} - Ayah ${ayahNum} - ${localizedReciterName}.mp3`;

    downloadAudio(url, filename);
  };

  const hasBismillah =
    surahArabic.number !== 1 && surahArabic.number !== 9;

  const prevSurahNum = surahArabic.number > 1 ? surahArabic.number - 1 : null;
  const nextSurahNum =
    surahArabic.number < totalSurahs ? surahArabic.number + 1 : null;

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Header & Navigation Banner */}
      <header className="flex flex-col items-center text-center mb-8 sm:mb-12 border-b border-border/80 pb-8">
        <div className="flex items-center justify-between w-full mb-6">
          {prevSurahNum ? (
            <Link href={`/quran/${prevSurahNum}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {isRtl ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
                <span>{t("previousSurah")}</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <ReadingSettingsDialog
              settings={settings}
              onUpdateSettings={updateSettings}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSurah}
              className="gap-1.5 text-xs font-medium border-border"
              title={t("downloadSurah")}
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">{t("downloadSurah")}</span>
              <span className="sm:hidden">{common("download")}</span>
            </Button>
          </div>

          {nextSurahNum ? (
            <Link href={`/quran/${nextSurahNum}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>{t("nextSurah")}</span>
                {isRtl ? (
                  <ChevronLeft className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Surah Title Frame */}
        <div className="relative inline-flex flex-col items-center py-6 px-8 sm:px-14 rounded-2xl bg-card border border-border shadow-xs w-full max-w-lg">
          <Badge
            variant="secondary"
            className="mb-3 text-xs font-mono font-normal tracking-wide px-3 py-1"
          >
            {isRtl
              ? surahArabic.revelationType === "Meccan"
                ? common("meccan")
                : common("medinan")
              : surahArabic.revelationType}{" "}
            • {surahArabic.numberOfAyahs} {common("verses")}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-arabic font-bold text-foreground mb-2">
            {surahArabic.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            {surahArabic.englishName} • {surahArabic.englishNameTranslation}
          </p>
        </div>

        {/* Bismillah */}
        {hasBismillah && (
          <div className="mt-8 text-center" dir="rtl">
            <p className="font-quran text-2xl sm:text-3xl text-primary font-medium opacity-90 select-none">
              {t("bismillah")}
            </p>
          </div>
        )}
      </header>

      {/* Reading Flow: Mode Verse-by-Verse */}
      {settings.readingMode === "verse" ? (
        <section className="space-y-4 sm:space-y-6">
          {surahArabic.ayahs.map((ayah, index) => {
            const translationAyah = surahTranslation?.ayahs?.[index];
            const isRecitingThis =
              currentSurah?.number === surahArabic.number &&
              currentAyahNumber === ayah.numberInSurah;
            const bookmarked = isAyahBookmarked(
              surahArabic.number,
              ayah.numberInSurah
            );

            return (
              <div
                key={ayah.number}
                ref={(el) => {
                  if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                  else ayahRefs.current.delete(ayah.numberInSurah);
                }}
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
                      {surahArabic.number}:{ayah.numberInSurah}
                    </span>
                    {ayah.juz && (
                      <span className="hidden sm:inline">
                        {t("juzAyah", { juz: ayah.juz })}
                      </span>
                    )}
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

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                    {/* Play Ayah */}
                    <Button
                      variant={isRecitingThis && isPlaying ? "default" : "ghost"}
                      size="icon-xs"
                      onClick={() => handleTogglePlayAyah(ayah.numberInSurah)}
                      className="rounded-full"
                      aria-label={t("playAyah")}
                      title={t("playAyah")}
                    >
                      {isRecitingThis && isPlaying ? (
                        <Pause className="size-3.5 fill-current" />
                      ) : (
                        <Play className="size-3.5 fill-current" />
                      )}
                    </Button>

                    {/* Bookmark */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        toggleBookmark(
                          surahArabic,
                          ayah,
                          translationAyah?.text
                        )
                      }
                      className={`rounded-full ${
                        bookmarked ? "text-primary" : "text-muted-foreground"
                      }`}
                      aria-label={
                        bookmarked ? t("removeBookmark") : t("bookmark")
                      }
                      title={bookmarked ? t("removeBookmark") : t("bookmark")}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="size-3.5 fill-current" />
                      ) : (
                        <Bookmark className="size-3.5" />
                      )}
                    </Button>

                    {/* Copy */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleCopy(ayah)}
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      aria-label={t("copyAyah")}
                      title={t("copyAyah")}
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>

                    {/* Download Ayah Audio */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDownloadAyah(ayah.numberInSurah)}
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      aria-label={t("downloadAyah")}
                      title={t("downloadAyah")}
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Arabic Quran Verse Text */}
                <div dir="rtl" className="text-start py-2">
                  <p
                    style={{
                      fontSize: `${settings.arabicFontSize}px`,
                      lineHeight: 2.2,
                    }}
                    className="font-quran text-foreground select-text"
                  >
                    {sanitizeAyahText(ayah.text, surahArabic.number, ayah.numberInSurah)}
                    <span className="ayah-symbol">
                      ۝
                      <span className="text-[0.65em] font-mono font-normal align-middle px-1">
                        {ayah.numberInSurah}
                      </span>
                    </span>
                  </p>
                </div>

                {/* Translation Text (if enabled) */}
                {settings.showTranslation && translationAyah?.text && (
                  <div
                    dir="ltr"
                    className="mt-3 pt-3 border-t border-border/30 text-start text-muted-foreground text-sm sm:text-base leading-relaxed"
                  >
                    <p>{translationAyah.text}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ) : (
        /* Reading Flow: Mode Continuous Mushaf */
        <section className="p-6 sm:p-10 rounded-2xl bg-card border border-border shadow-xs">
          <div
            dir="rtl"
            style={{
              fontSize: `${settings.arabicFontSize}px`,
              lineHeight: 2.4,
            }}
            className="font-quran text-foreground text-justify"
          >
            {surahArabic.ayahs.map((ayah) => {
              const isRecitingThis =
                currentSurah?.number === surahArabic.number &&
                currentAyahNumber === ayah.numberInSurah;

              return (
                <span
                  key={ayah.number}
                  ref={(el) => {
                    if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                    else ayahRefs.current.delete(ayah.numberInSurah);
                  }}
                  className={`cursor-pointer transition-colors rounded-sm px-1 py-0.5 ${
                    isRecitingThis
                      ? "bg-primary/20 text-primary font-medium"
                      : "hover:bg-muted/60"
                  }`}
                  onClick={() => handleTogglePlayAyah(ayah.numberInSurah)}
                  title={`${surahArabic.name} (${ayah.numberInSurah})`}
                >
                  {sanitizeAyahText(ayah.text, surahArabic.number, ayah.numberInSurah)}
                  <span className="ayah-symbol">
                    ۝
                    <span className="text-[0.65em] font-mono px-0.5">
                      {ayah.numberInSurah}
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom Previous / Next Surah Navigation */}
      <footer className="flex items-center justify-between pt-10 mt-10 border-t border-border">
        {prevSurahNum ? (
          <Link href={`/quran/${prevSurahNum}`}>
            <Button variant="outline" className="gap-2">
              {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              <span>{t("previousSurah")}</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextSurahNum && (
          <Link href={`/quran/${nextSurahNum}`}>
            <Button variant="outline" className="gap-2">
              <span>{t("nextSurah")}</span>
              {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
          </Link>
        )}
      </footer>
    </article>
  );
}
