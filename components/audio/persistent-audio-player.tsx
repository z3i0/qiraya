"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "./audio-context";
import { SheikhAvatar } from "./sheikh-avatar";
import { getReciterDisplayName } from "@/lib/data/reciters";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  X,
  Loader2,
  BookOpen,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { downloadAudio } from "@/lib/download";
import { cn } from "cn";
import { Surah } from "@/types/quran";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PersistentAudioPlayer() {
  const t = useTranslations("audio");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const {
    isPlaying,
    currentSurah,
    currentAyahNumber,
    currentReciterName,
    currentRiwayaName,
    currentReciterImage,
    duration,
    currentTime,
    isLooping,
    isLoading,
    currentAudioUrl,
    togglePlayPause,
    seek,
    nextTrack,
    previousTrack,
    toggleLoop,
    closePlayer,
  } = useAudio();

  const [renderedSurah, setRenderedSurah] = useState<Surah | null>(currentSurah);
  const [isVisible, setIsVisible] = useState(false);
  const isClosingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeSurah = currentSurah || renderedSurah;

  useEffect(() => {
    if (currentSurah) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      isClosingRef.current = false;
      setRenderedSurah(currentSurah);
      const timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      return () => clearTimeout(timeoutId);
    } else if (renderedSurah && !isClosingRef.current) {
      setIsVisible(false);
      isClosingRef.current = true;
      timerRef.current = setTimeout(() => {
        setRenderedSurah(null);
        isClosingRef.current = false;
      }, 300);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [currentSurah, renderedSurah]);

  const handleClose = useCallback(() => {
    if (isPlaying) {
      togglePlayPause();
    }
    setIsVisible(false);
    isClosingRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      closePlayer();
      setRenderedSurah(null);
      isClosingRef.current = false;
    }, 300);
  }, [isPlaying, togglePlayPause, closePlayer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeSurah) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[role='dialog']")
        ) {
          return;
        }
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSurah, handleClose]);

  const handleDownload = () => {
    if (!currentAudioUrl || !activeSurah) return;
    const localizedReciterName =
      getReciterDisplayName(currentReciterName, locale) || currentReciterName;

    let filename = "";
    if (currentAyahNumber !== null) {
      filename = isRtl
        ? `سورة ${activeSurah.name} - آية ${currentAyahNumber} - ${localizedReciterName}.mp3`
        : `Surah ${activeSurah.englishName} - Ayah ${currentAyahNumber} - ${localizedReciterName}.mp3`;
    } else {
      filename = isRtl
        ? `سورة ${activeSurah.name} - ${localizedReciterName}.mp3`
        : `Surah ${activeSurah.englishName} - ${localizedReciterName}.mp3`;
    }

    downloadAudio(currentAudioUrl, filename);
  };

  if (!activeSurah) return null;

  return (
    <aside
      aria-label={t("player")}
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 px-3 py-2.5 sm:px-6 sm:py-3",
        "bg-background/95 backdrop-blur-md border-t border-border shadow-2xl",
        "transform transition-all duration-300 motion-reduce:transition-none",
        isVisible
          ? "translate-y-0 opacity-100 ease-out pointer-events-auto"
          : "translate-y-full opacity-0 ease-in pointer-events-none"
      )}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-6">
        {/* Left / Start: Reciter Photo & Surah Info */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sheikh Avatar in player */}
            {(() => {
              const localizedReciterName =
                getReciterDisplayName(currentReciterName, locale) ||
                currentReciterName;
              return (
                <>
                  <SheikhAvatar
                    src={currentReciterImage}
                    name={localizedReciterName}
                    size="sm"
                    shape="circle"
                    isPlaying={isPlaying}
                    className="shrink-0"
                  />

                  <div className="flex flex-col min-w-0 text-start">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                        {isRtl ? activeSurah.name : activeSurah.englishName}
                      </span>
                      {currentAyahNumber !== null ? (
                        <span className="text-[11px] text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10 shrink-0">
                          {common("verse")} {currentAyahNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          #{activeSurah.number}
                        </span>
                      )}
                      {currentAudioUrl && (
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-full cursor-pointer shrink-0"
                          title={t("downloadAudio")}
                          aria-label={t("downloadAudio")}
                        >
                          <Download className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <span className="font-medium text-foreground/85 truncate">
                        {localizedReciterName}
                      </span>
                      {currentRiwayaName && (
                        <>
                          <span>•</span>
                          <span className="truncate opacity-80">{currentRiwayaName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Mobile Actions: Download, Read link & Close */}
          <div className="flex items-center gap-1 sm:hidden">
            {currentAudioUrl && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDownload}
                className="text-muted-foreground hover:text-foreground"
                title={t("downloadAudio")}
                aria-label={t("downloadAudio")}
              >
                <Download className="size-4" />
              </Button>
            )}
            <Link href={`/quran/${activeSurah.number}`}>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                title={t("readInMushafTitle")}
                aria-label={t("readInMushafTitle")}
              >
                <BookOpen className="size-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label={t("closePlayer")}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center w-full sm:max-w-md gap-1.5" dir="ltr">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Loop Toggle */}
            <Button
              variant={isLooping ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={toggleLoop}
              aria-label={t("loop")}
              className={`rounded-full transition-colors ${
                isLooping ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
              title={t("loop")}
            >
              <Repeat className="size-3.5" />
            </Button>

            {/* Previous Track / Surah */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={previousTrack}
              aria-label={common("previous")}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="size-4" />
            </Button>

            {/* Play / Pause */}
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading}
              aria-label={isPlaying ? common("pause") : common("play")}
              className="size-10 rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current translate-x-0.5" />
              )}
            </Button>

            {/* Next Track / Surah */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={nextTrack}
              aria-label={common("next")}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="size-4" />
            </Button>
          </div>

          {/* Progress Timeline */}
          <div className="w-full flex items-center gap-2.5 text-[11px] text-muted-foreground select-none">
            <span className="w-9 text-end font-mono tabular-nums text-foreground/80">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 px-1">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration && duration > 0 ? duration : 100}
                step={0.5}
                onValueChange={(val) => {
                  const newTime = Array.isArray(val) ? val[0] : (val as number);
                  if (typeof newTime === "number") {
                    seek(newTime);
                  }
                }}
                className="w-full cursor-pointer py-1.5"
                aria-label="Audio progress"
              />
            </div>
            <span className="w-9 text-start font-mono tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right / End: Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {currentAudioUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-xs gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
              title={t("downloadAudio")}
            >
              <Download className="size-3.5" />
              <span>{common("download")}</span>
            </Button>
          )}

          <Link href={`/quran/${activeSurah.number}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
              title={t("readInMushafTitle")}
              aria-label={t("readInMushafTitle")}
            >
              <BookOpen className="size-3.5" />
              <span>{t("readInMushaf")}</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground rounded-full"
            aria-label={t("closePlayer")}
            title={t("closePlayer")}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
